#!/bin/bash

# Cheap Stream TV Deployment Script
# Usage: ./scripts/deploy.sh

set -e

# Configuration
APP_DIR="/var/www/cheapstreamtv"
APP_NAME="iptv-app"
BRANCH="main"
LOG_DIR="/var/log/pm2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

# Create log directory if it doesn't exist
setup_logs() {
    log_info "Setting up log directory..."
    mkdir -p $LOG_DIR
    chown -R www-data:www-data $LOG_DIR 2>/dev/null || true
}

# Pull latest code from git
pull_latest() {
    log_info "Pulling latest code from $BRANCH..."
    cd $APP_DIR
    git fetch origin $BRANCH
    git reset --hard origin/$BRANCH
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    cd $APP_DIR
    npm ci --legacy-peer-deps
}

# Build the application
build_app() {
    log_info "Building Next.js application..."
    cd $APP_DIR

    # Source environment variables safely (handles multiline values like FIREBASE_PRIVATE_KEY)
    if [ -f .env ]; then
        set -a
        source .env
        set +a
    fi

    npm run build
}

# Restart PM2 application
restart_pm2() {
    log_info "Restarting PM2 application..."
    cd $APP_DIR

    # Check if app exists in PM2
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        log_info "Reloading existing PM2 process..."
        pm2 reload ecosystem.config.js --env production
    else
        log_info "Starting new PM2 process..."
        pm2 start ecosystem.config.js --env production
    fi

    # Save PM2 process list
    pm2 save
}

# Test nginx configuration
test_nginx() {
    log_info "Testing Nginx configuration..."
    nginx -t
}

# Reload nginx
reload_nginx() {
    log_info "Reloading Nginx..."
    systemctl reload nginx
}

# Health check
health_check() {
    log_info "Performing health check..."
    sleep 5

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_info "Health check passed!"
            return 0
        fi
        log_warn "Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 3
        attempt=$((attempt + 1))
    done

    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show PM2 status
show_status() {
    log_info "Current PM2 status:"
    pm2 status
}

# Main deployment function
main() {
    log_info "Starting deployment..."

    check_permissions
    setup_logs
    pull_latest
    install_deps
    build_app
    restart_pm2
    test_nginx
    reload_nginx
    health_check
    show_status

    log_info "Deployment completed successfully!"
}

# Run main function
main "$@"
