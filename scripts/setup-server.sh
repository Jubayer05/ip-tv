#!/bin/bash

# Server Setup Script for Cheap Stream TV
# Run this once on a fresh Ubuntu server
# Usage: sudo ./scripts/setup-server.sh

set -e

# Configuration
APP_DIR="/var/www/cheapstreamtv"
DOMAIN="cheapstreamtv.com"
NODE_VERSION="20"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root"
    exit 1
fi

log_info "Starting server setup for Cheap Stream TV..."

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw

# Install Node.js
log_info "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verify Node.js installation
node -v
npm -v

# Install PM2 globally
log_info "Installing PM2..."
npm install -g pm2

# Configure PM2 to start on boot
log_info "Configuring PM2 startup..."
pm2 startup systemd -u root --hp /root

# Create application directory
log_info "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p /var/log/pm2

# Clone repository (if not exists)
if [ ! -d "$APP_DIR/.git" ]; then
    log_info "Cloning repository..."
    git clone https://github.com/BlacK-KingS/Iptv.git $APP_DIR
fi

# Configure firewall
log_info "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup Nginx
log_info "Setting up Nginx..."
rm -f /etc/nginx/sites-enabled/default

# Copy Nginx config
if [ -f "$APP_DIR/nginx/cheapstreamtv.conf" ]; then
    cp $APP_DIR/nginx/cheapstreamtv.conf /etc/nginx/sites-available/cheapstreamtv.conf
    ln -sf /etc/nginx/sites-available/cheapstreamtv.conf /etc/nginx/sites-enabled/
fi

# Test Nginx config (will fail until SSL is setup)
log_warn "Nginx config test may fail until SSL certificates are installed"

# Create directory for certbot
mkdir -p /var/www/certbot

# Instructions for SSL
log_info "============================================"
log_info "Server setup complete!"
log_info "============================================"
log_info ""
log_info "Next steps:"
log_info "1. Create .env file in $APP_DIR with your environment variables"
log_info ""
log_info "2. Install SSL certificate:"
log_info "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
log_info ""
log_info "3. Run the deployment:"
log_info "   cd $APP_DIR && sudo ./scripts/deploy.sh"
log_info ""
log_info "4. Check status:"
log_info "   pm2 status"
log_info "   pm2 logs iptv-app"
log_info ""
log_info "============================================"
