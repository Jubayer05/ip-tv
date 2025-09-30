import GuestLoginComponent from "@/components/features/Auth/GuestLoginComponent";

export const metadata = {
  title: "Guest Login - View Your Orders | Cheap Stream",
  description:
    "Login as a guest to view your order history and IPTV credentials using your email and OTP verification.",
};

export default function GuestLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <GuestLoginComponent />
        </div>
      </div>
    </div>
  );
}
