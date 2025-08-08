"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/login");
        } else if (!user.emailVerified) {
          router.push("/verify-email");
        } else {
          setIsChecking(false);
        }
      }
    }, [user, loading, router]);

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

    if (!user || !user.emailVerified) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
}
