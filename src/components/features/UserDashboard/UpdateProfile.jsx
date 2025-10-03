"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
import Swal from "sweetalert2";

const UpdateProfile = () => {
  const { user } = useAuth();
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // Original static texts
  const ORIGINAL_TEXTS = {
    heading: "Profile Settings",
    subtitle: "Manage your account information and preferences",
    successMessage: "Profile updated successfully! 🎉",
    invalidFileType: "Invalid file type",
    invalidFileTypeMessage: "Please select an image file",
    fileTooLarge: "File too large",
    fileTooLargeMessage: "Please select a file smaller than 5MB",
    photoUploaded: "Photo uploaded",
    photoUploadedMessage: "Profile photo updated successfully",
    uploadFailed: "Upload failed",
    uploadFailedMessage: "Failed to upload photo. Please try again.",
    networkError: "Network error. Please try again.",
    failedToUpdate: "Failed to update profile",
    firstName: "First Name",
    firstNamePlaceholder: "Enter first name",
    lastName: "Last Name",
    lastNamePlaceholder: "Enter last name",
    username: "Username",
    usernamePlaceholder: "Enter username",
    phoneNumber: "Phone Number",
    phonePlaceholder: "Enter phone number",
    notProvided: "Not provided",
    country: "Country",
    countryPlaceholder: "Enter country",
    dateOfBirth: "Date of Birth",
    emailAddress: "Email Address",
    emailCannotBeChanged: "Email address cannot be changed",
    clickCameraIcon: "Click the camera icon to upload a new photo",
    editProfile: "Edit Profile",
    saving: "Saving...",
    saveChanges: "Save Changes",
    cancel: "Cancel",
  };

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
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Translate texts when language changes
  useEffect(() => {
    if (!isLanguageLoaded || !language) return;

    const translateTexts = async () => {
      const keys = Object.keys(ORIGINAL_TEXTS);
      const values = Object.values(ORIGINAL_TEXTS);

      try {
        const translatedValues = await translate(values);
        const translatedTexts = {};

        keys.forEach((key, index) => {
          translatedTexts[key] = translatedValues[index] || values[index];
        });

        setTexts(translatedTexts);
      } catch (error) {
        console.error("Translation error:", error);
        setTexts(ORIGINAL_TEXTS);
      }
    };

    translateTexts();
  }, [language, isLanguageLoaded, translate]);

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: texts.invalidFileType,
        text: texts.invalidFileTypeMessage,
        confirmButtonColor: "#44dcf3",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: texts.fileTooLarge,
        text: texts.fileTooLargeMessage,
        confirmButtonColor: "#44dcf3",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/support/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          photoUrl: data.url,
          avatar: data.url,
        }));

        Swal.fire({
          icon: "success",
          title: texts.photoUploaded,
          text: texts.photoUploadedMessage,
          confirmButtonColor: "#44dcf3",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        icon: "error",
        title: texts.uploadFailed,
        text: texts.uploadFailedMessage,
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setUploading(false);
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
        setError(data.error || texts.failedToUpdate);
      }
    } catch (error) {
      setError(texts.networkError);
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
          {texts.heading}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">{texts.subtitle}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-400 text-sm text-center">
            {texts.successMessage}
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
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera size={16} className="text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <UserCheck size={16} />
            <span>{user?.email}</span>
          </div>

          {isEditing && (
            <p className="text-xs text-gray-500 mt-2">
              {texts.clickCameraIcon}
            </p>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.firstName}
              </label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder={texts.firstNamePlaceholder}
                disabled={!isEditing}
                className="w-full"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.lastName}
              </label>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder={texts.lastNamePlaceholder}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.username}
            </label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={texts.usernamePlaceholder}
              disabled={!isEditing}
              className="w-full"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.phoneNumber}
              </label>
              {isEditing ? (
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder={texts.phonePlaceholder}
                  className="w-full pl-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-300">
                    {formData.phone || texts.notProvided}
                  </span>
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.country}
              </label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder={texts.countryPlaceholder}
                disabled={!isEditing}
                className="w-full"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.dateOfBirth}
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
                    : texts.notProvided}
                </span>
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {texts.emailAddress}
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-300">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {texts.emailCannotBeChanged}
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
                {texts.editProfile}
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
                      {texts.saving}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={16} />
                      {texts.saveChanges}
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
                    {texts.cancel}
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
