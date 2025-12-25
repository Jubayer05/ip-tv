"use client";

const OpenGraphTags = ({
  title,
  description,
  image,
  url,
  type = "website",
}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com";
  const fullImageUrl = image?.startsWith("http")
    ? image
    : `${baseUrl}${image || "/icons/live.png"}`;
  const fullUrl = url?.startsWith("http") ? url : `${baseUrl}${url || ""}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Cheap Stream" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:image:alt" content={title} />
      <meta property="twitter:site" content="@cheapstream" />
      <meta property="twitter:creator" content="@cheapstream" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
    </>
  );
};

export default OpenGraphTags;
