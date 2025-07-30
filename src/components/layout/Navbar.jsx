"use client";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Button from "../ui/button";

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
  ];

  const navigationLinks = [
    { href: "/", label: "HOME" },
    { href: "/explore", label: "EXPLORE" },
    { href: "/pricing", label: "PRICING" },
    { href: "/packages", label: "PACKAGES" },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    setIsLanguageOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="h-[70px] relative bg-transparent">
        <div className="flex items-center justify-between w-container mx-auto h-full">
          {/* Left Section - Menu and Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-base"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Center Section - Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center top-[13px]">
            <Image src="/logos/logo.png" alt="Logo" width={100} height={100} />
          </div>

          {/* Right Section - Language Dropdown and Sign In */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Search Icon */}
            <button className="text-white hover:text-gray-300 transition-colors hidden sm:block">
              <Search size={20} />
            </button>

            {/* Language Dropdown - Hidden on mobile */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex outline-none items-center space-x-2 font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-3 lg:px-5 py-2 lg:py-3 text-xs bg-gray-900"
              >
                <Globe size={16} className="text-primary" />
                <span className="hidden lg:inline">{selectedLanguage}</span>
                <span className="lg:hidden">EN</span>
                <ChevronDown
                  size={14}
                  className={`transform transition-transform ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm"
                      >
                        {language.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <div className="">
              <Button size="md">Sign In</Button>
            </div>
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
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm py-2"
                  onClick={toggleMobileMenu}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Language Selector */}
              <div className="pt-4 border-t border-gray-700">
                <div className="relative">
                  <button
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    className="flex outline-none items-center justify-between w-full font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-4 py-3 text-sm bg-gray-800"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe size={18} className="text-primary" />
                      <span>{selectedLanguage}</span>
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
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              handleLanguageSelect(language);
                              setIsLanguageOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors font-secondary text-sm"
                          >
                            {language.name}
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
    </>
  );
};

export default Navbar;

// "use client";

// const Navbar = () => {

//   return (
//     <>
//       <nav className="h-[70px] relative bg-transparent">
//         <div className="flex items-center justify-between max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
//           {/* Left Section - Menu and Navigation */}
//           <div className="flex items-center space-x-4 lg:space-x-8">

//             <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
//               {navigationLinks.map((link) => (
//                 <a
//                   key={link.href}
//                   href={link.href}
//                   className="font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm"
//                 >
//                   {link.label}
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Center Section - Logo */}
//           <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
//             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
//               <span className="text-black font-bold text-xl">L</span>
//             </div>
//           </div>

//           {/* Right Section - Language Dropdown and Sign In */}
//           <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
//             {/* Search Icon */}
//             <button className="text-white hover:text-gray-300 transition-colors">
//               <Search size={20} />
//             </button>

//             {/* Language Dropdown - Hidden on mobile */}
//             <div className="relative hidden sm:block">
//               <button
//                 onClick={() => setIsLanguageOpen(!isLanguageOpen)}
//                 className="flex outline-none items-center space-x-2 font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-3 lg:px-5 py-2 lg:py-3 text-xs bg-gray-900"
//               >
//                 <Globe size={16} lg:size={20} className="text-primary" />
//                 <span className="hidden lg:inline">{selectedLanguage}</span>
//                 <span className="lg:hidden">EN</span>
//                 <ChevronDown
//                   size={14}
//                   className={`transform transition-transform ${
//                     isLanguageOpen ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {/* Dropdown Menu */}
//               {isLanguageOpen && (
//                 <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50">
//                   <div className="py-1">
//                     {languages.map((language) => (
//                       <button
//                         key={language.code}
//                         onClick={() => handleLanguageSelect(language)}
//                         className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors font-secondary text-sm"
//                       >
//                         {language.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Sign In Button */}
//             <button className="bg-white text-black rounded-[30px] font-secondary font-semibold text-xs leading-none tracking-[0%] w-[70px] sm:w-[79px] h-[35px] sm:h-[40px] hover:bg-gray-100 transition-colors flex justify-center items-center">
//               Sign In
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu Overlay */}
//       {isMobileMenuOpen && (
//         <div className="fixed inset-0 z-50 md:hidden">
//           <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu}></div>
//           <div className="fixed top-0 left-0 w-64 h-full bg-gray-900 shadow-xl">
//             <div className="flex items-center justify-between p-4 border-b border-gray-700">
//               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
//                 <span className="text-black font-bold text-sm">L</span>
//               </div>
//               <button
//                 onClick={toggleMobileMenu}
//                 className="text-white hover:text-gray-300"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-4 space-y-4">
//               {navigationLinks.map((link) => (
//                 <a
//                   key={link.href}
//                   href={link.href}
//                   className="block font-primary text-white hover:text-primary transition-colors uppercase tracking-wide text-sm py-2"
//                   onClick={toggleMobileMenu}
//                 >
//                   {link.label}
//                 </a>
//               ))}

//               {/* Mobile Language Selector */}
//               <div className="pt-4 border-t border-gray-700">
//                 <div className="relative">
//                   <button
//                     onClick={() => setIsLanguageOpen(!isLanguageOpen)}
//                     className="flex outline-none items-center justify-between w-full font-secondary text-white hover:text-gray-300 transition-colors border border-gray-600 rounded-[30px] px-4 py-3 text-sm bg-gray-800"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Globe size={18} className="text-primary" />
//                       <span>{selectedLanguage}</span>
//                     </div>
//                     <ChevronDown
//                       size={16}
//                       className={`transform transition-transform ${
//                         isLanguageOpen ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>

//                   {isLanguageOpen && (
//                     <div className="mt-2 bg-gray-800 rounded-md shadow-lg">
//                       <div className="py-1">
//                         {languages.map((language) => (
//                           <button
//                             key={language.code}
//                             onClick={() => {
//                               handleLanguageSelect(language);
//                               setIsLanguageOpen(false);
//                             }}
//                             className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors font-secondary text-sm"
//                           >
//                             {language.name}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Navbar;
