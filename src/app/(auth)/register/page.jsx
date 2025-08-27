"use client";
import RegisterComponent from "@/components/auth/RegisterComponent";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref") || "";

  return <RegisterComponent referralCode={referralCode} />;
}
