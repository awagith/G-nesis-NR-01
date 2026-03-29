# Gênesis NR-01

Plataforma SaaS de gestão de riscos psicossociais ocupacionais (NR-01).

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Estilo**: Tailwind CSS
- **Estado servidor**: TanStack React Query
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/jessestainx/G-nesis-NR-01.git
cd G-nesis-NR-01
npm install
```

### 2. Criar projetos no Supabase

Crie 3 projetos separados: genesis-nr01-dev, genesis-nr01-staging, genesis-nr01-prod

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.development
# Preencha com as credenciais do projeto dev
```

### 4. Executar migrations no Supabase SQL Editor

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
```

### 5. Criar primeiro usuário admin

Supabase Dashboard → Authentication → Users → Add user
- Email: admin@genesis.com
- User metadata: { "name": "Admin Genesis", "role": "genesis" }

### 6. Rodar

```bash
npm run dev
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Build produção |
| `npm run build:staging` | Build staging |
| `npm run type-check` | Verificar tipos |
| `npm run lint` | Lint zero warnings |
| `npm run format` | Prettier |

---

## Roles

| Role | Acesso |
|---|---|
| `genesis` | Admin total |
| `client_executive` | Empresa contratante |
| `collaborator` | Funcionário |
| `professional` | Psicólogo/especialista |

---

## Deploy

Push em `staging` → deploy staging | Push em `main` → deploy produção

Secrets necessários no GitHub: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, STAGING_SUPABASE_URL, STAGING_SUPABASE_ANON_KEY, PROD_SUPABASE_URL, PROD_SUPABASE_ANON_KEY

---

## Gerar tipos do Supabase

```bash
npx supabase gen types typescript --project-id SEU_ID > src/types/database.ts
```
