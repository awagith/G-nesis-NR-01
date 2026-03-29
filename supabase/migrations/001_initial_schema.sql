-- ============================================================
-- Gênesis NR-01 — Migration 001: Schema inicial
-- Execute no Supabase SQL Editor do projeto correspondente
-- (dev, staging ou prod)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────
create type user_role as enum (
  'genesis', 'client_executive', 'collaborator', 'professional'
);

create type risk_level as enum ('low', 'medium', 'high', 'critical');

create type action_status as enum (
  'pending', 'in_progress', 'completed', 'cancelled'
);

create type diagnosis_status as enum (
  'draft', 'in_progress', 'completed', 'archived'
);

create type contract_status as enum (
  'active', 'suspended', 'cancelled', 'expired'
);

-- ─── organizations ───────────────────────────────────────────
create table organizations (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  cnpj             text unique,
  industry         text,
  employee_count   integer,
  responsible_name  text,
  responsible_email text,
  plan             text check (plan in ('basic', 'standard', 'premium')),
  status           text not null default 'active'
                     check (status in ('active', 'suspended', 'inactive')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── profiles ────────────────────────────────────────────────
-- Estende auth.users do Supabase com dados de perfil e role.
create table profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  name             text not null,
  role             user_role not null,
  organization_id  uuid references organizations(id) on delete set null,
  avatar_url       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── organization_units ──────────────────────────────────────
create table organization_units (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  type             text not null check (type in ('department', 'team', 'branch', 'unit')),
  parent_unit_id   uuid references organization_units(id) on delete set null,
  manager_name     text,
  employee_count   integer,
  created_at       timestamptz not null default now()
);

-- ─── psychosocial_diagnosis ──────────────────────────────────
create table psychosocial_diagnosis (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  status           diagnosis_status not null default 'draft',
  started_at       timestamptz,
  completed_at     timestamptz,
  total_invited    integer not null default 0,
  total_responded  integer not null default 0,
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── psychosocial_risks ──────────────────────────────────────
create table psychosocial_risks (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  diagnosis_id     uuid references psychosocial_diagnosis(id) on delete set null,
  category         text not null,
  description      text not null,
  level            risk_level not null,
  affected_unit_id uuid references organization_units(id) on delete set null,
  identified_at    timestamptz not null default now(),
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now()
);

-- ─── action_plans ────────────────────────────────────────────
create table action_plans (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  description      text,
  status           action_status not null default 'pending',
  due_date         date,
  responsible_id   uuid references profiles(id) on delete set null,
  progress_pct     integer not null default 0 check (progress_pct between 0 and 100),
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── action_items ────────────────────────────────────────────
create table action_items (
  id               uuid primary key default uuid_generate_v4(),
  action_plan_id   uuid not null references action_plans(id) on delete cascade,
  title            text not null,
  status           action_status not null default 'pending',
  due_date         date,
  responsible_id   uuid references profiles(id) on delete set null,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- ─── trainings ───────────────────────────────────────────────
create table trainings (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  description      text,
  type             text not null check (type in ('online', 'in_person', 'hybrid')),
  status           text not null default 'scheduled'
                     check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_date   timestamptz,
  completed_date   timestamptz,
  instructor       text,
  participant_count integer not null default 0,
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now()
);

-- ─── documents ───────────────────────────────────────────────
create table documents (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  name             text not null,
  type             text not null,
  storage_path     text not null,
  size_bytes       bigint,
  uploaded_by      uuid not null references profiles(id),
  created_at       timestamptz not null default now()
);

-- ─── pulse_surveys ───────────────────────────────────────────
create table pulse_surveys (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  status           text not null default 'draft'
                     check (status in ('draft', 'active', 'closed')),
  opened_at        timestamptz,
  closed_at        timestamptz,
  total_invited    integer not null default 0,
  total_responded  integer not null default 0,
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now()
);

-- ─── pulse_responses ─────────────────────────────────────────
create table pulse_responses (
  id               uuid primary key default uuid_generate_v4(),
  survey_id        uuid not null references pulse_surveys(id) on delete cascade,
  respondent_id    uuid references profiles(id) on delete set null,
  answers          jsonb not null default '{}',
  submitted_at     timestamptz not null default now()
);

-- ─── crm_contacts ────────────────────────────────────────────
create table crm_contacts (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid references organizations(id) on delete set null,
  name             text not null,
  email            text,
  phone            text,
  company          text,
  stage            text not null default 'lead'
                     check (stage in ('lead','prospect','proposal','negotiation','closed_won','closed_lost')),
  assigned_to      uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── contracts ───────────────────────────────────────────────
create table contracts (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  title            text not null,
  value            numeric(12,2) not null,
  status           contract_status not null default 'active',
  start_date       date not null,
  end_date         date,
  created_at       timestamptz not null default now()
);

-- ─── financial_transactions ──────────────────────────────────
create table financial_transactions (
  id               uuid primary key default uuid_generate_v4(),
  organization_id  uuid references organizations(id) on delete set null,
  type             text not null check (type in ('revenue', 'expense', 'commission')),
  amount           numeric(12,2) not null,
  description      text not null,
  category         text,
  reference_date   date not null,
  created_by       uuid not null references profiles(id),
  created_at       timestamptz not null default now()
);

-- ─── audit_logs ──────────────────────────────────────────────
create table audit_logs (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles(id),
  organization_id  uuid references organizations(id) on delete set null,
  action           text not null,
  entity_type      text not null,
  entity_id        uuid,
  metadata         jsonb,
  created_at       timestamptz not null default now()
);

-- ─── Índices ─────────────────────────────────────────────────
create index on profiles (organization_id);
create index on profiles (role);
create index on organization_units (organization_id);
create index on psychosocial_diagnosis (organization_id);
create index on psychosocial_risks (organization_id);
create index on psychosocial_risks (diagnosis_id);
create index on action_plans (organization_id);
create index on action_items (action_plan_id);
create index on trainings (organization_id);
create index on documents (organization_id);
create index on pulse_surveys (organization_id);
create index on pulse_responses (survey_id);
create index on crm_contacts (assigned_to);
create index on contracts (organization_id);
create index on financial_transactions (organization_id);
create index on financial_transactions (reference_date);
create index on audit_logs (user_id);
create index on audit_logs (organization_id);

-- ─── updated_at automático ───────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger trg_diagnosis_updated_at
  before update on psychosocial_diagnosis
  for each row execute function update_updated_at();

create trigger trg_action_plans_updated_at
  before update on action_plans
  for each row execute function update_updated_at();

create trigger trg_crm_contacts_updated_at
  before update on crm_contacts
  for each row execute function update_updated_at();

-- ─── Trigger: criar profile ao registrar usuário ─────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'collaborator')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
