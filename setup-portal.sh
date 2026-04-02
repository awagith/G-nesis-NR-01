#!/bin/bash
# =============================================================
# Gênesis NR-01 — Setup do servidor portal.genesis360care.com.br
# Compatível com Ubuntu 22.04 / Debian 12
# Execute como root ou com sudo:
#   sudo bash setup-portal.sh
# =============================================================

set -euo pipefail

DOMAIN="portal.genesis360care.com.br"
WEBROOT="/var/www/${DOMAIN}"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
NODE_VERSION="20"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[setup]${NC} $1"; }
warn() { echo -e "${YELLOW}[aviso]${NC} $1"; }
fail() { echo -e "${RED}[erro]${NC} $1"; exit 1; }

echo ""
echo "=============================================="
echo "  Gênesis NR-01 — Setup do servidor"
echo "  Domínio: ${DOMAIN}"
echo "=============================================="
echo ""

# ─── 1. Atualizar sistema ─────────────────────────────────────────────────────
log "1/8 Atualizando sistema..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── 2. Instalar Node.js ──────────────────────────────────────────────────────
log "2/8 Instalando Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
fi
node --version
npm --version

# ─── 3. Instalar Nginx ───────────────────────────────────────────────────────
log "3/8 Instalando Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# ─── 4. Instalar Certbot ──────────────────────────────────────────────────────
log "4/8 Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ─── 5. Criar webroot e permissões ───────────────────────────────────────────
log "5/8 Criando webroot ${WEBROOT}..."
mkdir -p "${WEBROOT}"
chown -R www-data:www-data "${WEBROOT}"

# ─── 6. Configurar Nginx ─────────────────────────────────────────────────────
log "6/8 Configurando Nginx..."
cp nginx.conf "${NGINX_CONF}"
ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ─── 7. Gerar certificado SSL ────────────────────────────────────────────────
log "7/8 Gerando certificado SSL para ${DOMAIN}..."
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    certbot --nginx -d "${DOMAIN}" --non-interactive --agree-tos \
        --email "admin@genesis360care.com.br" --redirect
    systemctl reload nginx
else
    warn "Certificado já existe, pulando geração."
fi

# ─── 8. Instalar Supabase CLI ────────────────────────────────────────────────
log "8/8 Instalando Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    npm install -g supabase
fi
supabase --version

# ─── Cron de renovação SSL ───────────────────────────────────────────────────
log "Configurando renovação automática do SSL..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -

# ─── Resumo ──────────────────────────────────────────────────────────────────
echo ""
echo "=============================================="
echo -e "  ${GREEN}Setup concluído!${NC}"
echo "=============================================="
echo ""
echo "  Webroot:  ${WEBROOT}"
echo "  Nginx:    ${NGINX_CONF}"
echo "  SSL:      auto-renovação às 03:00"
echo ""
echo "  Próximos passos:"
echo "  1. Configure os Secrets no GitHub (ver README)"
echo "  2. Faça push em main para disparar o deploy"
echo "  3. O CI/CD fará o build e enviará os arquivos para ${WEBROOT}"
echo ""
