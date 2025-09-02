"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicRoute({ children }) {
  const { user, loading, authToken, is2FAPending } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (user && authToken && !is2FAPending) {
        router.push("/dashboard");
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, authToken, is2FAPending, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && user.emailVerified) {
    return null; // Will redirect to dashboard
  }

  if (user && authToken && !is2FAPending) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
}
