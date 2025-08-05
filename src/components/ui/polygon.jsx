"use client";
const Polygon = ({
  imageBg,
  children,
  showGradient = true,
  fullWidth = false,
  className = "",
  height,
  showOnlyUpperLine = false,
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
          {/* Image background */}
          {imageBg && (
            <div
              className="absolute inset-0 bg-no-repeat bg-cover bg-top z-0"
              style={{ backgroundImage: `url(${imageBg})` }}
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
