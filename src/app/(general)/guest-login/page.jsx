import GuestLoginClient from "./GuestLoginClient";

export const metadata = {
  title: "Guest Login - View Your Orders | Cheap Stream",
  description:
    "Login as a guest to view your order history and IPTV credentials using your email and OTP verification.",
};

export default function GuestLoginPage() {
  return <GuestLoginClient />;
}
