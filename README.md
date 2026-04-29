# 🛡️ Supabase RLS Simulator

A powerful, visual simulator and debugger for Supabase (PostgreSQL) Row Level Security (RLS) policies. Understand, test, and debug your RLS logic with ease.

![RLS Simulator Preview](https://raw.githubusercontent.com/supabase/supabase/master/apps/www/public/images/blog/rls-guide/rls-guide-hero.png) *Note: Replace with actual project screenshot*

## ✨ Features

- **Visual Logic Tree**: See your complex SQL conditions transformed into an interactive flow chart (powered by React Flow).
- **Live Simulation**: Test policies against custom user contexts (UID, Role, JWT claims) and mock row data.
- **SQL Parsing**: Real PostgreSQL-compatible parsing using `pg-query-emscripten`.
- **Explain Mode**: Get human-readable explanations of why a policy granted or denied access.
- **Theme Support**: Beautiful dark and light modes with a premium aesthetic.
- **Local First**: Everything runs in your browser; no data leaves your machine.

## 🚀 How It Works

### The Engine
The core of the simulator is a custom evaluation engine (`src/lib/engine.ts`) that:
1. **Extracts** the `USING` clause from your `CREATE POLICY` statement.
2. **Parses** the expression into an AST (Abstract Syntax Tree).
3. **Traverses** the tree and evaluates each node against the provided context.
4. **Traces** the evaluation path to provide detailed feedback.

### User Simulation
Easily mock the `auth.uid()`, `auth.role()`, and `auth.jwt()` functions to see how different users experience your security rules.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Visualization**: [React Flow](https://reactflow.dev/)
- **SQL Parser**: [pg-query-emscripten](https://github.com/lfittl/pg-query-emscripten)
- **Styling**: Tailwind CSS 4, Framer Motion, Lucide Icons
- **State Management**: Zustand

## 🏁 Getting Started

### Prerequisites
- Node.js 20+
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/supabase-rls-policy.git
   cd supabase-rls-policy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Whether it's adding support for more SQL operators, improving the UI, or fixing bugs, feel free to open an issue or a PR.

## 📜 License

MIT © [Femi Sowemimo](https://github.com/femisowemimo)

