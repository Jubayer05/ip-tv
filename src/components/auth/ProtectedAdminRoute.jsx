"use client";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedAdminRoute = ({ children }) => {
  const { user, userRole, isSuperAdminUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Must be logged in
    if (!user) {
      router.replace("/");
      return;
    }

    const inAdmin = pathname?.startsWith("/admin");

    if (inAdmin) {
      // Support can ONLY access /admin/support (unless super admin)
      if (user.role === "support" && !isSuperAdminUser()) {
        if (pathname !== "/admin/support") {
          router.replace("/admin/support");
        }
        return; // allow support on /admin/support
      }

      // Non-admin (and not super admin) cannot access admin area
      if (userRole !== "admin" && !isSuperAdminUser()) {
        router.replace("/");
        return;
      }
    }
  }, [user, userRole, isSuperAdminUser, loading, pathname, router]);

  if (loading) return null;

  return children;
};

export default ProtectedAdminRoute;
