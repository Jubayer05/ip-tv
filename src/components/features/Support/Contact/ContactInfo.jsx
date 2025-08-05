"use client";
import { Clock, Mail, Phone } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="text-white p-4 sm:p-6 md:p-8 rounded-lg font-secondary w-full lg:w-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-wide">
          SUBMIT A SUPPORT TICKET
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
          Thank you for choosing Cheap Stream—where great entertainment meets{" "}
          <br className="hidden sm:block" />
          unbeatable value. We look forward to assisting you!
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 sm:space-y-6">
        {/* Call Us */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">Call Us</p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg">+123 456 789 012</p>
          </div>
        </div>

        {/* Email Us */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">Email Us</p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg break-all">
              help@cheapstream.com
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs sm:text-sm mb-1">Business Hours</p>
            <p className="text-white font-medium text-sm sm:text-base md:text-lg">
              Mon-Fri (09:00 AM - 5:00 PM)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
