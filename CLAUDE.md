# Mission Control Board - Claude Code Instructions

## Project
Next.js 16 + Supabase + shadcn/ui + Tailwind CSS. Dark theme (#0a0a0b background).
Deployed at: https://mission-control-board.vercel.app

## Current State
- All views exist: tasks, agents, calendar, projects, memory, docs, team, office, system
- CRUD dialogs exist for all views (task-dialog, agent-dialog, project-dialog, etc.)
- Supabase client at `src/lib/supabase.ts` with types defined
- Build passes clean

## Task: Implement Remaining Features

### 1. Dashboard Overview (Priority: HIGH)
Create a new "dashboard" view as the default landing page. Should show:
- Quick stats cards: total tasks, active agents, upcoming events, active projects
- Recent activity feed (last 10 activities from `activities` table)
- Task breakdown by status (small bar chart or progress bars)
- Agent status overview (who's working, idle, offline)
- Replace "tasks" as the default view in page.tsx

### 2. Token/Cost Tracking (Priority: HIGH)
First, create the `token_usage` table via Supabase client (use raw SQL via supabase.rpc or just create the view without the table for now):
- Add a "Usage" section to the dashboard or system view showing:
  - Daily/weekly/monthly token usage
  - Cost breakdown by model (Opus 4.6, Kimi K2, Claude Code)
  - Simple bar/progress visualization
- For now, use mock data structure but make it easy to connect real data later:
  ```ts
  type TokenUsage = { model: string; provider: string; input_tokens: number; output_tokens: number; cost_cents: number; created_at: string; }
  ```

### 3. ⌘K Command Palette (Priority: MEDIUM)
- Global keyboard shortcut ⌘K (or Ctrl+K)
- Search across tasks, projects, agents, docs
- Quick actions: create task, switch view, etc.
- Use a dialog/overlay with search input
- Install cmdk package: `npm install cmdk`

### 4. Real-Time Activity Feed (Priority: MEDIUM)
- In the dashboard, show a live activity feed
- Query `activities` table ordered by created_at desc
- Show agent avatar/color, action description, timestamp
- Auto-refresh every 30 seconds or use Supabase realtime subscription

### 5. Toast Notifications (Priority: LOW)
- Install sonner: `npx shadcn@latest add sonner`
- Add toast notifications for all CRUD operations (create/edit/delete success/error)
- Add the Toaster component to layout.tsx

### 6. Polish & Improvements (Priority: LOW)
- Add relative timestamps everywhere (e.g., "2 hours ago")
- Improve responsive layout for mobile/tablet
- Add loading skeletons instead of plain "Loading..." text
- Smooth transitions between views

## Style Guidelines
- Background: #0a0a0b
- Card bg: #111113
- Border: #1e1e22
- Hover border: #2a2a2e
- Text primary: #e0e0e0
- Text secondary: #666, #555
- Accent colors: emerald for success, amber for warning, indigo for info
- Keep everything dark themed, minimal, clean

## DO NOT
- Do not modify .env.local
- Do not break existing CRUD dialogs
- Do not remove existing views or components
- Keep the build passing at all times

## Data shape
```sql
tasks: id, title, description, status, assignee_id, project_id, source, source_icon, priority, color, created_at, updated_at
agents: id, name, role, color, status, current_task, model, capabilities, created_at, updated_at
projects: id, name, description, status, color, progress, agent_ids, created_at, updated_at
activities: id, agent_id, action, description, metadata, created_at
calendar_events: id, title, description, event_date, event_time, duration_minutes, event_type, agent_id, project_id, created_at
documents: id, title, content, doc_type, agent_id, project_id, tags, created_at, updated_at
memory_entries: id, agent_id, content, memory_type, importance, source, created_at
```

## Sidebar ViewIds
Current: tasks, agents, calendar, projects, memory, docs, team, office, system
Add: dashboard (as first item, make it default)

When completely finished, run: openclaw system event --text "Done: Dashboard, token tracking, command palette, activity feed, toasts, and polish added to Mission Control" --mode now
