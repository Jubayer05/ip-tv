export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  fullWidth = false,
  ...props
}) {
  const baseClasses =
    "font-semibold rounded-full transition-all duration-300 transform hover:scale-101 focus:outline-none focus:ring-2 focus:ring-offset-2 font-secondary cursor-pointer select-none touch-manipulation";

  const variants = {
    primary:
      "bg-white text-black hover:bg-gray-100 focus:ring-white/20 active:scale-95",
    secondary:
      "bg-[#44dcf3] text-black hover:bg-[#3ac8dd] focus:ring-[#44dcf3]/20 active:scale-95",
    cyan: "bg-cyan-400 text-black hover:bg-cyan-300 focus:ring-cyan-400/20 active:scale-95",
    dark: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-800/20 active:scale-95",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20 active:scale-95",
    outline:
      "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black focus:ring-white/20 active:scale-95",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-xs sm:px-3 sm:py-2 sm:text-sm min-h-[44px]",
    md: "px-5 py-3 text-xs sm:px-4 sm:py-2.5 sm:text-sm md:px-5 md:py-3 md:text-base min-h-[44px]",
    lg: "px-6 py-3.5 text-sm sm:px-5 sm:py-3 sm:text-base md:px-6 md:py-4 md:text-lg min-h-[44px]",
    xl: "px-7 py-4 text-sm sm:px-6 sm:py-4 sm:text-base md:px-8 md:py-5 md:text-lg lg:px-10 lg:py-6 lg:text-xl min-h-[44px]",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 pointer-events-none"
    : "";

  const widthClasses = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${widthClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
