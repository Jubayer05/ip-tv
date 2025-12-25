# Running Load Tests on Contabo Server (Docker)

## Quick Setup (Copy-Paste Commands)

### 1. SSH into your server
```bash
ssh root@YOUR_CONTABO_IP
```

### 2. Navigate to your project
```bash
cd /path/to/your/iptv-project
# or wherever your docker-compose.yml is located
```

### 3. Install k6 (One-time setup)
```bash
# Add k6 repository and install
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install -y k6

# Verify
k6 version
```

### 4. Create test files on server

**Option A: Copy from local machine**
```bash
# From your LOCAL machine (not server), run:
scp -r /Users/shakaib/Desktop/Python/Iptv/load-test root@YOUR_CONTABO_IP:/root/load-test
```

**Option B: Create directly on server**
```bash
# On server
mkdir -p /root/load-test
cd /root/load-test
nano k6-quick-test.js
# Paste the content, save with Ctrl+X, Y, Enter
```

---

## Running Tests on Server

### D/R Test (Health Check)
```bash
cd /root/load-test
node dr-test.js
```

### Quick Load Test (100 users - 2 min)
```bash
cd /root/load-test
k6 run k6-quick-test.js
```

### Full Load Test (50K users - 38 min)
```bash
cd /root/load-test
k6 run k6-load-test.js
```

### Test Local Docker Container
```bash
# If testing the container directly (internal)
k6 run -e BASE_URL=http://localhost:3000 k6-load-test.js

# If testing through your domain
k6 run -e BASE_URL=https://www.cheapstreamtv.com k6-load-test.js
```

---

## Run in Background (Recommended for long tests)

```bash
# Start test in background with logging
cd /root/load-test
nohup k6 run k6-load-test.js > load-test-results.txt 2>&1 &

# Check if running
ps aux | grep k6

# Watch live results
tail -f load-test-results.txt

# Stop test if needed
pkill k6
```

---

## Monitor Server During Test

### Terminal 1: Run the test
```bash
k6 run k6-load-test.js
```

### Terminal 2: Monitor Docker containers
```bash
# Watch container stats (CPU, Memory)
docker stats

# Watch container logs
docker-compose logs -f
```

### Terminal 3: Monitor system resources
```bash
# Real-time system monitoring
htop

# Or simpler version
top

# Watch network connections
watch -n 1 'netstat -an | grep :3000 | wc -l'
```

---

## Using Docker to Run k6 (Alternative)

If you don't want to install k6 directly:

```bash
# Copy test file to server first, then:
docker run --rm -i grafana/k6 run - < k6-quick-test.js

# Or mount the directory
docker run --rm -v /root/load-test:/scripts grafana/k6 run /scripts/k6-load-test.js
```

---

## Check Docker Container Health

```bash
# List running containers
docker ps

# Check container resource usage
docker stats --no-stream

# Check container logs
docker-compose logs --tail=100 app

# Restart container if needed
docker-compose restart app
```

---

## Scaling Docker for Load Test

Before running 50K test, consider scaling:

```bash
# Edit docker-compose.yml to increase resources
# Add these under your app service:

services:
  app:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G

# Restart with new config
docker-compose down
docker-compose up -d
```

---

## Troubleshooting

### Test fails immediately
```bash
# Check if app is running
curl -I http://localhost:3000

# Check Docker status
docker-compose ps
docker-compose logs --tail=50
```

### High memory usage
```bash
# Clear Docker cache
docker system prune -f

# Restart containers
docker-compose restart
```

### Connection refused errors
```bash
# Check if port is open
netstat -tlnp | grep 3000

# Check firewall
ufw status
```

### k6 command not found
```bash
# Reinstall k6
sudo apt-get install --reinstall k6

# Or use Docker version
docker run --rm -i grafana/k6 version
```

---

## Results Location

After test completes:
```bash
# If ran with nohup
cat /root/load-test/load-test-results.txt

# Export to HTML report
k6 run --out json=results.json k6-load-test.js
```

---

## Quick Reference Commands

```bash
# SSH to server
ssh root@YOUR_CONTABO_IP

# Go to test folder
cd /root/load-test

# Run quick test
k6 run k6-quick-test.js

# Run full test in background
nohup k6 run k6-load-test.js > results.txt 2>&1 &

# Monitor Docker
docker stats

# Stop test
pkill k6

# View results
cat results.txt
```
