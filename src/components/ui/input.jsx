import React from "react";

const Input = React.forwardRef(
  (
    {
      type = "text",
      name,
      value,
      onChange,
      placeholder,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-[#0C171C] text-white placeholder-white/50 border border-white/10 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
