"use client";
import Image from "next/image";
import { useMemo } from "react";

const Polygon = ({
  imageBg,
  children,
  showGradient = true,
  fullWidth = false,
  className = "",
  height,
  fullWidthFooter = false,
}) => {
  const gradientStyle = showGradient
    ? {
        background: "linear-gradient(180deg, #0c3fbc 0%, #00bacd 100%)",
      }
    : {};

  const containerStyle = {
    ...gradientStyle,
    ...(height && { height }),
  };

  // Check if this is the main banner (LCP element)
  const isBanner = imageBg?.includes("banner");

  // Use optimized mobile image for banner
  const optimizedImageBg = useMemo(() => {
    if (isBanner && imageBg) {
      // Return the optimized version path (smaller file)
      return imageBg.replace("banner_bg.webp", "banner_bg_optimized.webp");
    }
    return imageBg;
  }, [imageBg, isBanner]);

  // Organize class conditions in a more readable way
  const getContainerClasses = () => {
    const baseClasses = [];

    // Container type based on gradient
    if (showGradient) {
      baseClasses.push("polygon_container");
    } else {
      baseClasses.push("polygon_container_footer");
    }

    // Width configuration
    if (fullWidth) {
      baseClasses.push("w-full", "-ml-[1px]", "polygon_container_fullWidth");
    } else {
      baseClasses.push("container", "p-[2px]");
    }

    // Additional custom classes
    if (className) {
      baseClasses.push(className);
    }
    return baseClasses.join(" ");
  };

  const getPolygonClasses = () => {
    const baseClasses = ["relative", "bg-black", "overflow-hidden"];

    // Polygon type based on gradient
    if (showGradient) {
      baseClasses.push("polygon");
    } else {
      baseClasses.push("polygon_footer");
    }

    // Full width modifier
    if (fullWidth) {
      baseClasses.push("polygon_fullWidth");
    }

    return baseClasses.join(" ");
  };

  return (
    <div className={`${fullWidth ? "pl-[1.5px]" : "px-2"}`}>
      <div className={getContainerClasses()} style={containerStyle}>
        <div className={getPolygonClasses()}>
          {/* Image background - using Next.js Image for optimization */}
          {imageBg && (
            <Image
              src={optimizedImageBg}
              alt=""
              fill
              priority={isBanner}
              quality={isBanner ? 75 : 60} // Higher quality since image is pre-compressed
              sizes={isBanner ? "(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1200px" : "100vw"}
              className="object-cover object-top z-0"
              loading={isBanner ? "eager" : "lazy"}
              fetchPriority={isBanner ? "high" : "auto"}
              placeholder="empty"
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 z-10" />
          {/* Content */}
          <div className="relative z-20">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Polygon;
