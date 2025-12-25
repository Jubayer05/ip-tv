"use client";
import VerifyEmail from "@/components/auth/VerifyEmail";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function VerifyEmailPage() {
  usePageTracking("verify-email");
  return <VerifyEmail />;
}
