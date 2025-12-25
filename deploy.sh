#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Docker Deployment...${NC}"

# Navigate to project directory
cd ~/Iptv || exit

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git pull origin main || git pull origin dev-jubayer

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found!${NC}"
    echo -e "${YELLOW}Please create .env.local with all required environment variables.${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# Remove old images (optional, to save space)
# docker image prune -f

# Build and start containers
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

# Wait for container to be healthy
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Check container status
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}📊 Container status:${NC}"
    docker compose ps
    
    echo -e "${GREEN}📝 Recent logs:${NC}"
    docker compose logs --tail=20
    
    echo -e "${GREEN}🌐 Application should be running at: http://109.199.119.157:3000${NC}"
else
    echo -e "${RED}❌ Deployment failed! Check logs:${NC}"
    docker compose logs
    exit 1
fi