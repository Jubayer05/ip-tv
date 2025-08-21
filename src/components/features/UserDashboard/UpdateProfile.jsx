"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Camera,
  Mail,
  Phone,
  Save,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const UpdateProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    photoUrl: "",
    dateOfBirth: "",
    country: "",
    phone: "",
    avatar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Fetch profile data on component mount
  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile?email=${user.email}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          username: data.data.username || "",
          photoUrl: data.data.photoUrl || "",
          dateOfBirth: data.data.dateOfBirth
            ? new Date(data.data.dateOfBirth).toISOString().split("T")[0]
            : "",
          country: data.data.country || "",
          phone: data.data.phone || "",
          avatar: data.data.avatar || "",
        });
        setOriginalData(data.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }));
    setError("");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll use a local URL (you can implement VPS hosting later)
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        photoUrl: localUrl,
        avatar: localUrl, // Also update avatar field
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          profile: {
            ...formData,
            dateOfBirth: formData.dateOfBirth
              ? new Date(formData.dateOfBirth)
              : null,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setOriginalData(formData);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setError("");
  };

  const hasChanges = () => {
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.username !== originalData.username ||
      formData.photoUrl !== originalData.photoUrl ||
      formData.dateOfBirth !== originalData.dateOfBirth ||
      formData.country !== originalData.country ||
      formData.phone !== originalData.phone ||
      formData.avatar !== originalData.avatar
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Manage your account information and preferences
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm text-center">
            Profile updated successfully! 🎉
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <div className="bg-black rounded-2xl border border-[#212121] p-6 sm:p-8">
        {/* Profile Photo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4 overflow-hidden">
              {formData.photoUrl || formData.avatar ? (
                <img
                  src={formData.photoUrl || formData.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={40} />
              )}
            </div>

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-cyan-400 p-2 rounded-full cursor-pointer hover:bg-cyan-300 transition-colors">
                <Camera size={16} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <UserCheck size={16} />
            <span>{user?.email}</span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  className="w-full pl-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    {formData.phone || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Country
              </label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country"
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth
            </label>
            {isEditing ? (
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full"
                max={new Date().toISOString().split("T")[0]}
              />
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-300">
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </span>
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-300">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email address cannot be changed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            {!isEditing ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={loading || !hasChanges()}
                  className="flex-1 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={16} />
                      Save Changes
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2">
                    <X size={16} />
                    Cancel
                  </div>
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
