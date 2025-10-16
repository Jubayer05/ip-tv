import { useEffect, useState } from "react";

// Original text constants
const ORIGINAL_TEXTS = {
  header: "SELECT SUBSCRIPTION PERIOD:",
  controls: {
    devices: {
      title: "Select Devices:",
      recommended: "Recommended",
      device: "Device",
      devices: "Devices",
    },
    accountBox: {
      title: "Account Configuration",
    },
    accountConfiguration: {
      title: "Configure Each Account",
    },
    deviceType: {
      title: "Choose Your Device Type",
    },
    adultChannels: {
      title: "Adult Channels:",
      on: "On",
      off: "Off",
    },
    quantity: {
      title: "Select Quantity:",
      custom: "Custom",
      enterQuantity: "Enter quantity",
    },
  },
  bulkDiscount: {
    title: "Bulk Discount Offers",
    offers: [
      { orders: "3 Orders", discount: "5% OFF" },
      { orders: "5 Orders", discount: "10% OFF" },
      { orders: "10 Orders", discount: "15% OFF" },
    ],
  },
  button: "PROCEED TO PURCHASE",
  rankDiscount: {
    congratulations: "Congratulations! You've earned a",
    discountOnAllPurchases: "discount on all purchases.",
    rankDiscount: "Rank Discount",
  },
  priceSummary: {
    title: "Price Summary",
    basePrice: "Base Price:",
    devices: "Devices",
    perDevice: "per device",
    quantity: "Quantity:",
    subtotal: "Subtotal:",
    bulkDiscount: "Bulk Discount",
    off: "OFF",
    rankDiscount: "Rank Discount",
    adultChannelsFee: "Adult Channels Fee:",
    adultChannelsFeeAfterCoupon: "Adult Channels Fee (after coupon):",
    coupon: "Coupon",
    finalTotal: "Final Total:",
  },
  coupon: {
    placeholder: "Enter coupon code",
    apply: "Apply",
    applied: "Applied",
    off: "off",
    validationFailed: "Validation failed",
    invalidCoupon: "Invalid coupon",
    amountMustBeGreater: "Amount must be greater than 0",
  },
  loading: "Loading...",
  noProductData: "No product data available",
};

export const useTranslation = (
  product,
  isLanguageLoaded,
  language,
  translate
) => {
  // Add state to store translated plan names
  const [translatedPlans, setTranslatedPlans] = useState([]);
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Enhanced translation effect for all plan fields
  useEffect(() => {
    if (!product?.variants || !isLanguageLoaded || language.code === "en") {
      setTranslatedPlans(product?.variants || []);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text from plan variants
        const textsToTranslate = [];
        const planTexts = [];

        product.variants.forEach((variant, variantIndex) => {
          // Plan name
          planTexts.push({ variantIndex, type: "name", text: variant.name });
          textsToTranslate.push(variant.name);

          // Plan description
          if (variant.description) {
            planTexts.push({
              variantIndex,
              type: "description",
              text: variant.description,
            });
            textsToTranslate.push(variant.description);
          }

          // Plan features (array of strings)
          if (variant.features && Array.isArray(variant.features)) {
            variant.features.forEach((feature, featureIndex) => {
              planTexts.push({
                variantIndex,
                type: "feature",
                featureIndex,
                text: feature,
              });
              textsToTranslate.push(feature);
            });
          }

          // Plan duration (if it's a string)
          if (variant.duration && typeof variant.duration === "string") {
            planTexts.push({
              variantIndex,
              type: "duration",
              text: variant.duration,
            });
            textsToTranslate.push(variant.duration);
          }

          // Plan duration text (if it exists)
          if (variant.durationText) {
            planTexts.push({
              variantIndex,
              type: "durationText",
              text: variant.durationText,
            });
            textsToTranslate.push(variant.durationText);
          }

          // Plan subtitle (if it exists)
          if (variant.subtitle) {
            planTexts.push({
              variantIndex,
              type: "subtitle",
              text: variant.subtitle,
            });
            textsToTranslate.push(variant.subtitle);
          }

          // Plan benefits (if it exists as array)
          if (variant.benefits && Array.isArray(variant.benefits)) {
            variant.benefits.forEach((benefit, benefitIndex) => {
              planTexts.push({
                variantIndex,
                type: "benefit",
                benefitIndex,
                text: benefit,
              });
              textsToTranslate.push(benefit);
            });
          }
        });

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        // Create translated variants
        const translatedVariants = product.variants.map(
          (variant, variantIndex) => {
            const translatedVariant = { ...variant };

            // Translate name
            const nameText = planTexts.find(
              (pt) => pt.variantIndex === variantIndex && pt.type === "name"
            );
            if (nameText) {
              const translatedIndex = planTexts.indexOf(nameText);
              translatedVariant.name = translated[translatedIndex];
            }

            // Translate description
            const descText = planTexts.find(
              (pt) =>
                pt.variantIndex === variantIndex && pt.type === "description"
            );
            if (descText) {
              const translatedIndex = planTexts.indexOf(descText);
              translatedVariant.description = translated[translatedIndex];
            }

            // Translate features
            if (variant.features && Array.isArray(variant.features)) {
              translatedVariant.features = variant.features.map(
                (feature, featureIndex) => {
                  const featureText = planTexts.find(
                    (pt) =>
                      pt.variantIndex === variantIndex &&
                      pt.type === "feature" &&
                      pt.featureIndex === featureIndex
                  );
                  if (featureText) {
                    const translatedIndex = planTexts.indexOf(featureText);
                    return translated[translatedIndex];
                  }
                  return feature;
                }
              );
            }

            // Translate duration
            if (variant.duration && typeof variant.duration === "string") {
              const durationText = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "duration"
              );
              if (durationText) {
                const translatedIndex = planTexts.indexOf(durationText);
                translatedVariant.duration = translated[translatedIndex];
              }
            }

            // Translate duration text
            if (variant.durationText) {
              const durationTextObj = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "durationText"
              );
              if (durationTextObj) {
                const translatedIndex = planTexts.indexOf(durationTextObj);
                translatedVariant.durationText = translated[translatedIndex];
              }
            }

            // Translate subtitle
            if (variant.subtitle) {
              const subtitleText = planTexts.find(
                (pt) =>
                  pt.variantIndex === variantIndex && pt.type === "subtitle"
              );
              if (subtitleText) {
                const translatedIndex = planTexts.indexOf(subtitleText);
                translatedVariant.subtitle = translated[translatedIndex];
              }
            }

            // Translate benefits
            if (variant.benefits && Array.isArray(variant.benefits)) {
              translatedVariant.benefits = variant.benefits.map(
                (benefit, benefitIndex) => {
                  const benefitText = planTexts.find(
                    (pt) =>
                      pt.variantIndex === variantIndex &&
                      pt.type === "benefit" &&
                      pt.benefitIndex === benefitIndex
                  );
                  if (benefitText) {
                    const translatedIndex = planTexts.indexOf(benefitText);
                    return translated[translatedIndex];
                  }
                  return benefit;
                }
              );
            }

            return translatedVariant;
          }
        );

        setTranslatedPlans(translatedVariants);
      } catch (error) {
        console.error("Error translating plan data:", error);
        setTranslatedPlans(product.variants || []);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [product?.variants, language.code, isLanguageLoaded, translate]);

  // Translate UI texts
  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text
        const allTexts = [
          ORIGINAL_TEXTS.header,
          ORIGINAL_TEXTS.controls.devices.title,
          ORIGINAL_TEXTS.controls.devices.recommended,
          ORIGINAL_TEXTS.controls.devices.device,
          ORIGINAL_TEXTS.controls.devices.devices,
          ORIGINAL_TEXTS.controls.adultChannels.title,
          ORIGINAL_TEXTS.controls.adultChannels.on,
          ORIGINAL_TEXTS.controls.adultChannels.off,
          ORIGINAL_TEXTS.controls.quantity.title,
          ORIGINAL_TEXTS.controls.quantity.custom,
          ORIGINAL_TEXTS.controls.quantity.enterQuantity,
          ORIGINAL_TEXTS.bulkDiscount.title,
          ...ORIGINAL_TEXTS.bulkDiscount.offers.flatMap((offer) => [
            offer.orders,
            offer.discount,
          ]),
          ORIGINAL_TEXTS.button,
          ORIGINAL_TEXTS.rankDiscount.congratulations,
          ORIGINAL_TEXTS.rankDiscount.discountOnAllPurchases,
          ORIGINAL_TEXTS.rankDiscount.rankDiscount,
          ORIGINAL_TEXTS.priceSummary.title,
          ORIGINAL_TEXTS.priceSummary.basePrice,
          ORIGINAL_TEXTS.priceSummary.devices,
          ORIGINAL_TEXTS.priceSummary.perDevice,
          ORIGINAL_TEXTS.priceSummary.quantity,
          ORIGINAL_TEXTS.priceSummary.subtotal,
          ORIGINAL_TEXTS.priceSummary.bulkDiscount,
          ORIGINAL_TEXTS.priceSummary.off,
          ORIGINAL_TEXTS.priceSummary.rankDiscount,
          ORIGINAL_TEXTS.priceSummary.adultChannelsFee,
          ORIGINAL_TEXTS.priceSummary.adultChannelsFeeAfterCoupon,
          ORIGINAL_TEXTS.priceSummary.coupon,
          ORIGINAL_TEXTS.priceSummary.finalTotal,
          ORIGINAL_TEXTS.coupon.placeholder,
          ORIGINAL_TEXTS.coupon.apply,
          ORIGINAL_TEXTS.coupon.applied,
          ORIGINAL_TEXTS.coupon.off,
          ORIGINAL_TEXTS.coupon.validationFailed,
          ORIGINAL_TEXTS.coupon.invalidCoupon,
          ORIGINAL_TEXTS.coupon.amountMustBeGreater,
          ORIGINAL_TEXTS.loading,
          ORIGINAL_TEXTS.noProductData,
        ];

        const translated = await translate(allTexts);
        if (!isMounted) return;

        let currentIndex = 0;

        setTexts({
          header: translated[currentIndex++],
          controls: {
            devices: {
              title: translated[currentIndex++],
              recommended: translated[currentIndex++],
              device: translated[currentIndex++],
              devices: translated[currentIndex++],
            },
            adultChannels: {
              title: translated[currentIndex++],
              on: translated[currentIndex++],
              off: translated[currentIndex++],
            },
            quantity: {
              title: translated[currentIndex++],
              custom: translated[currentIndex++],
              enterQuantity: translated[currentIndex++],
            },
          },
          bulkDiscount: {
            title: translated[currentIndex++],
            offers: ORIGINAL_TEXTS.bulkDiscount.offers.map(() => ({
              orders: translated[currentIndex++],
              discount: translated[currentIndex++],
            })),
          },
          button: translated[currentIndex++],
          rankDiscount: {
            congratulations: translated[currentIndex++],
            discountOnAllPurchases: translated[currentIndex++],
            rankDiscount: translated[currentIndex++],
          },
          priceSummary: {
            title: translated[currentIndex++],
            basePrice: translated[currentIndex++],
            devices: translated[currentIndex++],
            perDevice: translated[currentIndex++],
            quantity: translated[currentIndex++],
            subtotal: translated[currentIndex++],
            bulkDiscount: translated[currentIndex++],
            off: translated[currentIndex++],
            rankDiscount: translated[currentIndex++],
            adultChannelsFee: translated[currentIndex++],
            adultChannelsFeeAfterCoupon: translated[currentIndex++],
            coupon: translated[currentIndex++],
            finalTotal: translated[currentIndex++],
          },
          coupon: {
            placeholder: translated[currentIndex++],
            apply: translated[currentIndex++],
            applied: translated[currentIndex++],
            off: translated[currentIndex++],
            validationFailed: translated[currentIndex++],
            invalidCoupon: translated[currentIndex++],
            amountMustBeGreater: translated[currentIndex++],
          },
          loading: translated[currentIndex++],
          noProductData: translated[currentIndex++],
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return { translatedPlans, texts };
};
