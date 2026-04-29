import { create } from 'zustand';
import LZString from 'lz-string';

export type UserRole = 'authenticated' | 'anon' | 'service_role';

export interface UserContext {
  role: UserRole;
  uid: string | null;
  email?: string;
  claims: Record<string, unknown>;
  jwt: Record<string, unknown>;
}

export interface TableSchema {
  name: string;
  columns: string[];
}

export interface SimulationResult {
  allowed: boolean;
  reason: string;
  evaluatedExpression: string;
  evaluatedValues: Record<string, unknown>;
  parseError?: string;
  logicTree?: LogicTreeNode;
  ast?: any; // For visual logic flow
}

export type LogicNodeKind =
  | 'root'
  | 'logic'
  | 'comparison'
  | 'function'
  | 'column'
  | 'literal'
  | 'json'
  | 'cast'
  | 'null'
  | 'unknown';

export interface LogicTreeNode {
  id: string;
  label: string;
  kind: LogicNodeKind;
  outcome: boolean | null;
  value?: unknown;
  children: LogicTreeNode[];
}

interface RLSStore {
  policy: string;
  schema: TableSchema;
  rowData: Record<string, unknown>;
  userContext: UserContext;
  simulationResult: SimulationResult | null;
  
  setPolicy: (policy: string) => void;
  setSchema: (schema: TableSchema) => void;
  setRowData: (data: Record<string, unknown>) => void;
  setUserContext: (context: Partial<UserContext>) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  reset: () => void;
  serialize: () => string;
  deserialize: (data: string) => void;
}

export const PRESET_EXAMPLES = [
  {
    name: "Own Data Only",
    policy: `CREATE POLICY "Users can view own data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);`,
  },
  {
    name: "Authenticated Only",
    policy: `CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');`,
  },
  {
    name: "Admin Bypass",
    policy: `CREATE POLICY "Admins can do anything"
ON profiles
FOR ALL
USING (auth.role() = 'service_role');`,
  },
  {
    name: "JWT Claim Check",
    policy: `CREATE POLICY "Check tenant access"
ON profiles
FOR SELECT
USING ((auth.jwt() ->> 'org_id') = organization_id);`,
  },
];

const DEFAULT_POLICY = PRESET_EXAMPLES[0].policy;

const DEFAULT_SCHEMA: TableSchema = {
  name: 'profiles',
  columns: ['id', 'user_id', 'email', 'full_name', 'organization_id'],
};

const DEFAULT_ROW_DATA = {
  id: '1',
  user_id: 'user_123',
  email: 'femi@example.com',
  full_name: 'Femi Sowemimo',
  organization_id: 'org_789',
};

const DEFAULT_USER_CONTEXT: UserContext = {
  role: 'authenticated',
  uid: 'user_123',
  email: 'femi@example.com',
  claims: {},
  jwt: {
    org_id: 'org_789',
    role: 'authenticated'
  }
};

export const useStore = create<RLSStore>((set, get) => ({
  policy: DEFAULT_POLICY,
  schema: DEFAULT_SCHEMA,
  rowData: DEFAULT_ROW_DATA,
  userContext: DEFAULT_USER_CONTEXT,
  simulationResult: null,

  setPolicy: (policy) => set({ policy }),
  setSchema: (schema) => set({ schema }),
  setRowData: (rowData) => set({ rowData }),
  setUserContext: (context) => set((state) => ({ 
    userContext: { ...state.userContext, ...context } 
  })),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  reset: () => {
    set({
      policy: DEFAULT_POLICY,
      schema: DEFAULT_SCHEMA,
      rowData: DEFAULT_ROW_DATA,
      userContext: DEFAULT_USER_CONTEXT,
      simulationResult: null,
    });
  },
  
  serialize: () => {
    const state = {
      p: get().policy,
      s: get().schema,
      r: get().rowData,
      u: get().userContext,
    };
    return LZString.compressToBase64(JSON.stringify(state));
  },
  
  deserialize: (data: string) => {
    try {
      const json = LZString.decompressFromBase64(data);
      if (!json) return;
      const state = JSON.parse(json);
      set({
        policy: state.p,
        schema: state.s,
        rowData: state.r,
        userContext: state.u,
      });
    } catch (e) {
      console.error('Failed to deserialize state', e);
    }
  }
}));
