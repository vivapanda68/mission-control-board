# Mission Control Board - Claude Code Instructions

## Project
Next.js 16 + Supabase + shadcn/ui + Tailwind CSS. Dark theme (#0a0a0b background).

## Task: Add CRUD Operations

### 1. Task CRUD (tasks-view.tsx)
- **Create**: Add a "+" button in the topbar area. Opens a dialog/modal with form:
  - Title (required), Description, Status (dropdown: recurring/backlog/in_progress/review/done), Priority (high/medium/low), Assignee (dropdown from agents table), Project (dropdown from projects table)
  - On submit: INSERT into Supabase `tasks` table, refresh the view
- **Edit**: Click a task card to open an edit dialog (same form, pre-filled)
- **Delete**: Add delete button in edit dialog, with confirmation
- **Status change**: Allow clicking column headers or a dropdown on cards to move between statuses

### 2. Activity logging
- When a task is created/edited/deleted, INSERT a row into `activities` table with the action

### 3. Supabase client
- Already configured at `src/lib/supabase.ts`
- Use the existing `supabase` client for all operations
- Types are already defined there

### 4. UI Components Available
Already installed: dialog, dropdown-menu, select, input, textarea, badge, button, scroll-area, tooltip, avatar, separator, tabs, card, popover
If you need more shadcn components, install with: `npx shadcn@latest add <component>`

### 5. Style Guidelines
- Background: #0a0a0b
- Card bg: #111113
- Border: #1e1e22
- Hover border: #2a2a2e
- Text primary: #e0e0e0
- Text secondary: #666, #555
- Use the existing color patterns from tasks-view.tsx
- Keep everything dark themed

### 6. DO NOT
- Do not change the Supabase schema
- Do not modify .env.local
- Do not add new dependencies beyond shadcn components
- Do not change the sidebar or topbar components (except adding the "+" button to topbar if needed)

### 7. Files to modify
- `src/components/views/tasks-view.tsx` — main CRUD target
- `src/app/page.tsx` — if needed for shared state
- Create new files for modals/dialogs as needed (e.g. `src/components/task-dialog.tsx`)

### 8. Data shape
```sql
tasks: id, title, description, status, assignee_id, project_id, source, source_icon, priority, color, created_at, updated_at
agents: id, name, role, color, status, ...
projects: id, name, description, status, ...
activities: id, agent_id, action, description, metadata, created_at
```

When done, run: openclaw system event --text "Done: CRUD operations added to Mission Control" --mode now
