// Generate random username and password
export const generateRandomCredentials = (orderNumber, index = 0) => {
  // Generate shorter username (8 characters max)
  const randomString = Math.random().toString(36).substring(2, 10);
  const username = index > 0 ? `${randomString}${index}` : randomString;

  // Generate shorter password (8 characters max)
  const password = Math.random().toString(36).substring(2, 10);

  return { username, password };
};

export const createSelectionData = (
  selectedPlanData,
  product,
  selectedDevices,
  adultChannels,
  actualQuantity,
  selectedQuantity,
  priceCalculation,
  appliedCoupon,
  displayTotals,
  finalPrice
) => {
  // Generate random credentials for each account
  const generatedCredentials = [];
  const orderNumber = `ORD${Date.now()}`; // Generate a temporary order number for credential generation

  // M3U - one account for multiple devices
  const { username, password } = generateRandomCredentials(orderNumber);
  generatedCredentials.push({ username, password });

  const selectionData = {
    plan: {
      name: selectedPlanData?.name || "Unknown",
      duration: selectedPlanData?.durationMonths || 0,
      price: selectedPlanData?.price || 0,
      currency: selectedPlanData?.currency || "USD",
    },
    productId: product?.id || product?._id,
    variantId: selectedPlanData?.id || selectedPlanData?._id,
    devices: selectedDevices,
    adultChannels: adultChannels,
    quantity: actualQuantity,
    isCustomQuantity: selectedQuantity === "custom",

    // Generated credentials
    generatedCredentials: generatedCredentials,

    priceCalculation: {
      ...priceCalculation,
      finalTotal: finalPrice,
      couponApplied: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountAmount: displayTotals.couponDiscountAmount,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          }
        : null,
      displayTotals: displayTotals,
    },
    timestamp: new Date().toISOString(),
    coupon: appliedCoupon
      ? {
          code: appliedCoupon.code,
          discountAmount: displayTotals.couponDiscountAmount,
          discountType: appliedCoupon.discountType,
          discountValue: appliedCoupon.discountValue,
        }
      : null,
    finalPrice: finalPrice,
  };

  return selectionData;
};

export const createMultiAccountSelectionData = (
  selectedPlanData,
  product,
  accountConfigurations,
  priceCalculation,
  appliedCoupon,
  displayTotals,
  finalPrice,
  selectedDeviceType // Add device type parameter
) => {
  // Generate random credentials for each account
  const generatedCredentials = [];
  const orderNumber = `ORD${Date.now()}`;

  accountConfigurations.forEach((config, index) => {
    const { username, password } = generateRandomCredentials(
      orderNumber,
      index
    );
    generatedCredentials.push({
      username,
      password,
      devices: config.devices,
      adultChannels: config.adultChannels,
    });
  });

  const selectionData = {
    plan: {
      name: selectedPlanData?.name || "Unknown",
      duration: selectedPlanData?.durationMonths || 0,
      price: selectedPlanData?.price || 0,
      currency: selectedPlanData?.currency || "USD",
    },
    productId: product?.id || product?._id,
    variantId: selectedPlanData?.id || selectedPlanData?._id,
    quantity: accountConfigurations.length,

    // Include device type
    lineType: selectedDeviceType, // 0: M3U, 1: MAG, 2: Enigma2

    // Include account configurations for the API
    accountConfigurations: accountConfigurations,

    // Include credentials for each account
    generatedCredentials: generatedCredentials,

    // Include the primary configuration for backward compatibility
    selectedDevices: accountConfigurations[0]?.devices || 1,
    adultChannels: accountConfigurations[0]?.adultChannels || false,

    priceCalculation: {
      ...priceCalculation,
      finalTotal: finalPrice,
      couponApplied: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountAmount: displayTotals.couponDiscountAmount,
            discountType: appliedCoupon.discountType,
            discountValue: appliedCoupon.discountValue,
          }
        : null,
      displayTotals: displayTotals,
    },
    timestamp: new Date().toISOString(),
    finalPrice: finalPrice,
  };

  return selectionData;
};
