"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login form submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-secondary">
      <div className="bg-black rounded-3xl p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
            WELCOME BACK!
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Enter your credentials below to start watching.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Username/Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full transition-all duration-200 flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight size={20} />
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
