-- Mission Control Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- 1. Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  machine TEXT,
  status TEXT DEFAULT 'idle' CHECK (status IN ('working', 'idle', 'paused', 'offline')),
  current_task TEXT,
  tags TEXT[] DEFAULT '{}',
  autonomy_level TEXT DEFAULT 'standard' CHECK (autonomy_level IN ('intern', 'specialist', 'lead', 'chief')),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'paused', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  owner_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('recurring', 'backlog', 'in_progress', 'review', 'done')),
  assignee_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  source TEXT,
  source_icon TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  color TEXT DEFAULT '#6366f1',
  input_tokens BIGINT,
  output_tokens BIGINT,
  cached_tokens BIGINT,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activities table (live feed)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Schedules table (calendar)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  cron_expression TEXT,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  time_slot TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  color TEXT DEFAULT '#6366f1',
  is_always_running BOOLEAN DEFAULT false,
  frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  doc_type TEXT DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  file_size TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Memory entries table
CREATE TABLE memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  content TEXT,
  entry_type TEXT DEFAULT 'journal' CHECK (entry_type IN ('journal', 'long_term', 'decision', 'insight')),
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Machines table
CREATE TABLE machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  machine_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_activities_created ON activities(created_at DESC);
CREATE INDEX idx_activities_agent ON activities(agent_id);
CREATE INDEX idx_schedules_agent ON schedules(agent_id);
CREATE INDEX idx_memory_date ON memory_entries(entry_date DESC);
CREATE INDEX idx_documents_type ON documents(doc_type);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

-- Public read policies (for now - tighten later with auth)
CREATE POLICY "Allow public read" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON documents FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON memory_entries FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON machines FOR SELECT USING (true);

-- Public write policies (for now)
CREATE POLICY "Allow public insert" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON memory_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert" ON machines FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON agents FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON documents FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON memory_entries FOR UPDATE USING (true);
CREATE POLICY "Allow public update" ON machines FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON agents FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON projects FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON tasks FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON activities FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON schedules FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON documents FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON memory_entries FOR DELETE USING (true);
CREATE POLICY "Allow public delete" ON machines FOR DELETE USING (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_memory_updated_at BEFORE UPDATE ON memory_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
