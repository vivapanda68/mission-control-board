import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types matching the database schema
export type Agent = {
  id: string
  name: string
  role: string
  description: string | null
  avatar_url: string | null
  machine: string | null
  status: 'working' | 'idle' | 'paused' | 'offline'
  current_task: string | null
  tags: string[]
  autonomy_level: 'intern' | 'specialist' | 'lead' | 'chief'
  color: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: 'recurring' | 'backlog' | 'in_progress' | 'review' | 'done'
  assignee_id: string | null
  project_id: string | null
  source: string | null
  source_icon: string | null
  priority: 'high' | 'medium' | 'low'
  color: string
  created_at: string
  updated_at: string
  agents?: Agent
  projects?: Project
}

export type Project = {
  id: string
  name: string
  description: string | null
  status: 'active' | 'planning' | 'paused' | 'completed'
  progress_percent: number
  owner_id: string | null
  priority: 'high' | 'medium' | 'low'
  total_tasks: number
  completed_tasks: number
  created_at: string
  updated_at: string
  agents?: Agent
}

export type Activity = {
  id: string
  agent_id: string | null
  action: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
  agents?: Agent
}

export type Schedule = {
  id: string
  agent_id: string | null
  task_name: string
  cron_expression: string | null
  days_of_week: number[]
  time_slot: string
  duration_minutes: number
  color: string
  is_always_running: boolean
  frequency: string | null
  created_at: string
  agents?: Agent
}

export type Document = {
  id: string
  title: string
  content: string | null
  doc_type: string
  tags: string[]
  file_size: string | null
  word_count: number
  created_at: string
  updated_at: string
}

export type MemoryEntry = {
  id: string
  entry_date: string
  title: string
  content: string | null
  entry_type: 'journal' | 'long_term' | 'decision' | 'insight'
  tags: string[]
  word_count: number
  file_size: string | null
  created_at: string
  updated_at: string
}

export type TokenUsage = {
  model: string
  provider: string
  input_tokens: number
  output_tokens: number
  cost_cents: number
  created_at: string
}
