/**
 * Get super admin emails from environment variable
 * @returns {string[]} Array of super admin email addresses
 */
export function getSuperAdminEmails() {
  const envEmails = process.env.SUPER_ADMIN_EMAILS;

  if (!envEmails) {
    console.error(
      "SUPER_ADMIN_EMAILS not set in environment variables. Please configure it in .env file or Docker environment."
    );
    return [];
  }

  // Split by comma and clean up whitespace
  const emails = envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  if (emails.length === 0) {
    console.error("SUPER_ADMIN_EMAILS is set but contains no valid emails.");
  }

  return emails;
}

/**
 * Check if an email is a super admin email
 * @param {string} email - Email to check
 * @returns {boolean}
 */
export function isSuperAdminEmail(email) {
  if (!email) return false;
  const superAdminEmails = getSuperAdminEmails();
  if (superAdminEmails.length === 0) return false;
  return superAdminEmails.includes(email.toLowerCase().trim());
}
