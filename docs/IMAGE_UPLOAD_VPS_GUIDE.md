# Image Upload System Documentation - VPS Deployment

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [File Flow Diagram](#file-flow-diagram)
4. [VPS Setup Guide](#vps-setup-guide)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)

---

## System Overview

This application uses a **hybrid approach** for handling image uploads in a Docker + Nginx VPS deployment:

- **Docker Container**: Handles upload API logic and saves files
- **Docker Volume**: Persists files between container restarts
- **Nginx**: Serves uploaded images directly from the host filesystem (faster than proxying through Node.js)

### Key Components

| Component              | Role                     | Location                                   |
| ---------------------- | ------------------------ | ------------------------------------------ |
| **Upload API Routes**  | Process file uploads     | `src/app/api/**/upload*/route.js`          |
| **Centralized Config** | Manages all upload paths | `src/config/upload.js`                     |
| **Docker Container**   | Runs Next.js app         | `/app` (inside container)                  |
| **Docker Volume**      | Stores uploaded files    | `./public/uploads` → `/app/public/uploads` |
| **Nginx**              | Serves static images     | `/var/www/cheapstreamtv/public/uploads`    |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                          │
│                    (User uploads image)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                            NGINX                                 │
│                  (Port 443 - HTTPS/SSL)                         │
│                                                                  │
│  ┌──────────────────────┐  ┌─────────────────────────────┐    │
│  │  POST /api/*/upload  │  │   GET /uploads/*            │    │
│  │  (Proxy to Docker)   │  │   (Serve directly from      │    │
│  │                      │  │    /var/www/.../uploads/)   │    │
│  └──────────┬───────────┘  └─────────────────────────────┘    │
└─────────────┼──────────────────────────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER CONTAINER                              │
│                   (Next.js Application)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Upload API Route                                         │  │
│  │  (src/app/api/ads/upload-image/route.js)                │  │
│  │                                                           │  │
│  │  1. Validates file (type, size)                         │  │
│  │  2. Generates unique filename                           │  │
│  │  3. Saves to: /app/public/uploads/ads/                 │  │
│  │  4. Returns URL: /uploads/ads/filename.jpg             │  │
│  └──────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         File System (Inside Container)                    │  │
│  │         /app/public/uploads/                             │  │
│  │         ├── ads/                                         │  │
│  │         ├── logos/                                       │  │
│  │         ├── payment-images/                              │  │
│  │         └── support/                                     │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────┘
                              │
                              │ (Docker Volume Mapping)
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       HOST VPS FILESYSTEM                        │
│                                                                  │
│         /var/www/cheapstreamtv/public/uploads/                  │
│         ├── ads/              ← Nginx serves from here          │
│         ├── logos/                                              │
│         ├── payment-images/                                     │
│         └── support/                                            │
│                                                                  │
│         Owner: 1001:www-data (Docker user + Nginx group)        │
│         Permissions: 775 (rwxrwxr-x)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Flow Diagram

### Upload Flow

```
1. User clicks "Upload Image" in browser
   ↓
2. Browser sends POST to https://cheapstreamtv.com/api/ads/upload-image
   ↓
3. Nginx receives request and proxies to Docker container (localhost:3000)
   ↓
4. Next.js API route (/api/ads/upload-image/route.js):
   - Validates file type (JPEG, PNG, WebP, GIF)
   - Validates file size (max 5MB)
   - Generates unique filename: ad_1234567890.jpg
   - Saves to: /app/public/uploads/ads/ad_1234567890.jpg
   ↓
5. Docker volume maps /app/public/uploads → /var/www/cheapstreamtv/public/uploads
   (File appears on host filesystem immediately)
   ↓
6. API returns JSON response:
   {
     "success": true,
     "data": {
       "imageUrl": "/uploads/ads/ad_1234567890.jpg"
     }
   }
   ↓
7. Browser displays image using URL: /uploads/ads/ad_1234567890.jpg
```

### Serving Flow (When Browser Requests Image)

```
1. Browser requests: https://cheapstreamtv.com/uploads/ads/ad_1234567890.jpg
   ↓
2. Nginx receives request
   ↓
3. Nginx checks location /uploads/ directive:
   - Maps to: /var/www/cheapstreamtv/public/uploads/ads/ad_1234567890.jpg
   - Serves file directly from host filesystem (NO Docker involved)
   - Adds cache headers: Cache-Control: public, max-age=2592000
   ↓
4. Browser receives image and caches it for 30 days
```

---

## VPS Setup Guide

### Prerequisites

✅ Docker and Docker Compose installed
✅ Nginx installed
✅ Application deployed to `/var/www/cheapstreamtv`
✅ SSL certificate configured (Let's Encrypt)

---

### Step 1: Update Nginx Configuration

SSH to your VPS:

```bash
ssh -p 5875 root@109.199.119.157
```

Edit the Nginx configuration:

```bash
nano /etc/nginx/sites-available/cheapstreamtv.conf
```

**Replace entire contents with:**

```nginx
# Upstream for better connection handling
upstream nextjs_app {
    server localhost:3000;
    keepalive 64;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name cheapstreamtv.com www.cheapstreamtv.com;

    return 301 https://$host$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cheapstreamtv.com www.cheapstreamtv.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/cheapstreamtv.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cheapstreamtv.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # ============================================================
    # UPLOAD CONFIGURATION
    # ============================================================

    # Maximum upload file size (CRITICAL for image uploads)
    client_max_body_size 50M;

    # Logs
    access_log /var/log/nginx/cheapstreamtv_access.log;
    error_log /var/log/nginx/cheapstreamtv_error.log;

    # ============================================================
    # SERVE UPLOADED IMAGES DIRECTLY FROM HOST
    # This is MUCH faster than proxying through Node.js
    # ============================================================
    location /uploads/ {
        # Map /uploads/ URL to host filesystem path
        alias /var/www/cheapstreamtv/public/uploads/;

        # Cache uploaded images for 30 days
        expires 30d;
        add_header Cache-Control "public, immutable";

        # Allow cross-origin requests (if needed)
        add_header Access-Control-Allow-Origin "*";

        # Security: Block script execution
        location ~ \.(php|asp|aspx|jsp)$ {
            deny all;
        }

        # Try to serve file, return 404 if not found
        try_files $uri =404;
    }

    # ============================================================
    # NEXT.JS STATIC FILES (with long cache)
    # ============================================================
    location /_next/static/ {
        proxy_pass http://nextjs_app;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js Image Optimization
    location /_next/image {
        proxy_pass http://nextjs_app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint (no logging)
    location /api/health {
        proxy_pass http://nextjs_app;
        access_log off;
    }

    # ============================================================
    # PROXY ALL OTHER REQUESTS TO NEXT.JS
    # ============================================================
    location / {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Forward real client IP and host info
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Timeouts (important for file uploads)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}
```

**Save and exit:** `Ctrl + X`, then `Y`, then `Enter`

---

### Step 2: Create Upload Directories

```bash
cd /var/www/cheapstreamtv

# Create directory structure
mkdir -p public/uploads/{ads,logos,payment-images,support}

# Verify directories were created
ls -la public/uploads/
```

Expected output:

```
drwxr-xr-x 6 root root 4096 Dec 20 12:00 .
drwxr-xr-x 3 root root 4096 Dec 20 12:00 ..
drwxr-xr-x 2 root root 4096 Dec 20 12:00 ads
drwxr-xr-x 2 root root 4096 Dec 20 12:00 logos
drwxr-xr-x 2 root root 4096 Dec 20 12:00 payment-images
drwxr-xr-x 2 root root 4096 Dec 20 12:00 support
```

---

### Step 3: Fix File Permissions

**Why is this critical?**

- Docker container runs as user ID `1001` (non-root for security)
- Nginx runs as user `www-data`
- Both need access to the uploads folder

```bash
# Set ownership: Docker user (1001) owns files, Nginx group can read
chown -R 1001:www-data public/uploads

# Set permissions:
# - Owner (1001): Read, Write, Execute (7)
# - Group (www-data): Read, Write, Execute (7)
# - Others: Read, Execute (5)
chmod -R 775 public/uploads

# Verify permissions
ls -la public/uploads/
```

Expected output:

```
drwxrwxr-x 6 1001 www-data 4096 Dec 20 12:00 .
drwxrwxr-x 6 1001 www-data 4096 Dec 20 12:00 ads
drwxrwxr-x 6 1001 www-data 4096 Dec 20 12:00 logos
drwxrwxr-x 6 1001 www-data 4096 Dec 20 12:00 payment-images
drwxrwxr-x 6 1001 www-data 4096 Dec 20 12:00 support
```

---

### Step 4: Test Nginx Configuration

```bash
# Test for syntax errors
nginx -t
```

✅ **Expected output:**

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

❌ **If you see errors:**

- Double-check your Nginx config for typos
- Ensure all SSL certificate paths exist
- Check that all `}` braces are properly closed

---

### Step 5: Reload Nginx

```bash
# Reload Nginx (zero downtime)
systemctl reload nginx

# Verify Nginx is running
systemctl status nginx
```

✅ **Expected output:**

```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running) since ...
```

---

### Step 6: Verify Docker Container

```bash
cd /var/www/cheapstreamtv

# Check if container is running
docker compose ps

# View recent logs
docker compose logs --tail=50

# Check environment variables are set
docker compose exec app printenv | grep UPLOAD_DIR
```

✅ **Expected output:**

```
UPLOAD_DIR=/app/public/uploads
```

---

## Testing & Verification

### Test 1: Upload Permissions

```bash
cd /var/www/cheapstreamtv

# Test if Docker user can write to uploads
sudo -u "#1001" touch public/uploads/test.txt

# Test if Nginx can read from uploads
sudo -u www-data cat public/uploads/test.txt

# Cleanup
rm public/uploads/test.txt
```

✅ Both commands should succeed without errors.

---

### Test 2: Create Test Image

```bash
# Create a test image file
echo "TEST IMAGE" > /var/www/cheapstreamtv/public/uploads/test.txt
```

**Access in browser:**

```
https://cheapstreamtv.com/uploads/test.txt
```

✅ Should display: `TEST IMAGE`

**Check response headers (optional):**

```bash
curl -I https://cheapstreamtv.com/uploads/test.txt
```

✅ Should include:

```
HTTP/2 200
cache-control: public, immutable
expires: [30 days from now]
```

---

### Test 3: Upload Real Image

1. **Log in to admin panel:**

   ```
   https://cheapstreamtv.com/admin
   ```

2. **Navigate to Ads Management**

3. **Click "Upload Image"**

4. **Select an image file** (JPEG, PNG, WebP, or GIF, max 5MB)

5. **Click "Upload"**

✅ **Success indicators:**

- Upload completes without errors
- Image preview displays correctly
- Image URL looks like: `/uploads/ads/ad_1234567890.jpg`

6. **Verify file exists on server:**
   ```bash
   ls -lh /var/www/cheapstreamtv/public/uploads/ads/
   ```

---

### Test 4: Access Uploaded Image

Copy the image URL from step 3 (e.g., `/uploads/ads/ad_1234567890.jpg`)

**Access in browser:**

```
https://cheapstreamtv.com/uploads/ads/ad_1234567890.jpg
```

✅ Image should display correctly

---

## Troubleshooting

### Issue 1: "500 Internal Server Error" on Upload

**Symptoms:**

- Upload fails with 500 error
- Console shows: `POST /api/ads/upload-image 500`

**Diagnosis:**

```bash
# Check Docker logs
docker compose logs --tail=100 app

# Look for errors like:
# "ENOENT: no such file or directory"
# "EACCES: permission denied"
```

**Solution:**

```bash
# Fix permissions
cd /var/www/cheapstreamtv
chown -R 1001:www-data public/uploads
chmod -R 775 public/uploads

# Restart Docker container
docker compose restart app
```

---

### Issue 2: "404 Not Found" When Accessing Image

**Symptoms:**

- Upload succeeds
- But accessing `/uploads/...` returns 404

**Diagnosis:**

```bash
# Check if file exists
ls -la /var/www/cheapstreamtv/public/uploads/ads/

# Check Nginx error logs
tail -50 /var/log/nginx/cheapstreamtv_error.log
```

**Possible causes:**

**A. Nginx config issue:**

```bash
# Test Nginx config
nginx -t

# Check Nginx is reloaded
systemctl status nginx
```

**B. Wrong file path in Nginx:**

```bash
# Verify alias path in Nginx config
grep -A 5 "location /uploads" /etc/nginx/sites-available/cheapstreamtv.conf

# Should show:
# alias /var/www/cheapstreamtv/public/uploads/;
```

**C. Permissions issue:**

```bash
# Test if Nginx can read file
sudo -u www-data cat /var/www/cheapstreamtv/public/uploads/ads/[filename]
```

---

### Issue 3: "413 Request Entity Too Large"

**Symptoms:**

- Large images (>1MB) fail to upload
- Error: "413 Request Entity Too Large"

**Solution:**

```bash
# Edit Nginx config
nano /etc/nginx/sites-available/cheapstreamtv.conf

# Ensure this line exists in the server block:
client_max_body_size 50M;

# Test and reload
nginx -t
systemctl reload nginx
```

---

### Issue 4: Images Not Persisting After Container Restart

**Symptoms:**

- Upload works
- But images disappear after `docker compose restart`

**Diagnosis:**

```bash
# Check volume mapping
docker compose config | grep -A 2 "volumes:"

# Should show:
# volumes:
#   - ./public/uploads:/app/public/uploads
```

**Solution:**
If volume is missing, add to `docker-compose.yml`:

```yaml
volumes:
  - ./public/uploads:/app/public/uploads
```

Then rebuild:

```bash
docker compose down
docker compose up -d --build
```

---

### Issue 5: Permission Denied Errors

**Symptoms:**

```
Error: EACCES: permission denied, open '/app/public/uploads/ads/file.jpg'
```

**Solution:**

```bash
# Check current permissions
ls -la /var/www/cheapstreamtv/public/uploads/

# Fix ownership and permissions
cd /var/www/cheapstreamtv
chown -R 1001:www-data public/uploads
chmod -R 775 public/uploads

# Verify
ls -la public/uploads/
# Should show: drwxrwxr-x 6 1001 www-data
```

---

## Maintenance

### Regular Tasks

#### Daily

- Monitor upload folder size:
  ```bash
  du -sh /var/www/cheapstreamtv/public/uploads
  ```

#### Weekly

- Check Nginx logs for 404s:
  ```bash
  grep "404" /var/log/nginx/cheapstreamtv_error.log | tail -20
  ```

#### Monthly

- Clean up old/unused images (manual review recommended)
- Rotate Nginx logs (usually automatic via logrotate)

---

### Backup Uploaded Images

**Manual backup:**

```bash
# Create timestamped backup
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz \
  /var/www/cheapstreamtv/public/uploads

# Move to backup directory
mv uploads-backup-*.tar.gz /var/backups/
```

**Automated backup (cron job):**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * tar -czf /var/backups/uploads-backup-$(date +\%Y\%m\%d).tar.gz \
  /var/www/cheapstreamtv/public/uploads
```

---

### Restore from Backup

```bash
# Extract backup
cd /var/www/cheapstreamtv
tar -xzf /var/backups/uploads-backup-20241220.tar.gz

# Fix permissions
chown -R 1001:www-data public/uploads
chmod -R 775 public/uploads
```

---

### Monitoring Disk Space

```bash
# Check disk usage
df -h

# Find large files in uploads
find /var/www/cheapstreamtv/public/uploads -type f -size +5M -exec ls -lh {} \;
```

**Set up alert (optional):**

```bash
# Create monitoring script
nano /usr/local/bin/check-disk-space.sh
```

```bash
#!/bin/bash
THRESHOLD=80
CURRENT=$(df /var/www | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $CURRENT -gt $THRESHOLD ]; then
    echo "Disk usage is ${CURRENT}% (threshold: ${THRESHOLD}%)" | \
    mail -s "Disk Space Alert" admin@cheapstreamtv.com
fi
```

```bash
# Make executable
chmod +x /usr/local/bin/check-disk-space.sh

# Add to cron (hourly check)
crontab -e
0 * * * * /usr/local/bin/check-disk-space.sh
```

---

## Quick Reference Commands

### Check Status

```bash
# Nginx status
systemctl status nginx

# Docker status
docker compose ps

# View logs
docker compose logs --tail=50 app
tail -50 /var/log/nginx/cheapstreamtv_error.log
```

### Restart Services

```bash
# Restart Docker container
docker compose restart app

# Reload Nginx (zero downtime)
systemctl reload nginx

# Restart Nginx (brief downtime)
systemctl restart nginx
```

### Permission Fix

```bash
cd /var/www/cheapstreamtv
chown -R 1001:www-data public/uploads
chmod -R 775 public/uploads
```

### Test Upload

```bash
# Create test file
echo "test" > /var/www/cheapstreamtv/public/uploads/test.txt

# Access in browser
curl https://cheapstreamtv.com/uploads/test.txt

# Cleanup
rm /var/www/cheapstreamtv/public/uploads/test.txt
```

---

## Support & Additional Resources

### Log Files

- **Nginx Access:** `/var/log/nginx/cheapstreamtv_access.log`
- **Nginx Errors:** `/var/log/nginx/cheapstreamtv_error.log`
- **Docker Container:** `docker compose logs app`

### Configuration Files

- **Nginx Config:** `/etc/nginx/sites-available/cheapstreamtv.conf`
- **Docker Compose:** `/var/www/cheapstreamtv/docker-compose.yml`
- **Upload Config:** `/var/www/cheapstreamtv/src/config/upload.js`

### Important Paths

- **Upload Directory (Host):** `/var/www/cheapstreamtv/public/uploads`
- **Upload Directory (Docker):** `/app/public/uploads`
- **Application Root:** `/var/www/cheapstreamtv`

---

## Summary

✅ **What You've Set Up:**

1. Centralized upload configuration in code
2. Docker volume for persistent file storage
3. Nginx serving images directly (fast!)
4. Proper permissions for Docker + Nginx
5. SSL-secured image uploads and serving
6. Organized directory structure by file type

✅ **Key Features:**

- Images survive container restarts
- Fast image serving (Nginx direct, no Node.js proxy)
- Secure (proper permissions, no script execution)
- Scalable (easy to add new upload types)
- Maintainable (change one config file)

✅ **Your Image Upload System is Production-Ready!** 🎉
