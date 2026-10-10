# Momentum — Mindful, Energy-First To-Do & Focus Web App

> **A local-first, human-centric productivity web application designed to combat burnout, decision fatigue, and task paralysis.**  
> Momentum is built from the ground up to be fundamentally distinct from traditional checkbox lists (Todoist, TickTick, Microsoft To Do, Notion).

---

## ⚡ The 10 Unique Core Features

### 1. Energy-Based Planning ("What should I do right now?")
- Every task is tagged with an energy level (☕ **Low**, ⚡ **Medium**, 🚀 **High**) and an estimated duration.
- The **"What should I do right now?"** button asks your current biological energy and available minutes, instantly recommending the best-matching tasks with zero cognitive friction.

### 2. Task Decay & The 7-Day Triage Ritual
- Untouched tasks visually age over time:
  - **Fresh** (0–2 days): Vibrant, crisp borders.
  - **Aging** (3–4 days): Subtle softening and muted borders.
  - **Wilting** (5–6 days): Warm amber sepia tone and desaturation.
  - **Critical** (7+ days): Pulsing decay indicator triggering the **7-Day Triage Ritual**.
- Triage presents 4 deliberate choices: **Do It Now**, **Shrink It**, **Reschedule**, or **Delete It**.

### 3. Rule of 3 (Anti-Overload Slot Locking)
- The "Today" list enforces a hard cap of **3 Main Wins** plus **2 Bonus Slots**.
- Adding a 4th task triggers the **Forced Swap Modal**, requiring you to consciously swap a task out to backlog or demote to bonus, protecting your daily cognitive bandwidth.

### 4. Snooze with a Reason (Procrastination Intelligence)
- Postponing a task requires logging an intentional reason:
  - 🐘 `Too big` (needs breakdown)
  - 🥱 `Not in the mood` (energy mismatch)
  - ⏳ `Waiting on someone` (external blocker)
  - 💭 `Forgot about it` (lost in noise)
  - 🍂 `Not really important` (re-evaluating worth)
- Weekly **Procrastination Bottleneck Analysis** visualizes patterns with tailored advice.

### 5. Estimate vs Reality & The Personal Multiplier
- A built-in focus timer tracks actual focused minutes per task.
- Learns your personal estimation bias multiplier (e.g., *"You usually take 1.5x longer than estimated. A 30m task typically takes ~45m"*).

### 6. "Just 5 Minutes" Low-Friction Mode
- One-click launch for a 5-minute non-intimidating sprint on any intimidating task.
- At `0:00`, prompts you to celebrate starting, seamlessly roll into deep focus (+25m), or stop and take credit for the 5 minutes.

### 7. Auto-Splitter ("Break It Down")
- One-click decomposition using heuristic pattern recognition for writing, coding, cleaning, designing, studying, and meetings.
- Previews and edits generated subtasks with time estimates. Pluggable architecture ready for direct LLM API integration.

### 8. Wins Timeline & Forgiving Streak
- Completed tasks flow into an interactive daily journal timeline with deep-work minutes and energy burned.
- **Forgiving Streak**: Includes a **Grace Shield** that absorbs 1 missed day without breaking your streak chain.

### 9. Task Dependency Links & DAG Graph View
- Tasks can be locked behind prerequisite blockers.
- Locked tasks show an amber lock icon and blocker details.
- Includes an interactive **SVG Directed Acyclic Graph (DAG)** visualizer rendering dependency chains.

### 10. Command Palette (`Ctrl/Cmd + K`)
- Universal keyboard-first navigation for instant task search, quick actions (`C` to create, `W` for energy matching, `1-4` for view navigation, `T` for theme toggle).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with custom **Kyoto Night (Dark)** & **Washi Paper (Light)** themes
- **State Management**: Zustand
- **Persistence**: Dexie.js (IndexedDB local-first database, no remote server required)
- **Offline & Installability**: PWA Service Worker via `vite-plugin-pwa`
- **Animations**: Framer Motion & Canvas Confetti
- **Testing**: Vitest unit test suite

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Run

```bash
# Clone or navigate to the directory
cd e:/To-do-List

# Install dependencies
npm install

# Run Vitest test suite
npm test

# Run production build (includes PWA service worker)
npm run build

# Start local dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing

The core scheduling, decay calculation, dependency graph, and forgiving streak algorithms are validated via Vitest:

```bash
npx vitest run
```

Test files:
- `tests/decayEngine.test.ts` (aging stages, triage trigger, dismissal)
- `tests/ruleOfThree.test.ts` (3 main + 2 bonus cap enforcement)
- `tests/dependencyGraph.test.ts` (blocker checks, cycle detection)
- `tests/streakEngine.test.ts` (consecutive streak, grace shield protection)
