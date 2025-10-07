"use client";
import OptimizedImage from "./OptimizedImage";

const AdImage = ({ src, alt, className = "", priority = false }) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={70}
      height={80}
      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${className}`}
      priority={priority}
      sizes="(max-width: 768px) 70px, 80px"
      quality={60} // Lower quality for ads
    />
  );
};

export default AdImage;
