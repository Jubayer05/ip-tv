import PublicRoute from "@/components/auth/PublicRoute";

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="w-full relative"
        style={{
          backgroundImage: "url('/background/banner_bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/85"></div>
        <div className="relative z-10 py-16">
          <PublicRoute>{children}</PublicRoute>
        </div>
      </div>
    </div>
  );
}
