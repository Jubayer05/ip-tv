import path from "path";

/**
 * Centralized Upload Configuration
 * 
 * All file upload paths are managed here.
 * To change upload directory for entire app, only modify this file.
 */

/**
 * Get the base upload directory
 * In Docker: /app/public/uploads
 * In development: /path/to/project/public/uploads
 */
export const getUploadDir = () => {
  // Use environment variable if set, otherwise use default
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  
  // Default: public/uploads relative to project root
  return path.join(process.cwd(), 'public', 'uploads');
};

/**
 * Get subdirectory paths for different upload types
 */
export const uploadPaths = {
  ads: () => path.join(getUploadDir(), 'ads'),
  logos: () => path.join(getUploadDir(), 'logos'),
  paymentImages: () => path.join(getUploadDir(), 'payment-images'),
  support: () => path.join(getUploadDir(), 'support'),
  general: () => getUploadDir(),
};

/**
 * Get public URL for uploaded file
 * @param {string} subdir - Subdirectory (e.g., 'ads', 'logos')
 * @param {string} filename - The filename
 * @returns {string} - Public URL path
 */
export const getPublicUrl = (subdir, filename) => {
  if (subdir) {
    return `/uploads/${subdir}/${filename}`;
  }
  return `/uploads/${filename}`;
};

/**
 * File validation settings
 */
export const uploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocumentTypes: ['application/pdf'],
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export const isValidFileType = (file, allowedTypes = uploadConfig.allowedImageTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean}
 */
export const isValidFileSize = (file, maxSize = uploadConfig.maxFileSize) => {
  return file.size <= maxSize;
};

export default {
  getUploadDir,
  uploadPaths,
  getPublicUrl,
  uploadConfig,
  isValidFileType,
  isValidFileSize,
};
