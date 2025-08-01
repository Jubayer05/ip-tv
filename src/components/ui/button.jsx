export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  ...props
}) {
  const baseClasses =
    "font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 text-sm font-secondary cursor-pointer";

  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 focus:ring-white/20",
    secondary:
      "bg-[#44dcf3] text-black hover:bg-[#3ac8dd] focus:ring-[#44dcf3]/20",
    cyan: "bg-cyan-400 text-black hover:bg-cyan-300 focus:ring-cyan-400/20",
    dark: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-800/20",
    outline:
      "bg-transparent text-white border-2 border-white hover:bg-white hover:text-black focus:ring-white/20",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
    xl: "px-8 py-5 text-lg",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100"
    : "";

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
