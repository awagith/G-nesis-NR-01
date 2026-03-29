# Gênesis NR-01

Plataforma SaaS de gestão de riscos psicossociais ocupacionais (NR-01).

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Estilo**: Tailwind CSS
- **Estado servidor**: TanStack React Query
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel

---

## Setup — passo a passo

### 1. Pré-requisitos

- Node.js 20+
- Supabase CLI: `winget install Supabase.CLI`
- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com)

### 2. Clonar e instalar

```powershell
git clone https://github.com/jessestainx/G-nesis-NR-01.git
cd G-nesis-NR-01
npm install
```

### 3. Criar projetos no Supabase

Crie **3 projetos** em [supabase.com/dashboard](https://supabase.com/dashboard):
- `genesis-nr01-dev`
- `genesis-nr01-staging`
- `genesis-nr01-prod`

### 4. Configurar variáveis de ambiente

```powershell
copy .env.example .env.development
copy .env.example .env.staging
copy .env.example .env.production
```

Preencha cada arquivo com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
do projeto correspondente (Supabase → Settings → API).

### 5. Setup do banco de dev

```powershell
.\scripts\setup-dev.ps1
```

Este script automaticamente:
- Autentica no Supabase CLI
- Linka ao projeto dev
- Aplica as 3 migrations (schema + RLS + storage)
- Gera `src/types/database.ts` com tipos reais

### 6. Criar o usuário admin

No Supabase Dashboard → **Authentication → Users → Add user**:
- Email: `admin@genesis.com`
- User metadata:
```json
{ "name": "Admin Genesis", "role": "genesis" }
```

### 7. Rodar localmente

```powershell
npm run dev
```

Acesse: http://localhost:5173

---

## Scripts disponíveis

### Desenvolvimento

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Build produção |
| `npm run build:staging` | Build staging |
| `npm run type-check` | Verificar tipos TypeScript |
| `npm run lint` | Lint (zero warnings) |
| `npm run format` | Formatar código com Prettier |

### Supabase

| Comando | Descrição |
|---|---|
| `npm run supabase:setup:dev` | Setup completo do banco dev |
| `npm run supabase:setup:staging` | Setup completo do banco staging |
| `npm run supabase:setup:prod` | Setup completo do banco produção |
| `npm run supabase:gen-types` | Regenerar tipos TypeScript (dev) |
| `npm run supabase:gen-types:staging` | Regenerar tipos TypeScript (staging) |

---

## Arquitetura

```
src/
├── App.tsx                          # Roteamento + providers
├── contexts/AuthContext.tsx         # AuthProvider
├── contexts/authContext.internal.ts # Context object
├── hooks/
│   ├── useAuth.ts                   # Hook de autenticação
│   └── queries/                     # Hooks React Query por domínio
│       ├── useOrganizations.ts
│       ├── useDiagnosis.ts
│       ├── useActionPlans.ts
│       ├── useDocuments.ts
│       ├── useFinance.ts
│       └── useProfiles.ts
├── services/                        # Lógica de negócio + auditoria
│   ├── organization.service.ts
│   ├── diagnosis.service.ts
│   ├── action-plan.service.ts
│   ├── document.service.ts
│   ├── crm.service.ts
│   ├── finance.service.ts
│   └── profile.service.ts
├── repositories/                    # Acesso ao Supabase
│   ├── base.repository.ts           # CRUD genérico
│   ├── organization.repository.ts
│   ├── profile.repository.ts
│   ├── diagnosis.repository.ts
│   ├── action-plan.repository.ts
│   ├── document.repository.ts
│   ├── crm.repository.ts
│   ├── finance.repository.ts
│   └── audit.repository.ts
├── lib/
│   ├── supabase.ts                  # Cliente singleton
│   ├── env.ts                       # Validação de env no boot
│   └── queryClient.ts               # React Query config
├── types/
│   ├── index.ts                     # Tipos de domínio
│   ├── auth.ts                      # Tipos de autenticação
│   └── database.ts                  # Gerado pelo Supabase CLI
└── utils/format.ts                  # Formatadores (data, moeda, labels)
```

### Fluxo de dados

```
UI (componente)
  → Hook React Query  (useOrganizations, useDiagnosis...)
    → Service         (organizationService, diagnosisService...)
      → Repository    (organizationRepository...)
        → Supabase    (PostgreSQL + RLS)
```

### Roles

| Role | Acesso |
|---|---|
| `genesis` | Admin total — todos os clientes, CRM, financeiro |
| `client_executive` | Empresa contratante — apenas sua org |
| `collaborator` | Funcionário — pesquisas e escuta |
| `professional` | Psicólogo/especialista — casos sensíveis |

---

## Ambientes

| Ambiente | Branch | URL |
|---|---|---|
| Development | qualquer | `localhost:5173` |
| Staging | `staging` | `staging.seudominio.com.br` |
| Production | `main` | `seudominio.com.br` |

---

## Deploy (Vercel + GitHub Actions)

Configure os Secrets em: GitHub → Settings → Secrets → Actions

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY
STAGING_APP_URL
PROD_SUPABASE_URL
PROD_SUPABASE_ANON_KEY
PROD_APP_URL
```

O CI/CD dispara automaticamente:
- **Qualquer push** → lint + type-check + build
- **Push em `staging`** → deploy staging
- **Push em `main`** → deploy produção

---

## Migrations

Execute na ordem após criar cada projeto Supabase:

```
supabase/migrations/001_initial_schema.sql  — 15 tabelas + triggers + índices
supabase/migrations/002_rls_policies.sql    — Row Level Security por role
supabase/migrations/003_storage.sql         — Bucket documents + políticas
```

Os scripts `setup-*.ps1` fazem isso automaticamente.

---

## Regenerar tipos após mudança no schema

```powershell
npm run supabase:gen-types
```
