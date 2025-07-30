"use client";
const Polygon = ({
  imageBg,
  children,
  showGradient = true,
  fullWidth = false,
}) => {
  const gradientStyle = showGradient
    ? {
        background: "linear-gradient(180deg, #0c3fbc 0%, #00bacd 100%)",
      }
    : {};

  return (
    <div
      className={`polygon_container ${
        fullWidth ? "w-full -ml-0.5 h-[700px]" : "container p-[2px]"
      }`}
      style={gradientStyle}
    >
      <div className="relative bg-black overflow-hidden polygon">
        {/* Image background */}
        {imageBg && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${imageBg})` }}
          />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-10" />
        {/* Content */}
        <div className="relative z-20">{children}</div>
      </div>
    </div>
  );
};

export default Polygon;
