import { useMemo } from "react";

export const usePricingCalculation = (
  selectedPlan,
  accountConfigurations, // Changed from individual parameters to accountConfigurations array
  product,
  currentRank
) => {
  const calculateTotalPrice = () => {
    if (
      !product?.variants?.[selectedPlan] ||
      !accountConfigurations ||
      accountConfigurations.length === 0
    )
      return {
        basePrice: 0,
        pricePerDevice: 0,
        deviceMultiplier: 1,
        quantity: 0,
        effectiveDevices: 1,
        subtotal: 0,
        bulkDiscountPercentage: 0,
        bulkDiscountAmount: 0,
        rankDiscountPercentage: 0,
        rankDiscountAmount: 0,
        afterBulkDiscount: 0,
        afterRankDiscount: 0,
        adultChannelsFee: 0,
        finalTotal: 0,
        currency: "$",
        devicePricing: [],
        bulkDiscounts: [],
        adultChannelsFeePercentage: 20,
      };

    const plan = product.variants[selectedPlan];
    const basePrice = plan.price || 0;
    const quantity = accountConfigurations.length;

    if (quantity <= 0)
      return {
        basePrice,
        pricePerDevice: 0,
        deviceMultiplier: 1,
        quantity: 0,
        effectiveDevices: 1,
        subtotal: 0,
        bulkDiscountPercentage: 0,
        bulkDiscountAmount: 0,
        rankDiscountPercentage: 0,
        rankDiscountAmount: 0,
        afterBulkDiscount: 0,
        afterRankDiscount: 0,
        adultChannelsFee: 0,
        finalTotal: 0,
        currency: "$",
        devicePricing: product.devicePricing || [],
        bulkDiscounts: product.bulkDiscounts || [],
        adultChannelsFeePercentage: product.adultChannelsFeePercentage || 20,
      };

    // Calculate total price for all accounts
    let totalSubtotal = 0;
    let totalAdultChannelsFee = 0;

    // Get device pricing from product configuration
    const devicePricing = product.devicePricing || [
      { deviceCount: 1, multiplier: 1 },
      { deviceCount: 2, multiplier: 1.5 },
      { deviceCount: 3, multiplier: 2 },
    ];

    // Calculate price for each account
    accountConfigurations.forEach((config) => {
      const effectiveDevices = config.devices || 1;

      // Find the device multiplier for this account's devices
      const deviceRule = devicePricing.find(
        (d) => d.deviceCount === effectiveDevices
      );
      const deviceMultiplier = deviceRule ? deviceRule.multiplier : 1;

      // Calculate base price per device for this account
      const pricePerDevice = basePrice * deviceMultiplier;
      totalSubtotal += pricePerDevice;

      // Calculate adult channels fee for this account
      if (config.adultChannels) {
        const adultChannelsFeePercentage =
          product.adultChannelsFeePercentage || 20;
        totalAdultChannelsFee +=
          (pricePerDevice * adultChannelsFeePercentage) / 100;
      }
    });

    // Get bulk discounts from product configuration
    const bulkDiscounts = product.bulkDiscounts || [
      { minQuantity: 3, discountPercentage: 5 },
      { minQuantity: 5, discountPercentage: 10 },
      { minQuantity: 10, discountPercentage: 15 },
    ];

    // Find applicable bulk discount
    const applicableDiscount = bulkDiscounts
      .filter((d) => quantity >= d.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    const bulkDiscountPercentage = applicableDiscount
      ? applicableDiscount.discountPercentage
      : 0;

    // Calculate bulk discount amount
    const bulkDiscountAmount = (totalSubtotal * bulkDiscountPercentage) / 100;

    // Apply bulk discount
    const afterBulkDiscount = totalSubtotal - bulkDiscountAmount;

    // Get rank discount percentage
    const rankDiscountPercentage = currentRank?.discount || 0;

    // Calculate rank discount amount
    const rankDiscountAmount =
      (afterBulkDiscount * rankDiscountPercentage) / 100;

    // Apply rank discount
    const afterRankDiscount = afterBulkDiscount - rankDiscountAmount;

    // Add adult channels fee to the final total
    const finalTotal = afterRankDiscount + totalAdultChannelsFee;

    // Calculate average effective devices for display purposes
    const totalDevices = accountConfigurations.reduce(
      (sum, config) => sum + (config.devices || 1),
      0
    );
    const averageEffectiveDevices = Math.round(totalDevices / quantity);

    // Calculate average price per device for display
    const averagePricePerDevice = totalSubtotal / quantity;

    return {
      basePrice,
      pricePerDevice: Math.round(averagePricePerDevice * 100) / 100,
      deviceMultiplier: 1, // This is now an average, so we'll show 1 for simplicity
      quantity,
      effectiveDevices: averageEffectiveDevices,
      subtotal: Math.round(totalSubtotal * 100) / 100,
      bulkDiscountPercentage,
      bulkDiscountAmount: Math.round(bulkDiscountAmount * 100) / 100,
      rankDiscountPercentage,
      rankDiscountAmount: Math.round(rankDiscountAmount * 100) / 100,
      afterBulkDiscount: Math.round(afterBulkDiscount * 100) / 100,
      afterRankDiscount: Math.round(afterRankDiscount * 100) / 100,
      adultChannelsFee: Math.round(totalAdultChannelsFee * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      currency: "$",
      devicePricing,
      bulkDiscounts,
      adultChannelsFeePercentage: product.adultChannelsFeePercentage || 20,
    };
  };

  const priceCalculation = useMemo(
    () => calculateTotalPrice(),
    [selectedPlan, accountConfigurations, product, currentRank]
  );

  return { calculateTotalPrice, priceCalculation };
};
