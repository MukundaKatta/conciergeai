-- ConciergeAI Database Schema

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- Organizations table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Users / team members
create table users (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  email text unique not null,
  full_name text not null,
  role text not null default 'agent' check (role in ('owner', 'admin', 'agent', 'viewer')),
  avatar_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- AI Agents
create table agents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  avatar_url text,
  brand_voice jsonb not null default '{"tone": "professional", "formality": "semi-formal", "personality": "helpful"}',
  system_prompt text not null default 'You are a helpful customer service assistant.',
  model text not null default 'gpt-4o-mini',
  temperature numeric(3,2) default 0.7,
  max_tokens integer default 1024,
  allowed_actions text[] default '{}',
  escalation_rules jsonb not null default '[]',
  greeting_message text default 'Hello! How can I help you today?',
  fallback_message text default 'I apologize, but I am unable to help with that. Let me connect you with a human agent.',
  is_active boolean default true,
  widget_config jsonb default '{"primaryColor": "#4263eb", "position": "bottom-right", "borderRadius": 12}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge Base documents
create table knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  kb_id uuid references knowledge_bases(id) on delete cascade not null,
  title text not null,
  content text not null,
  doc_type text not null default 'text' check (doc_type in ('text', 'faq', 'policy', 'product', 'url')),
  source_url text,
  metadata jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Knowledge document chunks for vector search
create table knowledge_chunks (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references knowledge_documents(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  chunk_index integer not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Link agents to knowledge bases
create table agent_knowledge_bases (
  agent_id uuid references agents(id) on delete cascade,
  kb_id uuid references knowledge_bases(id) on delete cascade,
  primary key (agent_id, kb_id)
);

-- Conversation flows (designer)
create table conversation_flows (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete cascade not null,
  name text not null,
  description text,
  trigger_keywords text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flow nodes (decision tree)
create table flow_nodes (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid references conversation_flows(id) on delete cascade not null,
  node_type text not null check (node_type in ('start', 'message', 'question', 'condition', 'action', 'ai_fallback', 'escalate', 'end')),
  label text not null,
  content jsonb not null default '{}',
  position_x numeric default 0,
  position_y numeric default 0,
  created_at timestamptz default now()
);

-- Flow edges (connections between nodes)
create table flow_edges (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid references conversation_flows(id) on delete cascade not null,
  source_node_id uuid references flow_nodes(id) on delete cascade not null,
  target_node_id uuid references flow_nodes(id) on delete cascade not null,
  condition_label text,
  condition_value text,
  sort_order integer default 0
);

-- Chat sessions
create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id) on delete set null,
  org_id uuid references organizations(id) on delete cascade not null,
  channel text not null default 'web' check (channel in ('web', 'email', 'sms')),
  visitor_id text,
  visitor_name text,
  visitor_email text,
  visitor_metadata jsonb default '{}',
  status text not null default 'active' check (status in ('active', 'escalated', 'resolved', 'abandoned')),
  assigned_user_id uuid references users(id) on delete set null,
  resolution_summary text,
  csat_score integer check (csat_score between 1 and 5),
  csat_comment text,
  ab_test_id uuid,
  ab_variant text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  escalated_at timestamptz,
  created_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  sender_type text not null check (sender_type in ('visitor', 'ai', 'agent')),
  sender_id text,
  content text not null,
  metadata jsonb default '{}',
  flow_node_id uuid references flow_nodes(id) on delete set null,
  created_at timestamptz default now()
);

-- Agent actions log
create table action_logs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  action_type text not null,
  input_data jsonb not null default '{}',
  output_data jsonb default '{}',
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  error_message text,
  executed_at timestamptz default now()
);

-- Escalation records
create table escalations (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  reason text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid references users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'resolved', 'expired')),
  context_summary text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- A/B Tests
create table ab_tests (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  variants jsonb not null default '[]',
  traffic_split jsonb not null default '{}',
  metric_goals jsonb default '{}',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- QA Reviews
create table qa_reviews (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  reviewer_id uuid references users(id) on delete set null,
  score integer check (score between 1 and 10),
  categories jsonb default '{}',
  notes text,
  flagged_issues text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'flagged')),
  created_at timestamptz default now()
);

-- Analytics events
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references organizations(id) on delete cascade not null,
  event_type text not null,
  session_id uuid references chat_sessions(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index idx_agents_org on agents(org_id);
create index idx_knowledge_docs_kb on knowledge_documents(kb_id);
create index idx_knowledge_chunks_doc on knowledge_chunks(document_id);
create index idx_chat_sessions_org on chat_sessions(org_id);
create index idx_chat_sessions_agent on chat_sessions(agent_id);
create index idx_chat_sessions_status on chat_sessions(status);
create index idx_chat_messages_session on chat_messages(session_id);
create index idx_chat_messages_created on chat_messages(created_at);
create index idx_action_logs_session on action_logs(session_id);
create index idx_escalations_status on escalations(status);
create index idx_analytics_events_org on analytics_events(org_id);
create index idx_analytics_events_type on analytics_events(event_type);
create index idx_analytics_events_created on analytics_events(created_at);

-- Vector similarity search function
create or replace function match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_kb_ids uuid[]
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    kc.id,
    kc.document_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_documents kd on kd.id = kc.document_id
  where kd.kb_id = any(filter_kb_ids)
    and kd.is_active = true
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

-- Row Level Security
alter table organizations enable row level security;
alter table users enable row level security;
alter table agents enable row level security;
alter table knowledge_bases enable row level security;
alter table knowledge_documents enable row level security;
alter table knowledge_chunks enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table action_logs enable row level security;
alter table escalations enable row level security;
alter table ab_tests enable row level security;
alter table qa_reviews enable row level security;
alter table analytics_events enable row level security;

-- For demo purposes, allow all access with service role
-- In production, add proper RLS policies per user/org
create policy "Service role full access" on organizations for all using (true);
create policy "Service role full access" on users for all using (true);
create policy "Service role full access" on agents for all using (true);
create policy "Service role full access" on knowledge_bases for all using (true);
create policy "Service role full access" on knowledge_documents for all using (true);
create policy "Service role full access" on knowledge_chunks for all using (true);
create policy "Service role full access" on chat_sessions for all using (true);
create policy "Service role full access" on chat_messages for all using (true);
create policy "Service role full access" on action_logs for all using (true);
create policy "Service role full access" on escalations for all using (true);
create policy "Service role full access" on ab_tests for all using (true);
create policy "Service role full access" on qa_reviews for all using (true);
create policy "Service role full access" on analytics_events for all using (true);
