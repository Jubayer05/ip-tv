"use client";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ShoppingCartModal from "./MyCart";

const PremiumPlanCard = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [showCart, setShowCart] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ORIGINAL_HEADING = "PREMIUM PLAN";
  const ORIGINAL_VALID_TILL = "Valid till 28 Aug";
  const ORIGINAL_PER_MONTH = "/Per month";
  const ORIGINAL_QUICK_REORDER = "Quick Reorder";
  const ORIGINAL_CANCEL_PLAN = "Cancel Plan";
  const ORIGINAL_NO_PLAN = "No Active Plan";
  const ORIGINAL_GET_PLAN = "Get Plan";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [validTill, setValidTill] = useState(ORIGINAL_VALID_TILL);
  const [perMonth, setPerMonth] = useState(ORIGINAL_PER_MONTH);
  const [quickReorder, setQuickReorder] = useState(ORIGINAL_QUICK_REORDER);
  const [cancelPlan, setCancelPlan] = useState(ORIGINAL_CANCEL_PLAN);
  const [noPlan, setNoPlan] = useState(ORIGINAL_NO_PLAN);
  const [getPlan, setGetPlan] = useState(ORIGINAL_GET_PLAN);

  // Fetch current plan data
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/users/current-plan?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (data.success) {
          setPlanData(data.plan);
        }
      } catch (error) {
        console.error("Error fetching current plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPlan();
  }, [user?.email]);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_HEADING,
        ORIGINAL_VALID_TILL,
        ORIGINAL_PER_MONTH,
        ORIGINAL_QUICK_REORDER,
        ORIGINAL_CANCEL_PLAN,
        ORIGINAL_NO_PLAN,
        ORIGINAL_GET_PLAN,
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tHeading,
        tValidTill,
        tPerMonth,
        tQuickReorder,
        tCancelPlan,
        tNoPlan,
        tGetPlan,
      ] = translated;

      setHeading(tHeading);
      setValidTill(tValidTill);
      setPerMonth(tPerMonth);
      setQuickReorder(tQuickReorder);
      setCancelPlan(tCancelPlan);
      setNoPlan(tNoPlan);
      setGetPlan(tGetPlan);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const handleQuickReorder = () => {
    router.push("/packages");
  };

  const handleGetPlan = () => {
    router.push("/packages");
  };

  const handleCancelPlan = async () => {
    const result = await Swal.fire({
      title: "Cancel Plan?",
      text: "Are you sure you want to cancel your current plan? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `/api/users/current-plan?email=${encodeURIComponent(user.email)}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: "Plan Cancelled!",
            text: "Your plan has been cancelled successfully.",
            icon: "success",
          });

          // Refresh plan data
          const planResponse = await fetch(
            `/api/users/current-plan?email=${encodeURIComponent(user.email)}`
          );
          const planData = await planResponse.json();
          if (planData.success) {
            setPlanData(planData.plan);
          }
        } else {
          Swal.fire({
            title: "Error!",
            text: data.error || "Failed to cancel plan",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error cancelling plan:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to cancel plan. Please try again.",
          icon: "error",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-6"></div>
          <div className="h-12 bg-gray-700 rounded mb-6"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-700 rounded flex-1"></div>
            <div className="h-10 bg-gray-700 rounded flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border border-[#212121] bg-black rounded-[15px] p-4 sm:p-6 md:p-8 w-1/2 -mt-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-white text-base sm:text-lg font-semibold mb-2">
            {planData?.isActive ? heading : noPlan}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            {planData?.isActive
              ? planData.message ||
                `Valid till ${formatDate(planData.expireDate)}`
              : "Choose a plan to get started"}
          </p>
        </div>

        {/* Price */}
        {planData?.isActive && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-baseline">
              <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                ${planData.price}
              </span>
              <span className="text-gray-400 text-sm sm:text-lg ml-2">
                {perMonth}
              </span>
            </div>
            {planData.planName && (
              <p className="text-gray-300 text-sm mt-2">{planData.planName}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {planData?.isActive ? (
            <>
              <Button
                onClick={handleQuickReorder}
                className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
              >
                {quickReorder}
              </Button>

              <Button
                onClick={handleCancelPlan}
                className="border border-white/25 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm bg-white/10 hover:bg-white hover:text-black transition-colors"
              >
                {cancelPlan}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGetPlan}
              className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 w-full"
            >
              {getPlan}
            </Button>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      <ShoppingCartModal isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default PremiumPlanCard;
