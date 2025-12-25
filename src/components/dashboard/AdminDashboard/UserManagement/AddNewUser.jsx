"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Key, Mail, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AddNewUser() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
    role: "user",
  });

  const ORIGINAL_TEXTS = {
    heading: "Add New User",
    email: "Email",
    password: "Password",
    firstName: "First Name",
    lastName: "Last Name",
    username: "Username",
    role: "Role",
    generatePassword: "Generate Password",
    createUser: "Create User",
    user: "User",
    admin: "Admin",
    emailPlaceholder: "Enter email address",
    passwordPlaceholder: "Enter password or generate one",
    firstNamePlaceholder: "Enter first name",
    lastNamePlaceholder: "Enter last name",
    usernamePlaceholder: "Enter username (optional)",
    loading: "Creating user...",
    success: "Success",
    userCreated: "User created successfully",
    credentialsSent: "Credentials have been sent to the user's email",
    error: "Error",
    failedToCreate: "Failed to create user",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    firstNameRequired: "First name is required",
    invalidEmail: "Please enter a valid email address",
    passwordMinLength: "Password must be at least 6 characters",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.emailRequired,
        confirmButtonColor: "#44dcf3",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.invalidEmail,
        confirmButtonColor: "#44dcf3",
      });
      return false;
    }

    if (!formData.password.trim()) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.passwordRequired,
        confirmButtonColor: "#44dcf3",
      });
      return false;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.passwordMinLength,
        confirmButtonColor: "#44dcf3",
      });
      return false;
    }

    if (!formData.firstName.trim()) {
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.firstNameRequired,
        confirmButtonColor: "#44dcf3",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
          profile: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            username: formData.username.trim(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Send credentials email
        const emailResponse = await fetch("/api/admin/users/send-credentials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
          }),
        });

        const emailData = await emailResponse.json();

        Swal.fire({
          icon: "success",
          title: texts.success,
          html: emailData.success
            ? `${texts.userCreated}<br/>${texts.credentialsSent}`
            : texts.userCreated,
          confirmButtonColor: "#44dcf3",
        });

        // Reset form
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          username: "",
          role: "user",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: texts.error,
          text: data.error || texts.failedToCreate,
          confirmButtonColor: "#44dcf3",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      Swal.fire({
        icon: "error",
        title: texts.error,
        text: texts.failedToCreate,
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          {texts.heading}
        </h1>
      </div>

      <div className="bg-black border border-[#212121] rounded-lg p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.email} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={texts.emailPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.password} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={texts.passwordPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
                  required
                />
              </div>
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-blue-900/20 text-blue-300 hover:bg-blue-900/30 border border-blue-500/30 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                {texts.generatePassword}
              </button>
            </div>
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.firstName} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={texts.firstNamePlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.lastName}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={texts.lastNamePlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.username}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={texts.usernamePlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-black border border-[#212121] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.role}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black border border-[#212121] rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors text-sm"
            >
              <option value="user">{texts.user}</option>
              <option value="admin">{texts.admin}</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-900/20 text-blue-300 hover:bg-blue-900/30 border border-blue-500/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                  {texts.loading}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {texts.createUser}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
