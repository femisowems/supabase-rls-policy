import { LogicTreeNode, SimulationResult, UserContext } from '@/store/useStore';

type PgQueryModule = {
  parse(sql: string): {
    parse_tree?: {
      stmts?: Array<{
        stmt?: {
          SelectStmt?: {
            whereClause?: unknown;
          };
        };
      }>;
    };
  };
};

type EvalResult = {
  value: unknown;
  node: LogicTreeNode;
  trace: Record<string, unknown>;
  unsupported: boolean;
};

let parserPromise: Promise<PgQueryModule> | null = null;
let nodeId = 0;

async function getParser(): Promise<PgQueryModule> {
  if (!parserPromise) {
    parserPromise = import('pg-query-emscripten').then((module) => new module.default() as PgQueryModule);
  }

  return parserPromise;
}

function nextId(prefix: string) {
  nodeId += 1;
  return `${prefix}-${nodeId}`;
}

function createNode(
  label: string,
  kind: LogicTreeNode['kind'],
  outcome: boolean | null,
  value: unknown = undefined,
  children: LogicTreeNode[] = []
): LogicTreeNode {
  return {
    id: nextId(kind),
    label,
    kind,
    outcome,
    value,
    children,
  };
}

function normalizeText(value: unknown): string {
  if (value === null) return 'NULL';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getObjectKey(path: string[]): string {
  return path[path.length - 1] ?? '';
}

function extractUsingExpression(policy: string): string | null {
  const usingMatch = /\bUSING\s*\(/i.exec(policy);
  if (!usingMatch) return null;

  const openParenIndex = policy.indexOf('(', usingMatch.index);
  if (openParenIndex === -1) return null;

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = openParenIndex; index < policy.length; index += 1) {
    const char = policy[index];
    const previous = policy[index - 1];

    if (char === "'" && !inDoubleQuote && previous !== '\\') {
      if (inSingleQuote && policy[index + 1] === "'") {
        index += 1;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote && previous !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (inSingleQuote || inDoubleQuote) continue;

    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return policy.slice(openParenIndex + 1, index).trim();
      }
    }
  }

  return null;
}

function parseConst(node: any): unknown {
  if (!node || typeof node !== 'object') return undefined;

  if ('sval' in node) {
    return node.sval?.sval ?? node.sval ?? undefined;
  }

  if ('ival' in node) {
    return typeof node.ival === 'string' ? Number(node.ival) : node.ival;
  }

  if ('fval' in node) {
    return typeof node.fval === 'string' ? Number(node.fval) : node.fval;
  }

  if ('boolval' in node) {
    return Boolean(node.boolval);
  }

  if ('isnull' in node && node.isnull) {
    return null;
  }

  return undefined;
}

function getFuncName(funcname: unknown): string {
  if (!Array.isArray(funcname)) return '';

  return funcname
    .map((part) => {
      if (isObject(part) && 'String' in part) {
        return (part as any).String?.sval ?? '';
      }
      return '';
    })
    .filter(Boolean)
    .join('.');
}

function getTypeName(typeName: unknown): string {
  const names = (typeName as any)?.names;
  if (!Array.isArray(names)) return '';

  return names
    .map((part) => {
      if (isObject(part) && 'String' in part) {
        return (part as any).String?.sval ?? '';
      }
      return '';
    })
    .filter(Boolean)
    .join('.');
}

function compare(left: unknown, operator: string, right: unknown): boolean {
  switch (operator) {
    case '=':
      return left === right;
    case '!=':
    case '<>':
      return left !== right;
    case '>':
      return Number(left) > Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<':
      return Number(left) < Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '~~':
      return String(left).includes(String(right));
    case '!~~':
      return !String(left).includes(String(right));
    default:
      return false;
  }
}

function evaluateNode(node: any, userContext: UserContext, rowData: Record<string, unknown>): EvalResult {
  if (!node || typeof node !== 'object') {
    return {
      value: undefined,
      node: createNode('unknown', 'unknown', null),
      trace: {},
      unsupported: true,
    };
  }

  if (node.BoolExpr) {
    const boolExpr = node.BoolExpr;
    const children: EvalResult[] = (boolExpr.args ?? []).map((child: any) => evaluateNode(child, userContext, rowData));
    const childNodes = children.map((child: EvalResult) => child.node);
    const unsupported = children.some((child: EvalResult) => child.unsupported);
    const childValues = children.map((child: EvalResult) => Boolean(child.value));

    let value = false;
    if (boolExpr.boolop === 'AND_EXPR') {
      value = childValues.every(Boolean);
    } else if (boolExpr.boolop === 'OR_EXPR') {
      value = childValues.some(Boolean);
    } else if (boolExpr.boolop === 'NOT_EXPR') {
      value = !childValues[0];
    }

    const trace: Record<string, unknown> = {};
    for (const child of children) {
      Object.assign(trace, child.trace);
    }

    return {
      value,
      node: createNode(boolExpr.boolop.replace('_EXPR', ''), 'logic', value, undefined, childNodes),
      trace,
      unsupported,
    };
  }

  if (node.A_Expr) {
    const expr = node.A_Expr;
    const operator = expr.name?.map((part: any) => part?.String?.sval ?? '').filter(Boolean).join('') ?? '';

    const left = evaluateNode(expr.lexpr, userContext, rowData);
    const right = evaluateNode(expr.rexpr, userContext, rowData);
    const unsupported = left.unsupported || right.unsupported;

    let value: unknown = undefined;

    if (operator === '->' || operator === '->>') {
      const source = isObject(left.value) ? left.value : undefined;
      const key = normalizeText(right.value).replace(/^['"]|['"]$/g, '');
      const nextValue = source ? source[key] : undefined;
      value = operator === '->>' ? normalizeText(nextValue) : nextValue;
    } else {
      value = compare(left.value, operator, right.value);
    }

    const label = operator || 'expr';
    return {
      value,
      node: createNode(label, 'comparison', typeof value === 'boolean' ? value : null, undefined, [left.node, right.node]),
      trace: {
        ...left.trace,
        ...right.trace,
      },
      unsupported,
    };
  }

  if (node.FuncCall) {
    const funcName = getFuncName(node.FuncCall.funcname);
    const args: EvalResult[] = (node.FuncCall.args ?? []).map((child: any) => evaluateNode(child, userContext, rowData));
    const childNodes = args.map((arg: EvalResult) => arg.node);
    const unsupported = args.some((arg: EvalResult) => arg.unsupported);
    const argValues = args.map((arg: EvalResult) => arg.value);

    if (funcName === 'auth.uid') {
      const value = userContext.uid;
      return {
        value,
        node: createNode('auth.uid()', 'function', null, value, childNodes),
        trace: { 'auth.uid()': value },
        unsupported,
      };
    }

    if (funcName === 'auth.role') {
      const value = userContext.role;
      return {
        value,
        node: createNode('auth.role()', 'function', null, value, childNodes),
        trace: { 'auth.role()': value },
        unsupported,
      };
    }

    if (funcName === 'auth.jwt') {
      const value = { ...userContext.claims, ...userContext.jwt };
      return {
        value,
        node: createNode('auth.jwt()', 'function', null, value, childNodes),
        trace: { 'auth.jwt()': value },
        unsupported,
      };
    }

    if (funcName === 'coalesce') {
      const value = argValues.find((entry) => entry !== null && entry !== undefined);
      return {
        value,
        node: createNode('coalesce()', 'function', null, value, childNodes),
        trace: {},
        unsupported,
      };
    }

    if (funcName === 'lower' || funcName === 'upper' || funcName === 'trim') {
      const source = normalizeText(argValues[0] ?? '');
      const value = funcName === 'lower' ? source.toLowerCase() : funcName === 'upper' ? source.toUpperCase() : source.trim();
      return {
        value,
        node: createNode(`${funcName}()`, 'function', null, value, childNodes),
        trace: {},
        unsupported,
      };
    }

    if (funcName === 'length') {
      const value = normalizeText(argValues[0] ?? '').length;
      return {
        value,
        node: createNode('length()', 'function', null, value, childNodes),
        trace: {},
        unsupported,
      };
    }

    return {
      value: undefined,
      node: createNode(funcName ? `${funcName}()` : 'function', 'function', null, undefined, childNodes),
      trace: {},
      unsupported: true,
    };
  }

  if (node.A_Const) {
    const value = parseConst(node.A_Const);
    return {
      value,
      node: createNode(normalizeText(value), value === null ? 'null' : 'literal', null, value),
      trace: {},
      unsupported: false,
    };
  }

  if (node.ColumnRef) {
    const fields = node.ColumnRef.fields
      ?.map((part: any) => (part?.A_Star ? '*' : part?.String?.sval ?? ''))
      .filter(Boolean) ?? [];
    const key = getObjectKey(fields as string[]);
    const value = key in rowData ? rowData[key] : rowData[key.toLowerCase()];
    return {
      value,
      node: createNode(key || 'column', 'column', null, value),
      trace: key ? { [key]: value } : {},
      unsupported: false,
    };
  }

  if (node.TypeCast) {
    const inner = evaluateNode(node.TypeCast.arg, userContext, rowData);
    const typeName = getTypeName(node.TypeCast.typeName);
    let value = inner.value;

    if (typeName === 'uuid' || typeName === 'text' || typeName === 'varchar' || typeName === 'jsonb' || typeName === 'json') {
      value = value === null || value === undefined ? value : normalizeText(value);
    } else if (typeName === 'boolean') {
      value = Boolean(value);
    } else if (typeName === 'int4' || typeName === 'integer' || typeName === 'int8' || typeName === 'numeric') {
      value = Number(value);
    }

    return {
      value,
      node: createNode(typeName ? `::${typeName}` : 'cast', 'cast', null, value, [inner.node]),
      trace: inner.trace,
      unsupported: inner.unsupported,
    };
  }

  if (node.NullTest) {
    const inner = evaluateNode(node.NullTest.arg, userContext, rowData);
    const isNull = inner.value === null || inner.value === undefined;
    const value = node.NullTest.nulltesttype === 'IS_NOT_NULL' ? !isNull : isNull;
    return {
      value,
      node: createNode(node.NullTest.nulltesttype === 'IS_NOT_NULL' ? 'IS NOT NULL' : 'IS NULL', 'null', value, undefined, [inner.node]),
      trace: inner.trace,
      unsupported: inner.unsupported,
    };
  }

  if (node.SubLink) {
    return {
      value: false,
      node: createNode('subquery', 'unknown', false),
      trace: {},
      unsupported: true,
    };
  }

  const keys = Object.keys(node);
  return {
    value: undefined,
    node: createNode(keys[0] ?? 'unknown', 'unknown', null),
    trace: {},
    unsupported: true,
  };
}

function getWhereClause(parseTree: any): any {
  return parseTree?.stmts?.[0]?.stmt?.SelectStmt?.whereClause ?? null;
}

export async function evaluatePolicy(
  policy: string,
  userContext: UserContext,
  rowData: Record<string, unknown>
): Promise<SimulationResult> {
  const expression = extractUsingExpression(policy);

  if (!expression) {
    return {
      allowed: false,
      reason: 'No valid USING clause found in the policy.',
      evaluatedExpression: policy,
      evaluatedValues: {},
      parseError: 'Unable to locate a USING (...) clause.',
    };
  }

  let parsed: any = null;
  try {
    const parser = await getParser();
    parsed = parser.parse(`SELECT * FROM rls_simulator WHERE ${expression}`);
  } catch (error) {
    return {
      allowed: false,
      reason: `Parse Error: ${(error as Error).message}`,
      evaluatedExpression: expression,
      evaluatedValues: {},
      parseError: (error as Error).message,
    };
  }

  const whereClause = getWhereClause(parsed.parse_tree);
  if (!whereClause) {
    return {
      allowed: false,
      reason: 'The policy parsed successfully, but no WHERE clause was produced.',
      evaluatedExpression: expression,
      evaluatedValues: {},
      ast: parsed.parse_tree,
      parseError: 'Parser did not yield a WHERE clause.',
    };
  }

  nodeId = 0;
  const result = evaluateNode(whereClause, userContext, rowData);
  const allowed = Boolean(result.value) && !result.unsupported;

  return {
    allowed,
    reason: result.unsupported
      ? 'The policy parsed successfully, but part of the expression uses SQL constructs that are not simulated yet.'
      : allowed
        ? 'Access granted based on the policy condition.'
        : 'Access denied. The condition evaluated to false.',
    evaluatedExpression: expression,
    evaluatedValues: result.trace,
    ast: parsed.parse_tree,
    logicTree: result.node,
    parseError: result.unsupported ? 'Policy contains SQL features that are parsed but not fully simulated.' : undefined,
  };
}

export type ExplanationInsight = {
  type: 'success' | 'failure' | 'info' | 'warning';
  message: string;
};

export function generateExplanation(result: SimulationResult, policyName: string): ExplanationInsight[] {
  if (!result) return [];

  const { allowed, evaluatedValues, logicTree, parseError } = result;
  const insights: ExplanationInsight[] = [];

  // 1. Overall Status with Definition
  insights.push({
    type: allowed ? 'success' : 'failure',
    message: allowed 
      ? `ACCESS GRANTED: The policy "${policyName}" permits this operation because all security conditions were satisfied.` 
      : `ACCESS DENIED: The policy "${policyName}" blocked this operation. In Supabase RLS, if the USING expression evaluates to false or null, the row is hidden from the user.`
  });

  insights.push({
    type: 'info',
    message: 'RLS CONCEPT: The "USING" expression in a policy acts like a filter. For every row accessed, PostgreSQL evaluates this expression; if it returns true, the row is processed. If it returns false or null, the row is ignored.'
  });

  // 2. Variable Definitions & Context
  if (evaluatedValues['auth.uid()'] !== undefined) {
    insights.push({
      type: 'info',
      message: `auth.uid() resolved to "${evaluatedValues['auth.uid()']}". This function returns the ID of the user making the request, extracted from their JWT.`
    });
  }

  if (evaluatedValues['auth.role()'] !== undefined) {
    const role = evaluatedValues['auth.role()'];
    let roleDesc = `The request is identified as "${role}".`;
    if (role === 'authenticated') roleDesc += " This is the default role for logged-in users.";
    if (role === 'anon') roleDesc += " This is the default role for unauthenticated public visitors.";
    if (role === 'service_role') roleDesc += " WARNING: This is an admin role that typically bypasses all RLS policies entirely.";
    
    insights.push({
      type: 'info',
      message: roleDesc
    });
  }

  // 3. Specific Logic Analysis with Explanations
  if (logicTree) {
    const walkForFailures = (node: LogicTreeNode) => {
      if (node.outcome === false) {
        if (node.kind === 'comparison') {
          insights.push({
            type: 'failure',
            message: `FAILED CHECK: "${node.label}" evaluated to false. This means the values on both sides did not match according to your logic.`
          });
        }
        if (node.kind === 'logic' && node.label === 'AND') {
          insights.push({
            type: 'warning',
            message: `AND BLOCK FAILED: In an "AND" condition, EVERY single sub-condition must be true. Since at least one failed, the entire block is false.`
          });
        }
        if (node.kind === 'logic' && node.label === 'OR') {
          insights.push({
            type: 'failure',
            message: `OR BLOCK FAILED: In an "OR" condition, at least one sub-condition must be true. Here, all conditions failed.`
          });
        }
      } else if (node.outcome === true) {
        if (node.kind === 'comparison') {
           // Maybe only show success for critical owner checks? 
           // For now let's keep it simple.
        }
      }
      node.children.forEach(walkForFailures);
    };
    walkForFailures(logicTree);
  }

  // 4. Parser/Support Notes
  if (parseError) {
    insights.push({
      type: 'warning',
      message: `SIMULATION LIMITATION: ${parseError}. The simulator might not support certain complex PostgreSQL features like subqueries (SELECT) or advanced JSONB operators yet.`
    });
  }

  // 5. Actionable Advice
  if (!allowed) {
    const missingKeys = Object.keys(evaluatedValues).filter(k => evaluatedValues[k] === undefined);
    if (missingKeys.length > 0) {
      insights.push({
        type: 'warning',
        message: `DEBUG TIP: The simulator found undefined values for: ${missingKeys.join(', ')}. Ensure your "Sample Row Data" has these columns defined, or they will be treated as NULL in the comparison.`
      });
    }
  }

  return insights;
}