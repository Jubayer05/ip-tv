"use client";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [error, setError] = useState("");
  const { verifyEmail, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionCode = searchParams.get("oobCode");

  useEffect(() => {
    // If user is already verified and logged in, redirect to dashboard
    if (user && user.emailVerified) {
      router.push("/dashboard");
      return;
    }

    const verifyEmailCode = async () => {
      if (!actionCode) {
        setVerificationStatus("error");
        setError("No verification code found");
        return;
      }

      try {
        const result = await verifyEmail(actionCode);
        if (result.success) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
          setError(result.error);
        }
      } catch (error) {
        setVerificationStatus("error");
        setError("Verification failed. Please try again.");
      }
    };

    verifyEmailCode();
  }, [actionCode, verifyEmail, user, router]);

  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">
            Verifying your email...
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center">
        {verificationStatus === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Your email has been successfully verified. You can now sign in to
              your account.
            </p>
            <Link href="/login">
              <Button className="flex items-center gap-2 mx-auto">
                Sign In Now
                <ArrowRight size={20} />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-white text-xl font-semibold mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {error || "There was an error verifying your email address."}
            </p>
            <div className="space-y-3">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full">Create New Account</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
