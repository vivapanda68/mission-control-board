# Mission Control Board — Redesign

## Project
Next.js 16 + Supabase + shadcn/ui + Tailwind CSS. Dark theme (#0a0a0b).

## Goal
Redesign the dashboard to be a practical command center for Nam to oversee all work at a glance. Strip out fluff views, focus on actionable information.

## What to Build

### 1. New Sidebar (simplified)
Replace current 10+ views with just 4:
- 📊 **Dashboard** (default) — overview of everything
- 📋 **Backlog** — kanban board: To Do → In Progress → Review → Done
- 🗂️ **Projects** — project cards with drill-down
- 📜 **Activity** — chronological activity log

Remove: calendar, team, docs, memory, office, system, agents views.
Keep the sidebar clean and minimal.

### 2. Dashboard View (complete rewrite)
This is the main landing page. Should answer "what's happening?" in 5 seconds.

**Top row — Stats:**
- Active projects count
- Tasks in progress
- Tasks in backlog
- Completed this month

**Left column (60%) — Current Sprint:**
- "In Progress" tasks with project badge and priority indicator
- "In Review" tasks
- Sorted by priority (high → medium → low)
- Click task to edit

**Right column (40%) — Activity Feed:**
- Last 15 activities with relative timestamps
- Agent avatar, action, description
- Auto-scrolling

**Bottom row — Project Health:**
- Each active project as a compact card
- Project name, status badge, progress bar, task count
- Click to go to project detail

### 3. Backlog View (kanban rewrite)
Four columns:
- **To Do** (backlog) — prioritized, draggable
- **In Progress** — currently being worked on
- **Review** — needs Nam's review
- **Done** — completed (last 2 weeks only, older auto-hidden)

Each card shows: title, priority color (red/yellow/green), project badge, assignee avatar
Click to edit. "+ New Task" button at top of each column.

### 4. Projects View (enhanced)
Card grid showing each project:
- Name, description, status badge (active/planning/paused)
- Progress bar
- Task breakdown: X backlog, X in progress, X done
- Last activity date
- Click to expand → shows that project's tasks and recent activity

### 5. Activity View
Full chronological timeline:
- Grouped by date
- Agent avatar + name, action, description, timestamp
- Filter by agent or project
- Infinite scroll / load more

## Supabase Schema (unchanged)
```
tasks: id, title, description, status, assignee_id, project_id, priority, created_at, updated_at
projects: id, name, description, status, color, progress, created_at, updated_at
activities: id, agent_id, action, description, metadata, created_at
agents: id, name, role, color, status, current_task
token_usage: id, agent_id, model, provider, input_tokens, output_tokens, cost_cents, task_description, created_at
```

## Style
- Background: #0a0a0b
- Cards: #111113 with #1e1e22 borders
- Hover: #2a2a2e borders
- Text: #e0e0e0 primary, #888 secondary, #555 muted
- Priority: red=#ef4444, yellow=#f59e0b, green=#22c55e
- Status badges: emerald=active, amber=in_progress, blue=review, gray=done, slate=paused
- Keep it minimal, clean, professional. No clutter.

## DO NOT
- Do not modify .env.local or supabase.ts (connection)
- Do not add new npm dependencies except shadcn components if needed
- Do not change the Supabase schema
- Keep build passing

## Remove
Delete these files (no longer needed):
- src/components/views/calendar-view.tsx
- src/components/views/docs-view.tsx
- src/components/views/memory-view.tsx
- src/components/views/office-view.tsx
- src/components/views/team-view.tsx
- src/components/command-palette.tsx (rebuild if time permits)
- src/components/schedule-dialog.tsx
- src/components/document-dialog.tsx
- src/components/memory-dialog.tsx
- src/components/agent-dialog.tsx

## Keep & Modify
- src/components/sidebar.tsx — simplify to 4 views
- src/components/topbar.tsx — keep, clean up
- src/components/views/dashboard-view.tsx — complete rewrite
- src/components/views/tasks-view.tsx — transform into kanban backlog
- src/components/views/projects-view.tsx — enhance with drill-down
- src/components/task-dialog.tsx — keep for CRUD
- src/components/project-dialog.tsx — keep for CRUD
- src/app/page.tsx — update view mapping

When completely finished, run: openclaw system event --text "Done: Mission Control redesigned — dashboard, backlog, projects, activity" --mode now
