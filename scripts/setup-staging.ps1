# =============================================================
# Gênesis NR-01 — Setup do ambiente de Staging
# Execute: .\scripts\setup-staging.ps1
# =============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     Gênesis NR-01 — Setup Staging        ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ─── 1. Verificar .env.staging ────────────────────────────────────────────────
Write-Host "[ 1/5 ] Verificando .env.staging..." -ForegroundColor Yellow

if (-not (Test-Path ".env.staging")) {
    Write-Host "  ✗ .env.staging não encontrado." -ForegroundColor Red
    Write-Host "  Copie: copy .env.example .env.staging" -ForegroundColor White
    exit 1
}

$envContent = Get-Content ".env.staging" -Raw
if ($envContent -match "SEU_PROJECT") {
    Write-Host "  ✗ .env.staging ainda tem valores placeholder." -ForegroundColor Red
    exit 1
}

$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value.Trim()
$projectId   = ($supabaseUrl -split "https://")[1] -split "\." | Select-Object -First 1

Write-Host "  ✓ .env.staging encontrado" -ForegroundColor Green
Write-Host "  → Project ID Staging: $projectId" -ForegroundColor Gray

# ─── 2. Login ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 2/5 ] Autenticando no Supabase..." -ForegroundColor Yellow
supabase login
Write-Host "  ✓ Autenticado" -ForegroundColor Green

# ─── 3. Linkar ao projeto staging ─────────────────────────────────────────────
Write-Host ""
Write-Host "[ 3/5 ] Linkando ao projeto staging ($projectId)..." -ForegroundColor Yellow
supabase link --project-ref $projectId
Write-Host "  ✓ Linkado ao staging" -ForegroundColor Green

# ─── 4. Rodar migrations ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 4/5 ] Aplicando migrations no staging..." -ForegroundColor Yellow
supabase db push
Write-Host "  ✓ Migrations aplicadas" -ForegroundColor Green

# ─── 5. Gerar tipos ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[ 5/5 ] Gerando tipos TypeScript..." -ForegroundColor Yellow
supabase gen types typescript --project-id $projectId | Out-File -FilePath "src\types\database.ts" -Encoding utf8
Write-Host "  ✓ src/types/database.ts atualizado" -ForegroundColor Green

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    Staging configurado com sucesso! ✓    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Deploy staging: git push origin staging" -ForegroundColor Cyan
Write-Host ""
