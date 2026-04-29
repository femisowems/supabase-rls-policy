# ⚡️ Supabase RLS Policy Simulator

A high-performance, professional-grade playground for designing, testing, and debugging Supabase Row Level Security (RLS) policies. This tool provides a real-time simulation environment to visualize how your policies interact with user identities and row data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🚀 Key Features

### 📚 Policy Library (⌘P)
Browse a comprehensive collection of RLS patterns—from basic ownership checks to complex JWT claim-based isolation. Choose a preset to instantly populate the editor.

### 🧠 Smart Troubleshooting
When a simulation fails, the simulator doesn't just say "Denied"—it analyzes your logic and provides **tailored advice**. It detects identity mismatches, missing columns, and role restrictions in real-time.

### 📊 Logic Flow Visualization
Understand exactly how PostgreSQL evaluates your `USING` expressions. Our visual logic tree highlights every comparison and boolean operation, showing you precisely where the access chain breaks.

### 🔗 Real-time URL Sync (⌘S)
Share your exact simulation state—policy, schema, and row data—via a single, beautified URL. We use diff-based compression to keep share links short and clean.

### 🕰 Simulation History (⌘H)
Never lose a working policy. Every successful check is saved to your local history, allowing you to quickly revert to previous versions of your logic or data.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ + P` | Open Policy Library |
| `⌘ + S` | Copy Share Link |
| `⌘ + H` | Toggle History Sidebar |
| `⌘ + Enter` | Run Simulation Check |
| `⌘ + \` | Reset to Defaults |
| `⌘ + /` | Open Shortcuts Guide |

*Note: Use `Ctrl` instead of `⌘` on Windows/Linux.*

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animations**: Framer Motion
- **Engine**: Custom SQL Parser (Emscripten-based `pg-query`)
- **State**: Zustand + LZ-based URL Compression

## 🚦 Getting Started

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/supabase-rls-policy.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## 📄 License

This project is licensed under the MIT License.
