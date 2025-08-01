"use client";
import { Clock, Mail, Phone } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="text-white p-8 rounded-lg font-secondary">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 tracking-wide">
          SUBMIT A SUPPORT TICKET
        </h1>
        <p className="text-gray-300 text-sm leading-relaxed">
          Thank you for choosing Cheap Stream—where great entertainment meets{" "}
          <br />
          unbeatable value. We look forward to assisting you!
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        {/* Call Us */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Call Us</p>
            <p className="text-white font-medium text-lg">+123 456 789 012</p>
          </div>
        </div>

        {/* Email Us */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Email Us</p>
            <p className="text-white font-medium text-lg">
              help@cheapstream.com
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Business Hours</p>
            <p className="text-white font-medium text-lg">
              Mon-Fri (09:00 AM - 5:00 PM)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
