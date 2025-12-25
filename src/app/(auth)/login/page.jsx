"use client";
import LoginComponent from "@/components/auth/LoginComponent";
import { usePageTracking } from "@/hooks/usePageTracking";

export default function LoginPage() {
  usePageTracking("login");
  return <LoginComponent />;
}
