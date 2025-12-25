"use client";
import RegisterComponent from "@/components/auth/RegisterComponent";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref") || "";
  usePageTracking("register");

  return <RegisterComponent referralCode={referralCode} />;
}
