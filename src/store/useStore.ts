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
  personas: typeof PERSONAS;
  
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
  addPersona: (persona: (typeof PERSONAS)[0]) => void;
  updatePersona: (name: string, persona: Partial<(typeof PERSONAS)[0]>) => void;
  deletePersona: (name: string) => void;
  
  // UI State
  isPresetsOpen: boolean;
  setPresetsOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
}

export const PRESET_EXAMPLES = [
  {
    name: "Own Data Only",
    category: "Row-based",
    description: "Restricts access to rows where the user_id matches the authenticated user's ID.",
    policy: `CREATE POLICY "Users can view own data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);`,
  },
  {
    name: "Authenticated Only",
    category: "Auth-based",
    description: "Allows access to any user who is logged in, regardless of identity.",
    policy: `CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');`,
  },
  {
    name: "Admin Bypass",
    category: "Auth-based",
    description: "Grants full access to users with the service_role (usually for administrative tasks).",
    policy: `CREATE POLICY "Admins can do anything"
ON profiles
FOR ALL
USING (auth.role() = 'service_role');`,
  },
  {
    name: "JWT Claim Check",
    category: "JWT Claims",
    description: "Uses custom claims inside the JWT to verify organization-level access.",
    policy: `CREATE POLICY "Check tenant access"
ON profiles
FOR SELECT
USING ((auth.jwt() ->> 'org_id') = organization_id);`,
  },
  {
    name: "Owner or Admin",
    category: "Row-based",
    description: "Allows access if the user owns the record OR has an admin role.",
    policy: `CREATE POLICY "Owners or admins can read"
ON profiles
FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'service_role');`,
  },
  {
    name: "Tenant Read Access",
    category: "Tenant Isolation",
    description: "Isolates read access based on the organization ID in the user's JWT.",
    policy: `CREATE POLICY "Users can read their tenant records"
ON invoices
FOR SELECT
USING ((auth.jwt() ->> 'org_id') = organization_id);`,
  },
  {
    name: "Tenant Write Access",
    category: "Tenant Isolation",
    description: "Isolates write access with strict checks on both existing and new data.",
    policy: `CREATE POLICY "Users can modify their tenant records"
ON invoices
FOR UPDATE
USING ((auth.jwt() ->> 'org_id') = organization_id)
WITH CHECK ((auth.jwt() ->> 'org_id') = organization_id);`,
  },
  {
    name: "Public Read, Private Write",
    category: "Auth-based",
    description: "A common pattern for blogs or profiles: anyone can see, only owners can edit.",
    policy: `CREATE POLICY "Anyone can read, authenticated users can write"
ON posts
FOR SELECT
USING (true);

CREATE POLICY "Only authenticated users can insert"
ON posts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');`,
  },
  {
    name: "Soft Delete Hidden",
    category: "Row-based",
    description: "Automatically filters out records that have been marked as deleted.",
    policy: `CREATE POLICY "Hide soft deleted rows"
ON posts
FOR SELECT
USING (deleted_at IS NULL OR auth.role() = 'service_role');`,
  },
  {
    name: "Email Match",
    category: "Column Match",
    description: "Matches access based on the user's email address instead of their UID.",
    policy: `CREATE POLICY "Users can access records matching email"
ON subscriptions
FOR SELECT
USING (email = auth.email());`,
  },
  {
    name: "Department Scope",
    category: "Column Match",
    description: "Restricts access to rows belonging to the user's specific department.",
    policy: `CREATE POLICY "Users can access their department"
ON tickets
FOR SELECT
USING (department_id = (auth.jwt() ->> 'department_id'));`,
  },
  {
    name: "Verified Email Only",
    category: "Auth-based",
    description: "Ensures users have verified their email before granting access.",
    policy: `CREATE POLICY "Only verified users may read"
ON profiles
FOR SELECT
USING ((auth.jwt() ->> 'email_verified') = 'true');`,
  },
  {
    name: "Service Role Write",
    category: "Role-based",
    description: "Strictly limits insertion of audit logs to system processes only.",
    policy: `CREATE POLICY "Only the service role may write"
ON audit_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');`,
  },
  {
    name: "Creator Can Update",
    category: "Row-based",
    description: "Ensures that only the original creator of a document can modify it.",
    policy: `CREATE POLICY "Creators can update their own records"
ON documents
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);`,
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
  personas: PERSONAS,

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
      personas: PERSONAS,
    });
  },

  addPersona: (persona) => set((state) => ({ 
    personas: [...state.personas, persona] 
  })),

  updatePersona: (name, updated) => set((state) => ({
    personas: state.personas.map(p => p.name === name ? { ...p, ...updated } : p)
  })),

  deletePersona: (name) => set((state) => ({ 
    personas: state.personas.filter(p => p.name !== name) 
  })),

  isPresetsOpen: false,
  serialize: () => {
    const state = get();
    const out: any = {};
    
    // Only include if different from defaults to keep URL short
    if (state.policy !== DEFAULT_POLICY) out.p = state.policy;
    if (JSON.stringify(state.schema) !== JSON.stringify(DEFAULT_SCHEMA)) out.s = state.schema;
    if (JSON.stringify(state.rowData) !== JSON.stringify(DEFAULT_ROW_DATA)) out.r = state.rowData;
    if (JSON.stringify(state.userContext) !== JSON.stringify(DEFAULT_USER_CONTEXT)) out.u = state.userContext;
    if (JSON.stringify(state.personas) !== JSON.stringify(PERSONAS)) out.ps = state.personas;
    
    if (Object.keys(out).length === 0) return '';
    return LZString.compressToEncodedURIComponent(JSON.stringify(out));
  },
  
  deserialize: (data: string) => {
    try {
      const json = LZString.decompressFromEncodedURIComponent(data);
      if (!json) return;
      const state = JSON.parse(json);
      set({
        policy: state.p ?? DEFAULT_POLICY,
        schema: state.s ?? DEFAULT_SCHEMA,
        rowData: state.r ?? DEFAULT_ROW_DATA,
        userContext: state.u ?? DEFAULT_USER_CONTEXT,
        personas: state.ps ?? PERSONAS,
      });
    } catch (e) {
      console.error('Failed to deserialize state', e);
    }
  },

  isPresetsOpen: false,
  setPresetsOpen: (isPresetsOpen) => set({ isPresetsOpen }),
  isHistoryOpen: false,
  setHistoryOpen: (isHistoryOpen) => set({ isHistoryOpen }),
  isShortcutsOpen: false,
  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
}));
