export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cheapstream.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/api/",
        "/_next/",
        "/payment-status/",
        "/verify-email/",
        "/forgot-password/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
