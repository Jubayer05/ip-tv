#!/bin/bash
# monitor.sh - Add this to check container status

CONTAINER_NAME=$(docker compose ps -q app)

if [ -z "$CONTAINER_NAME" ]; then
    echo "Container is not running!"
    docker compose up -d
    exit 1
fi

HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null)

if [ "$HEALTH" != "healthy" ]; then
    echo "Container is unhealthy! Status: $HEALTH"
    echo "Restarting container..."
    docker compose restart app
fi