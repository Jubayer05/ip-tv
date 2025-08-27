"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function BuyPlansWithCoupons() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  const ORIGINAL_HEADING = "BUY PLANS WITH COUPONS";
  const ORIGINAL_VALID_TILL = "Valid till:";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [validTill, setValidTill] = useState(ORIGINAL_VALID_TILL);

  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/coupons?active=true&limit=2");
        const data = await res.json();
        if (data.success) {
          setCoupons((data.coupons || []).slice(0, 2));
        }
      } catch (e) {
        console.error("Coupon fetch error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;
    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_VALID_TILL];
      const translated = await translate(items);
      if (!isMounted) return;
      const [tHeading, tValidTill] = translated;
      setHeading(tHeading);
      setValidTill(tValidTill);
    })();
    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto -mt-3">
      <div className="flex items-center justify-between mb-4 -mt-2">
        <h2 className="text-base sm:text-lg font-bold tracking-wide">
          {heading}
        </h2>
        <div className="border-2 bg-primary/15 border-primary text-primary px-4 sm:px-6 py-[3px] rounded-full text-xs sm:text-sm font-medium">
          {coupons.length}
        </div>
      </div>

      <div className="space-y-2">
        {coupons.map((coupon, index) => (
          <div
            key={index}
            className="bg-[#0E0E11] border border-white/15 rounded-lg p-4 sm:p-6 hover:border-white/40 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                  {coupon.code}
                </h3>
                <p className="text-[#afafaf] text-xs">
                  {validTill}{" "}
                  {coupon.endDate
                    ? new Date(coupon.endDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div className="text-white font-bold text-xs sm:text-sm">
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% Off`
                  : `$${coupon.discountValue} Off`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
