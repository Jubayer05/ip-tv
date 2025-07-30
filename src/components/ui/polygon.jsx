"use client";
const Polygon = ({ imageBg, children }) => {
  return (
    <div className="polygon_container">
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
