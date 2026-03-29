# =============================================================
# Gênesis NR-01 — Setup do ambiente de Development
# Execute no PowerShell dentro da pasta do projeto:
#   .\scripts\setup-dev.ps1
# =============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Gênesis NR-01 — Setup Dev            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Verificar Supabase CLI ─────────────────────────────────────────────────
Write-Host "[ 1/6 ] Verificando Supabase CLI..." -ForegroundColor Yellow

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "  Instale com: winget install Supabase.CLI" -ForegroundColor White
    Write-Host "  Ou via scoop: scoop install supabase" -ForegroundColor White
    exit 1
}

$cliVersion = supabase --version
Write-Host "  ✓ Supabase CLI $cliVersion" -ForegroundColor Green

# ─── 2. Verificar .env.development ─────────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/6 ] Verificando .env.development..." -ForegroundColor Yellow

if (-not (Test-Path ".env.development")) {
    Write-Host "  ✗ Arquivo .env.development não encontrado." -ForegroundColor Red
    Write-Host "  Copie o exemplo: copy .env.example .env.development" -ForegroundColor White
    exit 1
}

$envContent = Get-Content ".env.development" -Raw
if ($envContent -match "SEU_PROJECT") {
    Write-Host "  ✗ .env.development ainda tem valores placeholder." -ForegroundColor Red
    Write-Host "  Preencha com as credenciais do seu projeto Supabase de DEV." -ForegroundColor White
    exit 1
}

# Extrair variáveis do .env
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value.Trim()
$projectId   = ($supabaseUrl -split "https://")[1] -split "\." | Select-Object -First 1

Write-Host "  ✓ .env.development encontrado" -ForegroundColor Green
Write-Host "  → Project ID: $projectId" -ForegroundColor Gray

# ─── 3. Login no Supabase ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 3/6 ] Autenticando no Supabase..." -ForegroundColor Yellow
Write-Host "  (será aberto o browser para login se necessário)" -ForegroundColor Gray

supabase login

Write-Host "  ✓ Autenticado" -ForegroundColor Green

# ─── 4. Linkar ao projeto dev ──────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 4/6 ] Linkando ao projeto dev ($projectId)..." -ForegroundColor Yellow

supabase link --project-ref $projectId

Write-Host "  ✓ Projeto linkado" -ForegroundColor Green

# ─── 5. Rodar migrations ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 5/6 ] Rodando migrations no banco de dev..." -ForegroundColor Yellow
Write-Host "  Migrations:" -ForegroundColor Gray
Write-Host "    → 001_initial_schema.sql (15 tabelas + triggers + índices)" -ForegroundColor Gray
Write-Host "    → 002_rls_policies.sql   (Row Level Security por role)" -ForegroundColor Gray
Write-Host "    → 003_storage.sql        (bucket documents + políticas)" -ForegroundColor Gray

supabase db push

Write-Host "  ✓ Migrations aplicadas com sucesso" -ForegroundColor Green

# ─── 6. Gerar tipos TypeScript ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 6/6 ] Gerando tipos TypeScript do banco..." -ForegroundColor Yellow

supabase gen types typescript --project-id $projectId | Out-File -FilePath "src\types\database.ts" -Encoding utf8

Write-Host "  ✓ src/types/database.ts atualizado com tipos reais" -ForegroundColor Green

# ─── Resumo ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         Setup concluído! ✓               ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor White
Write-Host "  1. Crie o usuário admin no Supabase Dashboard:" -ForegroundColor Gray
Write-Host "     Authentication → Users → Add user" -ForegroundColor Gray
Write-Host "     Email: admin@genesis.com" -ForegroundColor Gray
Write-Host "     Metadata: { ""name"": ""Admin Genesis"", ""role"": ""genesis"" }" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Rode o projeto:" -ForegroundColor Gray
Write-Host "     npm run dev" -ForegroundColor Cyan
Write-Host ""
