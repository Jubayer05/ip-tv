"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { language, translate, isLanguageLoaded } = useLanguage();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    // Original static texts
    const ORIGINAL_TEXTS = {
      loading: "Loading...",
    };

    const [texts, setTexts] = useState(ORIGINAL_TEXTS);

    // Translate texts
    useEffect(() => {
      if (!isLanguageLoaded || language?.code === "en") {
        setTexts(ORIGINAL_TEXTS);
        return;
      }

      let isMounted = true;
      (async () => {
        try {
          const items = Object.values(ORIGINAL_TEXTS);
          const translated = await translate(items);
          if (!isMounted) return;

          const translatedTexts = {};
          Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
            translatedTexts[key] = translated[index];
          });
          setTexts(translatedTexts);
        } catch (error) {
          console.error("Translation error:", error);
          setTexts(ORIGINAL_TEXTS);
        }
      })();

      return () => {
        isMounted = false;
      };
    }, [language?.code, translate, isLanguageLoaded]);

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push("/login");
        } else {
          // Remove Firebase email verification check since you have custom SMTP system
          // else if (!user.emailVerified) {
          //   router.push("/verify-email");
          // } else {
          setIsChecking(false);
          // }
        }
      }
    }, [user, loading, router]);

    if (loading || isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white text-sm">{texts.loading}</p>
          </div>
        </div>
      );
    }

    // Remove Firebase email verification check
    if (!user) {
      return null; // Will redirect
    }

    return <Component {...props} />;
  };
}
