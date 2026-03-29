-- ============================================================
-- Gênesis NR-01 — Migration 002: Row Level Security
-- Garante que cada role só acessa os dados permitidos.
-- ============================================================

-- ─── Helpers ─────────────────────────────────────────────────
-- Retorna o role do usuário autenticado sem N+1 query
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql stable security definer;

-- Retorna o organization_id do usuário autenticado
create or replace function auth_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql stable security definer;

-- ─── Habilitar RLS em todas as tabelas ───────────────────────
alter table organizations         enable row level security;
alter table profiles              enable row level security;
alter table organization_units    enable row level security;
alter table psychosocial_diagnosis enable row level security;
alter table psychosocial_risks    enable row level security;
alter table action_plans          enable row level security;
alter table action_items          enable row level security;
alter table trainings             enable row level security;
alter table documents             enable row level security;
alter table pulse_surveys         enable row level security;
alter table pulse_responses       enable row level security;
alter table crm_contacts          enable row level security;
alter table contracts             enable row level security;
alter table financial_transactions enable row level security;
alter table audit_logs            enable row level security;

-- ─── organizations ───────────────────────────────────────────
-- genesis: vê todas | client_executive/collaborator/professional: apenas a sua
create policy "organizations: genesis vê todas"
  on organizations for select
  using (auth_role() = 'genesis');

create policy "organizations: membros vêem a sua"
  on organizations for select
  using (id = auth_org_id());

create policy "organizations: apenas genesis insere/atualiza"
  on organizations for all
  using (auth_role() = 'genesis');

-- ─── profiles ────────────────────────────────────────────────
create policy "profiles: usuário vê o próprio"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: genesis vê todos"
  on profiles for select
  using (auth_role() = 'genesis');

create policy "profiles: client_executive vê da mesma org"
  on profiles for select
  using (
    auth_role() = 'client_executive'
    and organization_id = auth_org_id()
  );

create policy "profiles: usuário atualiza o próprio"
  on profiles for update
  using (id = auth.uid());

create policy "profiles: genesis gerencia todos"
  on profiles for all
  using (auth_role() = 'genesis');

-- ─── organization_units ──────────────────────────────────────
create policy "units: genesis vê todas"
  on organization_units for select
  using (auth_role() = 'genesis');

create policy "units: membros vêem da sua org"
  on organization_units for select
  using (organization_id = auth_org_id());

create policy "units: genesis e client_executive gerenciam"
  on organization_units for all
  using (
    auth_role() = 'genesis'
    or (auth_role() = 'client_executive' and organization_id = auth_org_id())
  );

-- ─── psychosocial_diagnosis ──────────────────────────────────
create policy "diagnosis: genesis vê todos"
  on psychosocial_diagnosis for select
  using (auth_role() = 'genesis');

create policy "diagnosis: client_executive vê da sua org"
  on psychosocial_diagnosis for select
  using (
    auth_role() = 'client_executive'
    and organization_id = auth_org_id()
  );

create policy "diagnosis: genesis e professional gerenciam"
  on psychosocial_diagnosis for all
  using (auth_role() in ('genesis', 'professional'));

-- ─── psychosocial_risks ──────────────────────────────────────
create policy "risks: genesis vê todos"
  on psychosocial_risks for select
  using (auth_role() = 'genesis');

create policy "risks: client_executive e professional vêem da sua org"
  on psychosocial_risks for select
  using (
    auth_role() in ('client_executive', 'professional')
    and organization_id = auth_org_id()
  );

create policy "risks: genesis e professional gerenciam"
  on psychosocial_risks for all
  using (auth_role() in ('genesis', 'professional'));

-- ─── action_plans ────────────────────────────────────────────
create policy "action_plans: genesis vê todos"
  on action_plans for select
  using (auth_role() = 'genesis');

create policy "action_plans: client_executive vê da sua org"
  on action_plans for select
  using (
    auth_role() = 'client_executive'
    and organization_id = auth_org_id()
  );

create policy "action_plans: genesis e client_executive gerenciam"
  on action_plans for all
  using (
    auth_role() = 'genesis'
    or (auth_role() = 'client_executive' and organization_id = auth_org_id())
  );

-- ─── action_items ────────────────────────────────────────────
create policy "action_items: herda permissão do plano"
  on action_items for select
  using (
    exists (
      select 1 from action_plans ap
      where ap.id = action_plan_id
        and (
          auth_role() = 'genesis'
          or ap.organization_id = auth_org_id()
        )
    )
  );

create policy "action_items: genesis e client_executive gerenciam"
  on action_items for all
  using (
    exists (
      select 1 from action_plans ap
      where ap.id = action_plan_id
        and (
          auth_role() = 'genesis'
          or (auth_role() = 'client_executive' and ap.organization_id = auth_org_id())
        )
    )
  );

-- ─── trainings ───────────────────────────────────────────────
create policy "trainings: genesis vê todos"
  on trainings for select
  using (auth_role() = 'genesis');

create policy "trainings: membros vêem da sua org"
  on trainings for select
  using (organization_id = auth_org_id());

create policy "trainings: genesis e client_executive gerenciam"
  on trainings for all
  using (
    auth_role() = 'genesis'
    or (auth_role() = 'client_executive' and organization_id = auth_org_id())
  );

-- ─── documents ───────────────────────────────────────────────
create policy "documents: genesis vê todos"
  on documents for select
  using (auth_role() = 'genesis');

create policy "documents: membros vêem da sua org"
  on documents for select
  using (organization_id = auth_org_id());

create policy "documents: genesis e client_executive gerenciam"
  on documents for all
  using (
    auth_role() = 'genesis'
    or (auth_role() = 'client_executive' and organization_id = auth_org_id())
  );

-- ─── pulse_surveys ───────────────────────────────────────────
create policy "surveys: genesis vê todos"
  on pulse_surveys for select
  using (auth_role() = 'genesis');

create policy "surveys: membros vêem da sua org"
  on pulse_surveys for select
  using (organization_id = auth_org_id());

create policy "surveys: genesis e client_executive gerenciam"
  on pulse_surveys for all
  using (
    auth_role() = 'genesis'
    or (auth_role() = 'client_executive' and organization_id = auth_org_id())
  );

-- ─── pulse_responses ─────────────────────────────────────────
-- Colaborador só vê e insere as próprias respostas
create policy "responses: colaborador vê as próprias"
  on pulse_responses for select
  using (respondent_id = auth.uid());

create policy "responses: colaborador insere"
  on pulse_responses for insert
  with check (respondent_id = auth.uid());

create policy "responses: genesis e client_executive vêem da sua org"
  on pulse_responses for select
  using (
    auth_role() in ('genesis', 'client_executive')
    and exists (
      select 1 from pulse_surveys ps
      where ps.id = survey_id
        and (auth_role() = 'genesis' or ps.organization_id = auth_org_id())
    )
  );

-- ─── crm_contacts ────────────────────────────────────────────
create policy "crm: apenas genesis acessa"
  on crm_contacts for all
  using (auth_role() = 'genesis');

-- ─── contracts ───────────────────────────────────────────────
create policy "contracts: genesis vê todos"
  on contracts for select
  using (auth_role() = 'genesis');

create policy "contracts: client_executive vê da sua org"
  on contracts for select
  using (
    auth_role() = 'client_executive'
    and organization_id = auth_org_id()
  );

create policy "contracts: apenas genesis gerencia"
  on contracts for all
  using (auth_role() = 'genesis');

-- ─── financial_transactions ──────────────────────────────────
create policy "finance: apenas genesis acessa"
  on financial_transactions for all
  using (auth_role() = 'genesis');

-- ─── audit_logs ──────────────────────────────────────────────
create policy "audit: genesis vê todos"
  on audit_logs for select
  using (auth_role() = 'genesis');

create policy "audit: usuário vê os próprios"
  on audit_logs for select
  using (user_id = auth.uid());

create policy "audit: qualquer autenticado insere"
  on audit_logs for insert
  with check (user_id = auth.uid());
