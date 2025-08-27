const ControlButton = ({
  children,
  isActive,
  onClick,
  className = "",
  size = "medium",
}) => {
  const baseClasses =
    "font-semibold transition-all duration-200 font-secondary";

  const sizeClasses = {
    small: "w-10 h-10 text-xs sm:w-12 sm:h-12 sm:text-sm",
    medium:
      "px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-base",
    large:
      "px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base md:px-6 md:py-4 md:text-lg",
  };

  const activeClasses = isActive
    ? "bg-cyan-400 text-black rounded-[10px]"
    : "text-white hover:bg-gray-600 border border-[#FFFFFF26] rounded-[10px]";

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${activeClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ControlButton;
