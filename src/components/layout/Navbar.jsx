"use client";
import NotificationBell from "@/components/ui/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Globe, Menu, Search, Wallet, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DepositPopup from "../features/AffiliateRank/DepositPopup";
import Button from "../ui/button";

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showDepositPopup, setShowDepositPopup] = useState(false);

  const { user, logout, refreshUserData } = useAuth();
  const { language, setLanguage, languages, translate } = useLanguage();

  // Originals
  const ORIGINAL_NAV_LABELS = ["HOME", "EXPLORE", "PACKAGES", "AFFILIATE"];
  const ORIGINAL_USER_MENU_LABELS = [
    "Dashboard",
    "Order History",
    "Device Management",
    "Payment Method",
  ];
  const ORIGINAL_ADMIN_MENU_LABELS = [
    "Admin Dashboard",
    "User Management",
    "Order History",
    "Product Management",
    "Coupon Management",
    "Affiliate Management",
    "Rank System",
    "Support Tickets",
  ];
  const ORIGINAL_SIGN_IN = "Sign In";
  const ORIGINAL_SIGN_OUT = "Sign Out";
  const ORIGINAL_USER_MENU_HEADING = "User Menu";
  const ORIGINAL_DEPOSIT_FUNDS = "Deposit Funds";

  // Translated state
  const [navLabels, setNavLabels] = useState(ORIGINAL_NAV_LABELS);
  const [userMenuLabels, setUserMenuLabels] = useState(
    ORIGINAL_USER_MENU_LABELS
  );
  const [adminMenuLabels, setAdminMenuLabels] = useState(
    ORIGINAL_ADMIN_MENU_LABELS
  );
  const [signInLabel, setSignInLabel] = useState(ORIGINAL_SIGN_IN);
  const [signOutLabel, setSignOutLabel] = useState(ORIGINAL_SIGN_OUT);
  const [userMenuHeading, setUserMenuHeading] = useState(
    ORIGINAL_USER_MENU_HEADING
  );
  const [depositFundsLabel, setDepositFundsLabel] = useState(
    ORIGINAL_DEPOSIT_FUNDS
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [
        ...ORIGINAL_NAV_LABELS,
        ...ORIGINAL_USER_MENU_LABELS,
        ...ORIGINAL_ADMIN_MENU_LABELS,
        ORIGINAL_SIGN_IN,
        ORIGINAL_SIGN_OUT,
        ORIGINAL_USER_MENU_HEADING,
        ORIGINAL_DEPOSIT_FUNDS,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      setNavLabels(translated.slice(0, 4));
      setUserMenuLabels(translated.slice(4, 8));
      setAdminMenuLabels(translated.slice(8, 16));
      setSignInLabel(translated[16]);
      setSignOutLabel(translated[17]);
      setUserMenuHeading(translated[18]);
      setDepositFundsLabel(translated[19]);
    })();

    return () => {
      isMounted = false;
    };
    // Update when language changes
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigationLinks = [
    { href: "/", label: "HOME" },
    { href: "/explore", label: "EXPLORE" },
    { href: "/packages", label: "PACKAGES" },
    { href: "/affiliate", label: "AFFILIATE" },
  ];

  const userMenuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Order History" },
    { href: "/dashboard/devices", label: "Device Management" },
    { href: "/dashboard/payment", label: "Payment Method" },
  ];

  const adminMenuItems = [
    { href: "/admin", label: "Admin Dashboard" },
    { href: "/admin/users", label: "User Management" },
    { href: "/admin/orders", label: "Order History" },
    { href: "/admin/products", label: "Product Management" },
    { href: "/admin/coupons", label: "Coupon Management" },
    { href: "/admin/affiliate", label: "Affiliate Management" },
    { href: "/admin/rank-system", label: "Rank System" },
    { href: "/admin/support", label: "Support Tickets" },
  ];

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const handleDepositSuccess = async () => {
    setShowDepositPopup(false);
    // Wait a bit to let webhook credit wallet, then refresh
    setTimeout(async () => {
      await refreshUserData();
      // You can add SweetAlert notification here if needed
    }, 1500);
  };

  const handleDepositFunds = () => {
    setShowDepositPopup(true);
  };

  return (
    <>
      <nav className="h-[70px] relative bg-transparent px-3">
        <div className="flex items-center justify-between container mx-auto h-full">
          {/* Left Section - Menu and Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigationLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-base"
                >
                  {navLabels[i]}
                </a>
              ))}
            </div>
          </div>

          {/* Center Section - Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center top-[13px]">
            <Image src="/logos/logo.png" alt="Logo" width={100} height={100} />
          </div>

          {/* Right Section - Search, Language Dropdown, Sign In, and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Icon */}
            <button className="text-white hover:text-gray-300 transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            <NotificationBell />

            {user && (
              <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
                {/* Main Balance */}
                <span className="bg-primary/15 border border-primary text-primary rounded-full px-3 py-1 text-xs font-bold">
                  ${Number(user.balance || 0).toFixed(2)}
                </span>

                {/* Deposit Funds Button */}
                <button
                  onClick={handleDepositFunds}
                  className="flex items-center font-secondary space-x-1 bg-cyan-400 text-gray-900 rounded-full px-4 py-3 text-xs font-bold hover:bg-cyan-500 transition-colors"
                >
                  <Wallet size={14} />
                  <span>{depositFundsLabel}</span>
                </button>
              </div>
            )}

            {/* Language Dropdown - Hidden on mobile */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex outline-none items-center font-secondary text-white space-x-2 hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-3 lg:px-5 py-2 lg:py-3 text-xs bg-gray-900"
              >
                <Globe size={16} className="text-primary" />
                <span className="hidden lg:inline">{language.name}</span>
                <span className="lg:hidden">{language.code.toUpperCase()}</span>
                <ChevronDown
                  size={14}
                  className={`transform transition-transform ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Language Dropdown Menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conditional Sign In Button or User Menu */}
            {user ? (
              /* User Menu Icon - Show when logged in */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors border border-gray-600 relative"
                >
                  <Image
                    src="/icons/profile.png"
                    alt="user"
                    width={100}
                    height={100}
                  />
                  {/* ChevronDown icon at bottom right */}
                  <span className="absolute bottom-0 right-0">
                    <ChevronDown
                      size={16}
                      className="text-white bg-gray-800 rounded-full border border-gray-600 shadow"
                    />
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName || user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {/* Show balances in dropdown */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Balance:</span>
                            <span className="font-bold text-primary">
                              ${Number(user.balance || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Deposits:</span>
                            <span className="font-bold text-green-600">
                              ${Number(user.depositBalance || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {user.role === "user" &&
                        userMenuItems.map((item, i) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm"
                          >
                            {userMenuLabels[i]}
                          </Link>
                        ))}

                      {user.role === ("admin" || "superadmin") &&
                        adminMenuItems.map((item, i) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm"
                          >
                            {adminMenuLabels[i]}
                          </Link>
                        ))}

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm text-red-600"
                      >
                        {signOutLabel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button - Show when not logged in */
              <Link href="/login">
                <Button size="md">{signInLabel}</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-0 left-0 w-64 h-full bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">L</span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {navigationLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm py-2"
                  onClick={toggleMobileMenu}
                >
                  {navLabels[i]}
                </a>
              ))}

              {/* Mobile User Menu - Only show if logged in */}
              {user && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="space-y-2">
                    <div className="text-gray-400 text-xs uppercase font-bold mb-3">
                      {userMenuHeading}
                    </div>

                    {/* Mobile Balances */}
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Balance:</span>
                        <span className="text-primary font-bold">
                          ${Number(user.balance || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">Deposits:</span>
                        <span className="text-green-400 font-bold">
                          ${Number(user.depositBalance || 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleDepositFunds();
                          toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-cyan-400 text-gray-900 rounded-full px-4 py-2 text-sm font-bold hover:bg-cyan-500 transition-colors"
                      >
                        <Wallet size={16} />
                        <span>{depositFundsLabel}</span>
                      </button>
                    </div>

                    {userMenuItems.map((item, i) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={toggleMobileMenu}
                        className="block text-white hover:text-primary transition-colors font-secondary text-sm py-2"
                      >
                        {userMenuLabels[i]}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="block w-full text-left text-red-400 hover:text-red-300 transition-colors font-secondary text-sm py-2"
                    >
                      {signOutLabel}
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-gray-700">
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="flex outline-none items-center justify-between w-full font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-4 py-3 text-sm bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe size={18} className="text-primary" />
                      <span>{language.name}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${
                        isLanguageOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isLanguageOpen && (
                    <div className="mt-2 bg-gray-800 rounded-md shadow-lg">
                      <div className="py-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLanguageSelect(lang);
                              setIsLanguageOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors font-secondary text-sm"
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Popup */}
      <DepositPopup
        isOpen={showDepositPopup}
        onClose={() => setShowDepositPopup(false)}
        onSuccess={handleDepositSuccess}
        userId={user?._id}
        userEmail={user?.email}
      />
    </>
  );
};

export default Navbar;
