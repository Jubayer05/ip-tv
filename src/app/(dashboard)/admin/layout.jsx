import ProtectedAdminRoute from "@/components/auth/ProtectedAdminRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedAdminRoute>
      {children}
    </ProtectedAdminRoute>
  );
}
