"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-[530px] mx-auto bg-black p-4 border border-[#ffffff]/15 rounded-2xl">
      <div className=" w-full space-y-8 ">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-secondary">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Sign In"}
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
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
