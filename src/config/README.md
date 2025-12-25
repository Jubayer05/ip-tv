# Upload Configuration

This directory contains centralized configuration for file uploads across the application.

## Files

### `upload.js`

Centralized upload configuration that manages all file upload paths and validation.

## Usage

```javascript
import { uploadPaths, getPublicUrl, isValidFileType, isValidFileSize } from "@/config/upload";

// Get upload directory for specific type
const adsDir = uploadPaths.ads();
const logosDir = uploadPaths.logos();

// Get public URL for uploaded file
const imageUrl = getPublicUrl('ads', 'filename.jpg'); // Returns: /uploads/ads/filename.jpg

// Validate file
if (!isValidFileType(file)) {
  // Handle invalid file type
}

if (!isValidFileSize(file)) {
  // Handle file too large
}
```

## Environment Variables

- `UPLOAD_DIR` - Base upload directory (default: `{project-root}/public/uploads`)
  - In Docker: `/app/public/uploads`
  - In development: `{project-root}/public/uploads`

## Upload Directory Structure

```
public/
└── uploads/
    ├── ads/              # Ad images
    ├── logos/            # Site logos
    ├── payment-images/   # Payment gateway images
    ├── support/          # Support ticket attachments
    └── [general files]   # Other uploads
```

## Configuration Settings

### File Size Limits
- Default max size: **5MB**
- Configurable via `uploadConfig.maxFileSize`

### Allowed File Types
- Images: `jpeg`, `jpg`, `png`, `webp`, `gif`
- Configurable via `uploadConfig.allowedImageTypes`

## Docker Deployment

The upload directory is mounted as a Docker volume in `docker-compose.yml`:

```yaml
volumes:
  - ./public/uploads:/app/public/uploads
```

This ensures:
- Files persist across container restarts
- Files are accessible on the host machine
- Nginx can serve files directly from the host

## Nginx Configuration

Files are served directly by Nginx for better performance:

```nginx
location /uploads/ {
    alias /var/www/cheapstreamtv/public/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## Changing Upload Paths

To change the upload directory for the entire application:

1. Update `UPLOAD_DIR` in `.env.local`:
   ```bash
   UPLOAD_DIR=/app/public/uploads
   ```

2. Update Docker volume mapping in `docker-compose.yml` if needed

3. Update Nginx configuration to match new path

All upload routes will automatically use the new path!
