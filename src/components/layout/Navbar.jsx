"use client";
import NotificationBell from "@/components/ui/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Menu, ShoppingCart, User, Wallet, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../ui/button";

// Lazy load heavy components
const ReactCountryFlag = dynamic(() => import("react-country-flag"), {
  ssr: false,
  loading: () => <span className="w-4 h-4 bg-gray-600 rounded animate-pulse" />,
});

const DepositPopup = dynamic(
  () => import("../features/AffiliateRank/DepositPopup"),
  { ssr: false }
);

const AudioUnlocker = dynamic(() => import("./AudioUnlocker"), { ssr: false });

const langToCountry = {
  en: "GB",
  sv: "SE",
  no: "NO",
  da: "DK",
  fi: "FI",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  ru: "RU",
  tr: "TR",
  ar: "SA",
  hi: "IN",
  zh: "CN",
};

const initialUserMenuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Order History" },
  { href: "/dashboard/devices", label: "Device Management" },
];

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [userMenuItems, setUserMenuItems] = useState(initialUserMenuItems);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const { user, logout, refreshUserData } = useAuth();
  const { language, setLanguage, languages, translate } = useLanguage();

  // Load cart items count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      const savedCart = localStorage.getItem("cs_cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        setCartItemsCount(cartItems.length);
      } else {
        setCartItemsCount(0);
      }
    };

    // Load initial count
    loadCartCount();

    // Listen for storage changes (when cart is updated from other tabs)
    window.addEventListener("storage", loadCartCount);

    // Listen for custom cart update events (same tab)
    window.addEventListener("cartUpdated", loadCartCount);

    return () => {
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener("cartUpdated", loadCartCount);
    };
  }, []);

  const ORIGINAL_USER_MENU_LABELS = [
    "Dashboard",
    "Order History",
    "Device Management",
  ];

  // Originals
  const ORIGINAL_NAV_LABELS = [
    "HOME",
    "EXPLORE",
    "PACKAGES",
    "AFFILIATE",
    "OUR WEBSITES",
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
  const ORIGINAL_GUEST_LOGIN = "Guest Login";

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
  const [guestLoginLabel, setGuestLoginLabel] = useState(ORIGINAL_GUEST_LOGIN);

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/ads/public?limit=6");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCardPaymentSettings = async () => {
      try {
        const response = await fetch("/api/settings/card-payment");
        const data = await response.json();

        if (data.success && data.data?.isEnabled) {
          // Insert Payment Method at position 3 (after Device Management)
          setUserMenuItems([
            ...initialUserMenuItems,
            { href: "/dashboard/payment", label: "Payment Method" },
          ]);
        } else {
          setUserMenuItems(initialUserMenuItems);
        }
      } catch (error) {
        console.error("Error fetching card payment settings:", error);
        setUserMenuItems(initialUserMenuItems);
      }
    };

    fetchCardPaymentSettings();
  }, []);

  // Update the translation logic to dynamically handle the array
  useEffect(() => {
    let isMounted = true;
    (async () => {
      // Build dynamic ORIGINAL array based on current userMenuItems
      const currentUserMenuLabels = userMenuItems.map((item) => item.label);

      const items = [
        ...ORIGINAL_NAV_LABELS,
        ...currentUserMenuLabels, // Use dynamic labels
        ...ORIGINAL_ADMIN_MENU_LABELS,
        ORIGINAL_SIGN_IN,
        ORIGINAL_SIGN_OUT,
        ORIGINAL_USER_MENU_HEADING,
        ORIGINAL_DEPOSIT_FUNDS,
        ORIGINAL_GUEST_LOGIN,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      setNavLabels(translated.slice(0, 5));
      setUserMenuLabels(translated.slice(5, 5 + currentUserMenuLabels.length)); // Dynamic slice
      setAdminMenuLabels(
        translated.slice(
          5 + currentUserMenuLabels.length,
          5 + currentUserMenuLabels.length + 8
        )
      );
      setSignInLabel(translated[5 + currentUserMenuLabels.length + 8]);
      setSignOutLabel(translated[5 + currentUserMenuLabels.length + 9]);
      setUserMenuHeading(translated[5 + currentUserMenuLabels.length + 10]);
      setDepositFundsLabel(translated[5 + currentUserMenuLabels.length + 11]);
      setGuestLoginLabel(translated[5 + currentUserMenuLabels.length + 12]);
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, userMenuItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const navigationLinks = [
    { href: "/", label: "HOME" },
    { href: "/explore", label: "EXPLORE" },
    { href: "/packages", label: "PACKAGES" },
    { href: "/affiliate", label: "AFFILIATE" },
    { href: "#", label: "OUR WEBSITES", hasDropdown: true },
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

  const handleProductClick = (linkUrl) => {
    window.open(linkUrl, "_blank", "noopener,noreferrer");
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
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
              {navigationLinks.map((link, i) => (
                <div key={link.href} className="relative">
                  {link.hasDropdown ? (
                    <div
                      className="relative"
                      onMouseEnter={() => setIsProductsMenuOpen(true)}
                      onMouseLeave={() => setIsProductsMenuOpen(false)}
                    >
                      <button
                        className="font-primary h-[80px] text-white hover:text-primary transition-colors uppercase tracking-wide text-base flex items-center gap-1"
                        aria-label="Our websites menu"
                        aria-haspopup="true"
                        aria-expanded={isProductsMenuOpen}
                      >
                        {navLabels[i]}
                        <ChevronDown size={16} />
                      </button>

                      {/* Products Dropdown */}
                      {isProductsMenuOpen && (
                        <div className="absolute top-full left-0 -mt-2 w-[280px] bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Our Websites
                            </h3>
                            {productsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                              </div>
                            ) : products.length > 0 ? (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {products.map((product, index) => (
                                  <div
                                    key={product._id || index}
                                    onClick={() =>
                                      handleProductClick(product.linkUrl)
                                    }
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                                  >
                                    <div className="flex-shrink-0 w-12 h-12 relative">
                                      <Image
                                        src={
                                          product.imageUrl ||
                                          "/icons/profile.png"
                                        }
                                        alt={product.title}
                                        fill
                                        sizes="48px"
                                        className="object-cover rounded-lg"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-cyan-600 transition-colors truncate">
                                        {product.title}
                                      </h4>
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {product.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No products</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      className="font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-base"
                    >
                      {navLabels[i]}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Section - Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center top-[13px]">
            <Link href="/">
              <Image
                src="/logos/logo.png"
                alt="Logo"
                width={80}
                height={80}
                quality={60}
                priority
                sizes="(max-width: 640px) 60px, (max-width: 768px) 70px, 80px"
                className="w-auto h-[60px] sm:h-[70px] md:h-[80px]"
              />
            </Link>
          </div>

          {/* Right Section - Language Dropdown, Sign In, and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart Icon - Always visible */}
            <Link
              href="/cart"
              className="relative text-white hover:text-gray-300 transition-colors"
              aria-label={`Shopping cart${
                cartItemsCount > 0 ? `, ${cartItemsCount} items` : ""
              }`}
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Guest Login Icon - Only show when user is not logged in */}
            {!user && (
              <Link
                href="/guest-login"
                className="text-white hover:text-gray-300 transition-colors hidden sm:block"
                aria-label="Guest login"
              >
                <User size={20} />
              </Link>
            )}

            <NotificationBell />

            {user && (
              <div className="hidden lg:flex items-center space-x-2 sm:space-x-4">
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
                aria-label={`Select language, currently ${language?.name}`}
                aria-haspopup="true"
                aria-expanded={isLanguageOpen}
              >
                <ReactCountryFlag
                  countryCode={langToCountry[language?.code] || "GB"}
                  svg
                  style={{ width: "1rem", height: "1rem" }}
                  aria-hidden="true"
                />
                <span className="hidden lg:inline">{language?.name}</span>
                <span className="lg:hidden">
                  {language?.code.toUpperCase()}
                </span>
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
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm flex items-center gap-2"
                      >
                        <ReactCountryFlag
                          countryCode={langToCountry[lang.code] || "GB"}
                          svg
                          style={{ width: "1rem", height: "1rem" }}
                          aria-label={lang.name}
                        />
                        <span>{lang.name}</span>
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
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                >
                  <img
                    src={user.profile.avatar || "/icons/profile.png"}
                    alt="user"
                    width={100}
                    height={100}
                    className="h-[40px] rounded-full object-cover"
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
                            <span className="font-bold text-green-500">
                              ${Number(user.balance || 0).toFixed(2)}
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
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          <div className="fixed top-0 left-0 w-64 h-full bg-gray-900 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">L</span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-gray-300"
                aria-label="Close mobile menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
              {/* Mobile Cart Link */}
              <Link
                href="/cart"
                onClick={toggleMobileMenu}
                className="flex items-center text-white hover:text-primary transition-colors font-secondary text-sm py-2"
              >
                <ShoppingCart size={18} className="mr-3" />
                Cart ({cartItemsCount})
              </Link>

              {navigationLinks.map((link, i) => (
                <div key={link.href}>
                  {link.hasDropdown ? (
                    <div>
                      <div className="font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm py-2 flex items-center justify-between">
                        <span>{navLabels[i]}</span>
                        <ChevronDown size={16} />
                      </div>
                      {/* Mobile Products List */}
                      <div className="ml-4 space-y-2">
                        {productsLoading ? (
                          <div className="text-gray-400 text-sm">
                            Loading...
                          </div>
                        ) : products.length > 0 ? (
                          products.map((product, index) => (
                            <div
                              key={product._id || index}
                              onClick={() => {
                                handleProductClick(product.linkUrl);
                                toggleMobileMenu();
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                            >
                              <div className="w-8 h-8 relative flex-shrink-0">
                                <Image
                                  src={product.imageUrl || "/icons/profile.png"}
                                  alt={product.title}
                                  fill
                                  sizes="32px"
                                  className="object-cover rounded"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-medium text-white truncate">
                                  {product.title}
                                </h4>
                                <p className="text-xs text-gray-400 line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-xs">
                            No products
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      className="block font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm py-2"
                      onClick={toggleMobileMenu}
                    >
                      {navLabels[i]}
                    </a>
                  )}
                </div>
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

              {/* Mobile Guest Login - Only show if not logged in */}
              {!user && (
                <div className="pt-4 border-t border-gray-700">
                  <Link
                    href="/guest-login"
                    onClick={toggleMobileMenu}
                    className="flex items-center text-white hover:text-primary transition-colors font-secondary text-sm py-2"
                  >
                    <User size={18} className="mr-3" />
                    {guestLoginLabel}
                  </Link>
                </div>
              )}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-gray-700">
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="flex outline-none items-center justify-between w-full font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-4 py-3 text-sm bg-gray-800"
                    aria-label={`Select language, currently ${language?.name}`}
                    aria-haspopup="true"
                    aria-expanded={isLanguageOpen}
                  >
                    <div className="flex items-center space-x-2">
                      <ReactCountryFlag
                        countryCode={langToCountry[language?.code] || "GB"}
                        svg
                        style={{ width: "1rem", height: "1rem" }}
                        aria-hidden="true"
                      />
                      <span>{language?.name}</span>
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
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors font-secondary text-sm flex items-center gap-2"
                          >
                            <ReactCountryFlag
                              countryCode={langToCountry[lang.code] || "GB"}
                              svg
                              style={{ width: "1rem", height: "1rem" }}
                              aria-label={lang.name}
                            />
                            <span>{lang.name}</span>
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
      <AudioUnlocker />
    </>
  );
};

export default Navbar;
