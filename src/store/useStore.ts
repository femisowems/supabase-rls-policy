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

export interface HistoryItem {
  timestamp: number;
  policy: string;
  userContext: UserContext;
  rowData: Record<string, unknown>;
}

interface RLSStore {
  policy: string;
  schema: TableSchema;
  rowData: Record<string, unknown>;
  userContext: UserContext;
  simulationResult: SimulationResult | null;
  history: HistoryItem[];
  
  setPolicy: (policy: string) => void;
  setSchema: (schema: TableSchema) => void;
  setRowData: (data: Record<string, unknown>) => void;
  setUserContext: (context: Partial<UserContext>) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  saveToHistory: () => void;
  restoreHistory: (item: HistoryItem) => void;
  reset: () => void;
  serialize: () => string;
  deserialize: (data: string) => void;
}

export const PRESET_EXAMPLES = [
  {
    name: "Own Data Only",
    category: "Row-based",
    policy: `CREATE POLICY "Users can view own data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);`,
  },
  {
    name: "Authenticated Only",
    category: "Auth-based",
    policy: `CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');`,
  },
  {
    name: "Admin Bypass",
    category: "Auth-based",
    policy: `CREATE POLICY "Admins can do anything"
ON profiles
FOR ALL
USING (auth.role() = 'service_role');`,
  },
  {
    name: "JWT Claim Check",
    category: "JWT Claims",
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

export const PERSONAS = [
  {
    name: 'Owner',
    icon: 'User',
    description: 'The user who owns the record',
    context: {
      role: 'authenticated' as UserRole,
      uid: 'user_123',
      claims: {},
      jwt: { org_id: 'org_789', role: 'authenticated' }
    }
  },
  {
    name: 'Team Member',
    icon: 'Users',
    description: 'Member of the same organization',
    context: {
      role: 'authenticated' as UserRole,
      uid: 'user_456',
      claims: {},
      jwt: { org_id: 'org_789', role: 'authenticated' }
    }
  },
  {
    name: 'Stranger',
    icon: 'Ghost',
    description: 'Authenticated user from a different org',
    context: {
      role: 'authenticated' as UserRole,
      uid: 'user_999',
      claims: {},
      jwt: { org_id: 'org_000', role: 'authenticated' }
    }
  },
  {
    name: 'Anonymous',
    icon: 'EyeOff',
    description: 'Public unauthenticated visitor',
    context: {
      role: 'anon' as UserRole,
      uid: null,
      claims: {},
      jwt: {}
    }
  },
  {
    name: 'Admin',
    icon: 'ShieldCheck',
    description: 'System administrator (bypass)',
    context: {
      role: 'service_role' as UserRole,
      uid: 'admin_god',
      claims: {},
      jwt: { role: 'service_role' }
    }
  }
];

export const useStore = create<RLSStore>((set, get) => ({
  policy: DEFAULT_POLICY,
  schema: DEFAULT_SCHEMA,
  rowData: DEFAULT_ROW_DATA,
  userContext: DEFAULT_USER_CONTEXT,
  simulationResult: null,
  history: [],

  setPolicy: (policy) => set({ policy }),
  setSchema: (schema) => set({ schema }),
  setRowData: (rowData) => set({ rowData }),
  setUserContext: (context) => set((state) => ({ 
    userContext: { ...state.userContext, ...context } 
  })),
  setSimulationResult: (simulationResult) => set({ simulationResult }),
  
  saveToHistory: () => {
    const { policy, userContext, rowData, history } = get();
    const newItem: HistoryItem = {
      timestamp: Date.now(),
      policy,
      userContext,
      rowData: { ...rowData }
    };
    
    // Only save if different from last history item
    const last = history[0];
    if (last && last.policy === policy && JSON.stringify(last.userContext) === JSON.stringify(userContext)) {
      return;
    }
    
    set({ history: [newItem, ...history].slice(0, 50) });
  },

  restoreHistory: (item) => {
    set({
      policy: item.policy,
      userContext: item.userContext,
      rowData: item.rowData
    });
  },
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
