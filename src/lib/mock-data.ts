// ============================================================
// Types
// ============================================================

export type AgentStatus = "active" | "idle" | "paused" | "offline";
export type TaskStatus = "recurring" | "backlog" | "in_progress" | "review";
export type Priority = "low" | "medium" | "high" | "critical";
export type ProjectStatus = "active" | "on_hold" | "completed" | "planning";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  status: AgentStatus;
  skills: string[];
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  agentColor: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  priority: Priority;
  owner: string;
  ownerAvatar: string;
  ownerColor: string;
  tags: string[];
  taskCount: number;
  completedTasks: number;
}

export interface Activity {
  id: string;
  agent: string;
  agentColor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ScheduleBlock {
  id: string;
  agent: string;
  agentColor: string;
  task: string;
  day: number; // 0-6 (Mon-Sun)
  startHour: number;
  duration: number; // in hours
  isRecurring?: boolean;
}

export interface Document {
  id: string;
  name: string;
  path: string;
  type: "markdown" | "config" | "code" | "log";
  tags: string[];
  lastModified: string;
  size: string;
  content: string;
}

export interface MemoryEntry {
  id: string;
  date: string;
  type: "journal" | "decision" | "insight" | "long_term";
  title: string;
  content: string;
  agent?: string;
  agentColor?: string;
  tags: string[];
}

// ============================================================
// Mock Data
// ============================================================

export const agents: Agent[] = [
  {
    id: "agent-1",
    name: "Atlas",
    role: "Lead Orchestrator",
    description:
      "Coordinates all agent activities, manages task prioritization, and ensures project deadlines are met. Acts as the central hub for inter-agent communication.",
    avatar: "AT",
    color: "#6366f1",
    status: "active",
    skills: ["Task Planning", "Coordination", "Scheduling", "Prioritization"],
    currentTask: "Reviewing sprint backlog",
  },
  {
    id: "agent-2",
    name: "Nova",
    role: "Research Analyst",
    description:
      "Deep research and analysis across multiple domains. Specializes in synthesizing complex information into actionable insights and reports.",
    avatar: "NV",
    color: "#8b5cf6",
    status: "active",
    skills: ["Web Research", "Data Analysis", "Report Writing", "Fact Checking"],
    currentTask: "Competitor analysis report",
  },
  {
    id: "agent-3",
    name: "Cipher",
    role: "Code Engineer",
    description:
      "Full-stack development agent. Writes, reviews, and refactors code across multiple languages. Handles CI/CD pipelines and deployment.",
    avatar: "CP",
    color: "#10b981",
    status: "active",
    skills: ["TypeScript", "Python", "React", "DevOps", "Testing"],
    currentTask: "API endpoint migration",
  },
  {
    id: "agent-4",
    name: "Echo",
    role: "Communications Lead",
    description:
      "Manages external communications, drafts emails, prepares presentations, and handles stakeholder updates. Maintains brand voice consistency.",
    avatar: "EC",
    color: "#f59e0b",
    status: "idle",
    skills: ["Copywriting", "Email Drafting", "Presentations", "Tone Analysis"],
  },
  {
    id: "agent-5",
    name: "Sage",
    role: "Knowledge Manager",
    description:
      "Maintains the knowledge base, organizes documentation, and ensures information is up-to-date and accessible. Manages memory and context.",
    avatar: "SG",
    color: "#06b6d4",
    status: "active",
    skills: [
      "Documentation",
      "Knowledge Graphs",
      "Search Optimization",
      "Archival",
    ],
    currentTask: "Indexing new research docs",
  },
  {
    id: "agent-6",
    name: "Pixel",
    role: "Design Agent",
    description:
      "Creates UI mockups, design systems, and visual assets. Reviews designs for accessibility and consistency with brand guidelines.",
    avatar: "PX",
    color: "#ec4899",
    status: "paused",
    skills: ["UI Design", "Figma", "CSS", "Accessibility", "Prototyping"],
  },
  {
    id: "agent-7",
    name: "Bolt",
    role: "DevOps Engineer",
    description:
      "Manages infrastructure, deployments, monitoring, and incident response. Keeps systems running smoothly and automates operational tasks.",
    avatar: "BT",
    color: "#ef4444",
    status: "active",
    skills: ["Docker", "AWS", "Monitoring", "CI/CD", "Incident Response"],
    currentTask: "Scaling database cluster",
  },
  {
    id: "agent-8",
    name: "Lyra",
    role: "QA Specialist",
    description:
      "Runs test suites, performs regression testing, and validates features against acceptance criteria. Reports bugs with detailed reproduction steps.",
    avatar: "LR",
    color: "#14b8a6",
    status: "idle",
    skills: [
      "Test Automation",
      "Regression Testing",
      "Bug Reporting",
      "E2E Testing",
    ],
  },
];

export const tasks: Task[] = [
  // Recurring
  {
    id: "task-1",
    title: "Daily standup summary",
    description: "Generate and distribute daily standup notes to all agents",
    status: "recurring",
    priority: "medium",
    assignee: "Atlas",
    agentColor: "#6366f1",
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-03-02T09:00:00Z",
    tags: ["daily", "communication"],
  },
  {
    id: "task-2",
    title: "System health check",
    description: "Monitor all services and report any anomalies",
    status: "recurring",
    priority: "high",
    assignee: "Bolt",
    agentColor: "#ef4444",
    createdAt: "2026-02-20T06:00:00Z",
    updatedAt: "2026-03-02T06:00:00Z",
    tags: ["monitoring", "infrastructure"],
  },
  {
    id: "task-3",
    title: "Knowledge base sync",
    description: "Sync and update knowledge base with new entries",
    status: "recurring",
    priority: "medium",
    assignee: "Sage",
    agentColor: "#06b6d4",
    createdAt: "2026-02-25T12:00:00Z",
    updatedAt: "2026-03-02T12:00:00Z",
    tags: ["knowledge", "automation"],
  },
  // Backlog
  {
    id: "task-4",
    title: "Redesign onboarding flow",
    description: "Create new user onboarding experience with guided tours",
    status: "backlog",
    priority: "medium",
    assignee: "Pixel",
    agentColor: "#ec4899",
    createdAt: "2026-02-27T14:00:00Z",
    updatedAt: "2026-02-27T14:00:00Z",
    tags: ["design", "ux"],
  },
  {
    id: "task-5",
    title: "Write API documentation",
    description: "Document all REST endpoints with examples",
    status: "backlog",
    priority: "low",
    assignee: "Sage",
    agentColor: "#06b6d4",
    createdAt: "2026-02-26T10:00:00Z",
    updatedAt: "2026-02-26T10:00:00Z",
    tags: ["docs", "api"],
  },
  {
    id: "task-6",
    title: "Set up error tracking",
    description: "Integrate Sentry for error monitoring and alerting",
    status: "backlog",
    priority: "high",
    assignee: "Bolt",
    agentColor: "#ef4444",
    createdAt: "2026-02-25T16:00:00Z",
    updatedAt: "2026-02-25T16:00:00Z",
    tags: ["infrastructure", "monitoring"],
  },
  {
    id: "task-7",
    title: "Competitor feature analysis",
    description: "Analyze top 5 competitor product features and pricing",
    status: "backlog",
    priority: "medium",
    agentColor: "#8b5cf6",
    createdAt: "2026-02-24T11:00:00Z",
    updatedAt: "2026-02-24T11:00:00Z",
    tags: ["research", "strategy"],
  },
  // In Progress
  {
    id: "task-8",
    title: "API endpoint migration",
    description: "Migrate legacy REST endpoints to new v2 format",
    status: "in_progress",
    priority: "critical",
    assignee: "Cipher",
    agentColor: "#10b981",
    createdAt: "2026-02-28T08:00:00Z",
    updatedAt: "2026-03-02T10:30:00Z",
    tags: ["backend", "migration"],
  },
  {
    id: "task-9",
    title: "Competitor analysis report",
    description: "Comprehensive market analysis and competitor positioning",
    status: "in_progress",
    priority: "high",
    assignee: "Nova",
    agentColor: "#8b5cf6",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-02T11:00:00Z",
    tags: ["research", "report"],
  },
  {
    id: "task-10",
    title: "Scale database cluster",
    description: "Add read replicas and configure auto-scaling policies",
    status: "in_progress",
    priority: "critical",
    assignee: "Bolt",
    agentColor: "#ef4444",
    createdAt: "2026-03-01T14:00:00Z",
    updatedAt: "2026-03-02T09:45:00Z",
    tags: ["infrastructure", "database"],
  },
  {
    id: "task-11",
    title: "Index new research documents",
    description: "Process and categorize 47 new research papers",
    status: "in_progress",
    priority: "medium",
    assignee: "Sage",
    agentColor: "#06b6d4",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-02T08:15:00Z",
    tags: ["knowledge", "research"],
  },
  // Review
  {
    id: "task-12",
    title: "Q1 performance dashboard",
    description: "Dashboard showing agent performance metrics for Q1",
    status: "review",
    priority: "medium",
    assignee: "Cipher",
    agentColor: "#10b981",
    createdAt: "2026-02-20T09:00:00Z",
    updatedAt: "2026-03-01T16:00:00Z",
    tags: ["frontend", "analytics"],
  },
  {
    id: "task-13",
    title: "Email campaign templates",
    description: "Responsive email templates for product launch campaign",
    status: "review",
    priority: "medium",
    assignee: "Echo",
    agentColor: "#f59e0b",
    createdAt: "2026-02-27T11:00:00Z",
    updatedAt: "2026-03-01T14:00:00Z",
    tags: ["marketing", "email"],
  },
  {
    id: "task-14",
    title: "Accessibility audit fixes",
    description: "Fix WCAG 2.1 AA violations found in audit",
    status: "review",
    priority: "high",
    assignee: "Pixel",
    agentColor: "#ec4899",
    createdAt: "2026-02-22T13:00:00Z",
    updatedAt: "2026-03-02T07:00:00Z",
    tags: ["accessibility", "frontend"],
  },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Platform v2 Migration",
    description:
      "Complete rewrite of the core platform from legacy architecture to modern stack",
    status: "active",
    progress: 67,
    priority: "critical",
    owner: "Cipher",
    ownerAvatar: "CP",
    ownerColor: "#10b981",
    tags: ["backend", "infrastructure", "migration"],
    taskCount: 24,
    completedTasks: 16,
  },
  {
    id: "proj-2",
    name: "Market Expansion Research",
    description:
      "Research and strategy for entering three new market segments in Q2",
    status: "active",
    progress: 42,
    priority: "high",
    owner: "Nova",
    ownerAvatar: "NV",
    ownerColor: "#8b5cf6",
    tags: ["research", "strategy", "growth"],
    taskCount: 18,
    completedTasks: 8,
  },
  {
    id: "proj-3",
    name: "Design System 3.0",
    description:
      "Updated design system with new components, tokens, and accessibility improvements",
    status: "active",
    progress: 85,
    priority: "medium",
    owner: "Pixel",
    ownerAvatar: "PX",
    ownerColor: "#ec4899",
    tags: ["design", "frontend", "accessibility"],
    taskCount: 32,
    completedTasks: 27,
  },
  {
    id: "proj-4",
    name: "Knowledge Graph v2",
    description:
      "Next-generation knowledge graph with improved semantic search and relationships",
    status: "active",
    progress: 31,
    priority: "high",
    owner: "Sage",
    ownerAvatar: "SG",
    ownerColor: "#06b6d4",
    tags: ["knowledge", "ai", "search"],
    taskCount: 15,
    completedTasks: 5,
  },
  {
    id: "proj-5",
    name: "Product Launch Campaign",
    description:
      "Multi-channel campaign for the v2 platform launch including email, social, and PR",
    status: "planning",
    progress: 12,
    priority: "medium",
    owner: "Echo",
    ownerAvatar: "EC",
    ownerColor: "#f59e0b",
    tags: ["marketing", "communications", "launch"],
    taskCount: 22,
    completedTasks: 3,
  },
  {
    id: "proj-6",
    name: "Infrastructure Hardening",
    description:
      "Security improvements, redundancy, and disaster recovery procedures",
    status: "active",
    progress: 55,
    priority: "critical",
    owner: "Bolt",
    ownerAvatar: "BT",
    ownerColor: "#ef4444",
    tags: ["security", "infrastructure", "devops"],
    taskCount: 20,
    completedTasks: 11,
  },
];

export const activities: Activity[] = [
  {
    id: "act-1",
    agent: "Cipher",
    agentColor: "#10b981",
    action: "pushed 3 commits to",
    target: "platform-v2/api-migration",
    timestamp: "2 min ago",
  },
  {
    id: "act-2",
    agent: "Bolt",
    agentColor: "#ef4444",
    action: "scaled up",
    target: "db-replica-set-3",
    timestamp: "8 min ago",
  },
  {
    id: "act-3",
    agent: "Nova",
    agentColor: "#8b5cf6",
    action: "completed research on",
    target: "APAC market analysis",
    timestamp: "15 min ago",
  },
  {
    id: "act-4",
    agent: "Sage",
    agentColor: "#06b6d4",
    action: "indexed 12 new documents in",
    target: "research-papers/q1-2026",
    timestamp: "22 min ago",
  },
  {
    id: "act-5",
    agent: "Atlas",
    agentColor: "#6366f1",
    action: "reassigned task",
    target: "accessibility-audit → Pixel",
    timestamp: "30 min ago",
  },
  {
    id: "act-6",
    agent: "Echo",
    agentColor: "#f59e0b",
    action: "drafted response for",
    target: "partner-inquiry-#847",
    timestamp: "45 min ago",
  },
  {
    id: "act-7",
    agent: "Pixel",
    agentColor: "#ec4899",
    action: "updated component",
    target: "ButtonGroup in design-system",
    timestamp: "1 hr ago",
  },
  {
    id: "act-8",
    agent: "Lyra",
    agentColor: "#14b8a6",
    action: "ran test suite for",
    target: "auth-module (142 passed)",
    timestamp: "1 hr ago",
  },
  {
    id: "act-9",
    agent: "Cipher",
    agentColor: "#10b981",
    action: "opened PR #291",
    target: "feat: new auth middleware",
    timestamp: "2 hr ago",
  },
  {
    id: "act-10",
    agent: "Bolt",
    agentColor: "#ef4444",
    action: "deployed hotfix to",
    target: "production/api-gateway",
    timestamp: "3 hr ago",
  },
];

export const scheduleBlocks: ScheduleBlock[] = [
  // Monday
  {
    id: "sch-1",
    agent: "Atlas",
    agentColor: "#6366f1",
    task: "Sprint Planning",
    day: 0,
    startHour: 9,
    duration: 1,
  },
  {
    id: "sch-2",
    agent: "Cipher",
    agentColor: "#10b981",
    task: "API Migration",
    day: 0,
    startHour: 9,
    duration: 4,
  },
  {
    id: "sch-3",
    agent: "Nova",
    agentColor: "#8b5cf6",
    task: "Market Research",
    day: 0,
    startHour: 10,
    duration: 3,
  },
  {
    id: "sch-4",
    agent: "Pixel",
    agentColor: "#ec4899",
    task: "Design Review",
    day: 0,
    startHour: 14,
    duration: 2,
  },
  // Tuesday
  {
    id: "sch-5",
    agent: "Cipher",
    agentColor: "#10b981",
    task: "Code Review",
    day: 1,
    startHour: 9,
    duration: 2,
  },
  {
    id: "sch-6",
    agent: "Bolt",
    agentColor: "#ef4444",
    task: "Infrastructure Scaling",
    day: 1,
    startHour: 10,
    duration: 3,
  },
  {
    id: "sch-7",
    agent: "Echo",
    agentColor: "#f59e0b",
    task: "Campaign Drafts",
    day: 1,
    startHour: 11,
    duration: 3,
  },
  {
    id: "sch-8",
    agent: "Sage",
    agentColor: "#06b6d4",
    task: "Doc Indexing",
    day: 1,
    startHour: 9,
    duration: 4,
  },
  // Wednesday
  {
    id: "sch-9",
    agent: "Atlas",
    agentColor: "#6366f1",
    task: "Mid-week Sync",
    day: 2,
    startHour: 9,
    duration: 1,
  },
  {
    id: "sch-10",
    agent: "Cipher",
    agentColor: "#10b981",
    task: "API Migration",
    day: 2,
    startHour: 10,
    duration: 4,
  },
  {
    id: "sch-11",
    agent: "Lyra",
    agentColor: "#14b8a6",
    task: "Regression Testing",
    day: 2,
    startHour: 13,
    duration: 3,
  },
  {
    id: "sch-12",
    agent: "Nova",
    agentColor: "#8b5cf6",
    task: "Report Writing",
    day: 2,
    startHour: 9,
    duration: 3,
  },
  // Thursday
  {
    id: "sch-13",
    agent: "Pixel",
    agentColor: "#ec4899",
    task: "Component Build",
    day: 3,
    startHour: 9,
    duration: 4,
  },
  {
    id: "sch-14",
    agent: "Bolt",
    agentColor: "#ef4444",
    task: "Security Audit",
    day: 3,
    startHour: 10,
    duration: 2,
  },
  {
    id: "sch-15",
    agent: "Echo",
    agentColor: "#f59e0b",
    task: "Stakeholder Update",
    day: 3,
    startHour: 14,
    duration: 2,
  },
  {
    id: "sch-16",
    agent: "Sage",
    agentColor: "#06b6d4",
    task: "Knowledge Graph Update",
    day: 3,
    startHour: 9,
    duration: 3,
  },
  // Friday
  {
    id: "sch-17",
    agent: "Atlas",
    agentColor: "#6366f1",
    task: "Sprint Retro",
    day: 4,
    startHour: 15,
    duration: 1,
  },
  {
    id: "sch-18",
    agent: "Cipher",
    agentColor: "#10b981",
    task: "Tech Debt Cleanup",
    day: 4,
    startHour: 9,
    duration: 3,
  },
  {
    id: "sch-19",
    agent: "Lyra",
    agentColor: "#14b8a6",
    task: "E2E Test Suite",
    day: 4,
    startHour: 10,
    duration: 4,
  },
  {
    id: "sch-20",
    agent: "Nova",
    agentColor: "#8b5cf6",
    task: "Insight Compilation",
    day: 4,
    startHour: 13,
    duration: 2,
  },
];

export const alwaysRunning = [
  { agent: "Bolt", agentColor: "#ef4444", task: "Health Monitoring" },
  { agent: "Atlas", agentColor: "#6366f1", task: "Task Queue Manager" },
  { agent: "Sage", agentColor: "#06b6d4", task: "Knowledge Indexer" },
];

export const documents: Document[] = [
  {
    id: "doc-1",
    name: "Architecture Overview",
    path: "/docs/architecture/overview.md",
    type: "markdown",
    tags: ["architecture", "overview"],
    lastModified: "2026-03-01",
    size: "12 KB",
    content: `# Platform Architecture Overview

## System Design

The platform follows a microservices architecture with event-driven communication between services.

### Core Components

- **API Gateway** — Routes requests, handles auth, rate limiting
- **Agent Orchestrator** — Manages agent lifecycle and task assignment
- **Knowledge Store** — Centralized knowledge graph with semantic search
- **Task Queue** — Priority-based task distribution system

### Communication Patterns

Agents communicate through a message bus (Redis Streams) for real-time events and PostgreSQL for persistent state.

### Deployment

All services are containerized and deployed on Kubernetes with auto-scaling policies based on task queue depth.

## Data Flow

\`\`\`
User Request → API Gateway → Orchestrator → Agent Pool
                                          ↓
                                    Task Queue
                                          ↓
                              Agent (processes task)
                                          ↓
                                Knowledge Store
\`\`\``,
  },
  {
    id: "doc-2",
    name: "Agent Configuration Guide",
    path: "/docs/guides/agent-config.md",
    type: "markdown",
    tags: ["agents", "configuration", "guide"],
    lastModified: "2026-02-28",
    size: "8 KB",
    content: `# Agent Configuration Guide

## Creating a New Agent

Each agent requires a configuration file that defines its capabilities, constraints, and default behaviors.

### Required Fields

- \`name\` — Unique identifier for the agent
- \`role\` — Primary function description
- \`skills\` — Array of capability tags
- \`model\` — Base model to use (e.g., "claude-opus-4-6")
- \`maxConcurrentTasks\` — Parallel task limit

### Example Configuration

\`\`\`json
{
  "name": "research-agent",
  "role": "Research Analyst",
  "skills": ["web-search", "summarization", "analysis"],
  "model": "claude-opus-4-6",
  "maxConcurrentTasks": 3,
  "memory": {
    "shortTerm": "16k",
    "longTerm": "enabled"
  }
}
\`\`\`

### Memory Settings

Agents can be configured with different memory profiles depending on their role and task requirements.`,
  },
  {
    id: "doc-3",
    name: "API Reference v2",
    path: "/docs/api/v2-reference.md",
    type: "markdown",
    tags: ["api", "reference", "v2"],
    lastModified: "2026-03-02",
    size: "24 KB",
    content: `# API Reference v2

## Authentication

All API requests require a Bearer token in the Authorization header.

## Endpoints

### Agents

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/agents | List all agents |
| GET | /api/v2/agents/:id | Get agent details |
| POST | /api/v2/agents | Create new agent |
| PATCH | /api/v2/agents/:id | Update agent config |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/tasks | List all tasks |
| POST | /api/v2/tasks | Create new task |
| PATCH | /api/v2/tasks/:id | Update task |
| DELETE | /api/v2/tasks/:id | Delete task |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v2/projects | List projects |
| POST | /api/v2/projects | Create project |`,
  },
  {
    id: "doc-4",
    name: "Deployment Runbook",
    path: "/docs/ops/deployment-runbook.md",
    type: "markdown",
    tags: ["ops", "deployment", "runbook"],
    lastModified: "2026-02-25",
    size: "6 KB",
    content: `# Deployment Runbook

## Pre-deployment Checklist

- [ ] All tests pass on CI
- [ ] Database migrations reviewed
- [ ] Feature flags configured
- [ ] Rollback plan documented
- [ ] On-call engineer notified

## Deployment Steps

1. Tag release in git
2. Build Docker images via CI
3. Deploy to staging environment
4. Run smoke tests
5. Deploy to production (canary)
6. Monitor error rates for 15 minutes
7. Full rollout if metrics are green

## Rollback Procedure

If error rate exceeds 1% threshold:
1. Trigger rollback via CLI: \`deploy rollback --to-previous\`
2. Verify services are healthy
3. Investigate root cause`,
  },
  {
    id: "doc-5",
    name: "Sprint 14 Notes",
    path: "/docs/sprints/sprint-14.md",
    type: "markdown",
    tags: ["sprint", "planning", "notes"],
    lastModified: "2026-03-02",
    size: "4 KB",
    content: `# Sprint 14 — Mar 2-16, 2026

## Goals

- Complete API v2 migration (80% → 100%)
- Ship Design System 3.0 RC
- Finish APAC market research
- Infrastructure scaling for launch

## Team Allocation

- **Cipher**: API migration (full sprint)
- **Pixel**: Design system finalization
- **Nova**: Market research report
- **Bolt**: Database scaling + monitoring

## Risks

- API migration complexity may extend timeline
- Design system needs final accessibility review
- Database scaling requires maintenance window`,
  },
  {
    id: "doc-6",
    name: "Environment Config",
    path: "/config/env.example",
    type: "config",
    tags: ["config", "environment"],
    lastModified: "2026-02-20",
    size: "1 KB",
    content: `# Environment Configuration

DATABASE_URL=postgresql://localhost:5432/mission_control
REDIS_URL=redis://localhost:6379
API_PORT=3001
LOG_LEVEL=info
AGENT_POOL_SIZE=8
TASK_QUEUE_MAX_DEPTH=1000
KNOWLEDGE_STORE_URL=http://localhost:8080
AUTH_SECRET=<your-secret-here>`,
  },
];

export const memoryEntries: MemoryEntry[] = [
  // Today
  {
    id: "mem-1",
    date: "2026-03-02",
    type: "journal",
    title: "Morning Sync Complete",
    content:
      "All agents reported in. Cipher is making good progress on the API migration — 67% complete. Bolt flagged that the database needs scaling before we hit projected load. Nova's APAC research is nearly done.",
    agent: "Atlas",
    agentColor: "#6366f1",
    tags: ["sync", "status"],
  },
  {
    id: "mem-2",
    date: "2026-03-02",
    type: "insight",
    title: "API Response Time Improvement",
    content:
      "The v2 endpoint refactoring reduced average response time from 340ms to 120ms. The new connection pooling strategy is significantly more efficient than the previous approach.",
    agent: "Cipher",
    agentColor: "#10b981",
    tags: ["performance", "api"],
  },
  {
    id: "mem-3",
    date: "2026-03-02",
    type: "decision",
    title: "Database Scaling Strategy",
    content:
      "Decided to go with horizontal scaling using read replicas rather than vertical scaling. Cost is 40% lower and provides better fault tolerance. Will implement during Thursday maintenance window.",
    agent: "Bolt",
    agentColor: "#ef4444",
    tags: ["infrastructure", "decision"],
  },
  // Yesterday
  {
    id: "mem-4",
    date: "2026-03-01",
    type: "journal",
    title: "Sprint 14 Kickoff",
    content:
      "Started Sprint 14 with team alignment meeting. All agents have clear assignments. Focus areas: API migration, design system RC, and market research completion.",
    agent: "Atlas",
    agentColor: "#6366f1",
    tags: ["sprint", "planning"],
  },
  {
    id: "mem-5",
    date: "2026-03-01",
    type: "insight",
    title: "APAC Market Entry Opportunity",
    content:
      "Singapore and South Korea show strongest product-market fit. Key finding: enterprise segment is underserved by current competitors, creating a window for entry in Q2.",
    agent: "Nova",
    agentColor: "#8b5cf6",
    tags: ["research", "market"],
  },
  {
    id: "mem-6",
    date: "2026-03-01",
    type: "journal",
    title: "Design System Nearly Complete",
    content:
      "27 of 32 components are done. Remaining: DataTable, DatePicker, CommandPalette, FileUpload, and Notification. Accessibility audit found 3 issues — all fixable.",
    agent: "Pixel",
    agentColor: "#ec4899",
    tags: ["design", "progress"],
  },
  // Feb 28
  {
    id: "mem-7",
    date: "2026-02-28",
    type: "decision",
    title: "Adopted New Testing Strategy",
    content:
      "Switching from unit-test-heavy approach to a balanced pyramid: 60% integration, 25% unit, 15% E2E. This better matches our microservices architecture and catches more real bugs.",
    agent: "Lyra",
    agentColor: "#14b8a6",
    tags: ["testing", "decision"],
  },
  {
    id: "mem-8",
    date: "2026-02-28",
    type: "journal",
    title: "End of Sprint 13 Retro",
    content:
      "Sprint velocity improved by 15% over Sprint 12. Main wins: automated deployment pipeline, new knowledge graph features. Areas to improve: cross-agent communication and handoff process.",
    agent: "Atlas",
    agentColor: "#6366f1",
    tags: ["retro", "sprint"],
  },
  // Long-term memory
  {
    id: "mem-lt-1",
    date: "2026-01-15",
    type: "long_term",
    title: "Core Architecture Principles",
    content:
      "1. Prefer event-driven over synchronous communication\n2. Each agent owns its own data domain\n3. Knowledge store is the single source of truth\n4. All decisions must be logged with reasoning\n5. Rollback capability is mandatory for all deployments",
    tags: ["architecture", "principles"],
  },
  {
    id: "mem-lt-2",
    date: "2025-12-20",
    type: "long_term",
    title: "Agent Communication Protocol",
    content:
      "Agents communicate via structured messages through Redis Streams. Message format: { sender, recipient, type, payload, timestamp, priority }. Priority levels: critical (immediate), high (< 1min), normal (< 5min), low (best effort).",
    tags: ["protocol", "communication"],
  },
  {
    id: "mem-lt-3",
    date: "2026-02-01",
    type: "long_term",
    title: "User Preferences",
    content:
      "Stakeholders prefer weekly summary reports on Monday mornings. Technical updates can be async. Design reviews need visual diff screenshots. All reports should include metrics and comparisons to previous period.",
    tags: ["preferences", "reporting"],
  },
];

// ============================================================
// Helper functions
// ============================================================

export function getTasksByStatus(status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getAgentByName(name: string): Agent | undefined {
  return agents.find((a) => a.name === name);
}

export function getActiveAgents(): Agent[] {
  return agents.filter((a) => a.status === "active");
}

export function getMemoryByDate(date: string): MemoryEntry[] {
  return memoryEntries.filter((m) => m.date === date);
}

export function getLongTermMemories(): MemoryEntry[] {
  return memoryEntries.filter((m) => m.type === "long_term");
}
