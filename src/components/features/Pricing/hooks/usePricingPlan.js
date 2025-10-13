import { useEffect, useState } from "react";

export const usePricingPlan = () => {
  // Extract all state management
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add device type selection
  const [selectedDeviceType, setSelectedDeviceType] = useState(0); // 0: M3U, 1: MAG, 2: Enigma2

  // New state for multiple account configurations
  const [accountConfigurations, setAccountConfigurations] = useState([
    { devices: 1, adultChannels: false },
  ]);

  // Handle quantity selection
  const handleQuantityChange = (quantity) => {
    if (quantity === "custom") {
      setShowCustomInput(true);
      setSelectedQuantity("custom");
    } else {
      setShowCustomInput(false);
      setSelectedQuantity(quantity);
      setCustomQuantity("");

      // Initialize account configurations based on quantity
      const configs = Array.from({ length: quantity }, (_, index) => ({
        devices: index === 0 ? 1 : 1, // Default to 1 device for all
        adultChannels: false,
      }));
      setAccountConfigurations(configs);
    }
  };

  // Handle custom quantity input
  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      const qty = parseInt(value);
      setSelectedQuantity(qty);

      // Initialize account configurations based on custom quantity
      const configs = Array.from({ length: qty }, () => ({
        devices: 1,
        adultChannels: false,
      }));
      setAccountConfigurations(configs);
    }
  };

  // Update specific account configuration
  const updateAccountConfiguration = (index, field, value) => {
    setAccountConfigurations((prev) =>
      prev.map((config, i) =>
        i === index ? { ...config, [field]: value } : config
      )
    );
  };

  // Get the actual quantity
  const getActualQuantity = () => {
    return selectedQuantity === "custom"
      ? parseInt(customQuantity) || 0
      : selectedQuantity;
  };

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("/api/admin/products");
        if (response.ok) {
          const data = await response.json();
          setProduct(data[0]);
          // Set recommended plan as default selected
          const recommendedIndex = data[0].variants?.findIndex(
            (v) => v.recommended
          );
          if (recommendedIndex !== -1) {
            setSelectedPlan(recommendedIndex);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  return {
    // States
    selectedPlan,
    setSelectedPlan,
    selectedQuantity,
    setSelectedQuantity,
    customQuantity,
    setCustomQuantity,
    showCustomInput,
    setShowCustomInput,
    product,
    setProduct,
    loading,
    setLoading,
    selectedDeviceType,
    setSelectedDeviceType,
    accountConfigurations,
    setAccountConfigurations,

    // Handlers
    handleQuantityChange,
    handleCustomQuantityChange,
    updateAccountConfiguration,
    getActualQuantity,
  };
};
