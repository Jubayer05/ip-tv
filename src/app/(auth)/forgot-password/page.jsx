"use client";
import ForgotPasswordComponent from "@/components/auth/ForgotPasswordComponent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function ForgotPasswordPage() {
  usePageTracking("forgot-password");
  return <ForgotPasswordComponent />;
}
