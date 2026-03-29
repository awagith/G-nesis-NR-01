# =============================================================
# Gênesis NR-01 — Regenerar tipos TypeScript do Supabase
# Execute após qualquer mudança no schema do banco:
#   .\scripts\gen-types.ps1
#   .\scripts\gen-types.ps1 -Env staging
#   .\scripts\gen-types.ps1 -Env prod
# =============================================================

param(
    [ValidateSet("dev", "staging", "prod")]
    [string]$Env = "dev"
)

$envFile = switch ($Env) {
    "dev"     { ".env.development" }
    "staging" { ".env.staging" }
    "prod"    { ".env.production" }
}

Write-Host ""
Write-Host "[ gen-types ] Ambiente: $Env → $envFile" -ForegroundColor Cyan

if (-not (Test-Path $envFile)) {
    Write-Host "  ✗ $envFile não encontrado." -ForegroundColor Red
    exit 1
}

$envContent  = Get-Content $envFile -Raw
$supabaseUrl = ($envContent | Select-String "VITE_SUPABASE_URL=(.+)").Matches.Groups[1].Value.Trim()
$projectId   = ($supabaseUrl -split "https://")[1] -split "\." | Select-Object -First 1

Write-Host "  Project ID: $projectId" -ForegroundColor Gray
Write-Host "  Gerando src\types\database.ts..." -ForegroundColor Yellow

supabase gen types typescript --project-id $projectId | Out-File -FilePath "src\types\database.ts" -Encoding utf8

Write-Host "  ✓ Tipos gerados com sucesso!" -ForegroundColor Green
Write-Host ""
