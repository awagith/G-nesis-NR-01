# =============================================================
# Gênesis NR-01 — Setup do ambiente de Production
# Execute: .\scripts\setup-prod.ps1
# ATENÇÃO: Este script altera o banco de PRODUÇÃO.
# =============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║     Gênesis NR-01 — Setup PRODUÇÃO       ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""
Write-Host "  ⚠ ATENÇÃO: Este script aplica migrations em PRODUÇÃO." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "  Digite 'PRODUÇÃO' para confirmar"
if ($confirm -ne "PRODUÇÃO") {
    Write-Host "  Operação cancelada." -ForegroundColor Gray
    exit 0
}

# ─── 1. Verificar .env.production ─────────────────────────────────────────────
Write-Host ""
Write-Host "[ 1/5 ] Verificando .env.production..." -ForegroundColor Yellow

if (-not (Test-Path ".env.production")) {
    Write-Host "  ✗ .env.production não encontrado." -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.production" -Raw
if ($envContent -match "SEU_PROJECT") {
    Write-Host "  ✗ .env.production ainda tem valores placeholder." -ForegroundColor Red
    exit 1
}

$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value.Trim()
$projectId   = ($supabaseUrl -split "https://")[1] -split "\." | Select-Object -First 1

Write-Host "  ✓ .env.production encontrado" -ForegroundColor Green
Write-Host "  → Project ID Prod: $projectId" -ForegroundColor Gray

# ─── 2. Login ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/5 ] Autenticando no Supabase..." -ForegroundColor Yellow
supabase login
Write-Host "  ✓ Autenticado" -ForegroundColor Green

# ─── 3. Linkar ao projeto prod ────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 3/5 ] Linkando ao projeto de produção ($projectId)..." -ForegroundColor Yellow
supabase link --project-ref $projectId
Write-Host "  ✓ Linkado à produção" -ForegroundColor Green

# ─── 4. Rodar migrations ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 4/5 ] Aplicando migrations em PRODUÇÃO..." -ForegroundColor Yellow
supabase db push
Write-Host "  ✓ Migrations aplicadas em produção" -ForegroundColor Green

# ─── 5. Gerar tipos ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 5/5 ] Gerando tipos TypeScript..." -ForegroundColor Yellow
supabase gen types typescript --project-id $projectId | Out-File -FilePath "src\types\database.ts" -Encoding utf8
Write-Host "  ✓ src/types/database.ts atualizado" -ForegroundColor Green

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    Produção configurada com sucesso! ✓   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Lembre-se de configurar os Secrets no GitHub para o CI/CD:" -ForegroundColor White
Write-Host "  PROD_SUPABASE_URL, PROD_SUPABASE_ANON_KEY, PROD_APP_URL" -ForegroundColor Gray
Write-Host ""
