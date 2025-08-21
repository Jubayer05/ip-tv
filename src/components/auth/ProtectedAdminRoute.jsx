"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function ProtectedAdminRoute({ children }) {
  const { user, userRole, hasAdminAccess, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push("/login");
        return;
      }

      if (!hasAdminAccess()) {
        // User doesn't have admin access, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      // User is authorized
      setIsAuthorized(true);
    }
  }, [user, userRole, hasAdminAccess, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return children;
}
