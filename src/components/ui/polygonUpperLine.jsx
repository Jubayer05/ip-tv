"use client";
const PolygonUpperLine = ({
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

  return (
    <div
      className={`polygon_container_upper ${
        fullWidth ? `w-full -ml-[1px]` : "container p-[2px]"
      } ${className} -z-10`}
      style={containerStyle}
    >
      <div className="relative bg-black overflow-hidden polygon_upper">
        {/* Image background */}
        {imageBg && (
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-top z-0"
            style={{ backgroundImage: `url(${imageBg})` }}
          />
        )}
        {/* Dark overlay */}
        {/* <div className="absolute inset-0 bg-black/70 z-10" /> */}
        {/* Content */}
        <div className="relative z-20 min-h-[50px]"></div>
      </div>
    </div>
  );
};

export default PolygonUpperLine;
