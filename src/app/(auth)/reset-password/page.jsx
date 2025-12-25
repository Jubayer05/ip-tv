"use client";
import ResetPasswordComponent from "@/components/auth/ResetPasswordComponent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function ResetPasswordPage() {
  usePageTracking("reset-password");
  return <ResetPasswordComponent />;
}
