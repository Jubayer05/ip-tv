"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-black p-8 rounded-2xl border border-white/15 font-secondary w-full max-w-2xl ml-auto">
      <div className="space-y-6">
        {/* First Name and Last Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              First Name
            </label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Last Name
            </label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email here"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Write your contact reason here"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Type your message here"
            required
            rows={6}
            className="w-full bg-[#0C171C] text-white placeholder-white/50 border border-white/10 rounded-[15px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all duration-200"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Submit Request</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContactForm;
