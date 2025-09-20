/**
 * Calculate service fee for payment methods
 * @param {number} amount - Original amount
 * @param {Object} feeSettings - Fee settings from PaymentSettings
 * @returns {Object} - Fee calculation result
 */
export function calculateServiceFee(amount, feeSettings) {
  if (!feeSettings || !feeSettings.isActive) {
    return {
      originalAmount: amount,
      feeAmount: 0,
      totalAmount: amount,
      feePercentage: 0,
      feeType: "none",
    };
  }

  let feeAmount = 0;

  if (feeSettings.feeType === "percentage") {
    feeAmount = (amount * feeSettings.feePercentage) / 100;
  } else if (feeSettings.feeType === "fixed") {
    feeAmount = feeSettings.fixedAmount;
  }

  return {
    originalAmount: amount,
    feeAmount: parseFloat(feeAmount.toFixed(2)),
    totalAmount: parseFloat((amount + feeAmount).toFixed(2)),
    feePercentage:
      feeSettings.feeType === "percentage" ? feeSettings.feePercentage : 0,
    feeType: feeSettings.feeType,
  };
}

/**
 * Format fee information for display
 * @param {Object} feeCalculation - Result from calculateServiceFee
 * @returns {string} - Formatted fee string
 */
export function formatFeeInfo(feeCalculation) {
  if (feeCalculation.feeAmount === 0) {
    return "No service fee";
  }

  if (feeCalculation.feeType === "percentage") {
    return `${feeCalculation.feePercentage}% service fee ($${feeCalculation.feeAmount})`;
  } else {
    return `$${feeCalculation.feeAmount} fixed service fee`;
  }
}
