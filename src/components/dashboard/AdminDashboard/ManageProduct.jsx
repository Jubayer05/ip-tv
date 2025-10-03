"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const ManageProduct = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    variants: [
      {
        name: "",
        durationMonths: 1,
        deviceLimit: 1,
        price: 0,
        currency: "USD",
        description: "",
        customerNote: "",
        features: [{ text: "", included: true }],
        recommended: false,
      },
    ],
    devicePricing: [
      { deviceCount: 1, multiplier: 1, description: "1 Device" },
      {
        deviceCount: 2,
        multiplier: 1.5,
        description: "2 Devices (50% more)",
      },
      { deviceCount: 3, multiplier: 2, description: "3 Devices (100% more)" },
    ],
    bulkDiscounts: [
      {
        minQuantity: 3,
        discountPercentage: 5,
        description: "3+ Orders: 5% OFF",
      },
      {
        minQuantity: 5,
        discountPercentage: 10,
        description: "5+ Orders: 10% OFF",
      },
      {
        minQuantity: 10,
        discountPercentage: 15,
        description: "10+ Orders: 15% OFF",
      },
    ],
    adultChannelsFeePercentage: 20,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const ORIGINAL_TEXTS = {
    heading: "Manage Product",
    editExistingProduct: "Edit your existing product and variants",
    createProductWithVariants: "Create your product with different variants",
    productUpdatedSuccessfully: "Product updated successfully!",
    productCreatedSuccessfully: "Product created successfully!",
    errorOccurred: "Error occurred",
    errorOccurredWhileSaving: "Error occurred while saving product",
    loading: "Loading...",
    loadingProductData: "Loading product data...",
    productInformation: "Product Information",
    productName: "Product Name",
    description: "Description",
    enterProductName: "Enter product name",
    enterProductDescription: "Enter product description",
    devicePricingRules: "Device Pricing Rules",
    addDeviceRule: "Add Device Rule",
    deviceCount: "Device Count",
    priceMultiplier: "Price Multiplier",
    description: "Description",
    remove: "Remove",
    bulkDiscountRules: "Bulk Discount Rules",
    addDiscountRule: "Add Discount Rule",
    minimumQuantity: "Minimum Quantity",
    discountPercentage: "Discount Percentage",
    adultChannelsFee: "Adult Channels Fee",
    feePercentage: "Fee Percentage",
    percentageAddedToTotal: "Percentage added to total when adult channels are enabled",
    productVariants: "Product Variants",
    addVariant: "Add Variant",
    variant: "Variant",
    recommended: "Recommended",
    setAsRecommended: "Set as Recommended",
    name: "Name",
    durationMonths: "Duration (months)",
    deviceLimit: "Device Limit",
    price: "Price",
    currency: "Currency",
    customerNote: "Customer Note",
    features: "Features",
    addFeature: "Add Feature",
    specialNoteForCustomers: "Special note for customers",
    variantDescription: "Variant description",
    featureDescription: "Feature description",
    saving: "Saving...",
    updateProduct: "Update Product",
    createProduct: "Create Product",
  };

  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      const items = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(items);
      if (!isMounted) return;

      const translatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        translatedTexts[key] = translated[index];
      });
      setTexts(translatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();

        // Check if we have products and use the first one
        if (data && data.length > 0) {
          const existingProduct = data[0]; // Get the first product

          // Check if the product has the new fields
          if (
            !existingProduct.devicePricing ||
            !existingProduct.bulkDiscounts
          ) {
            // Migrate the product to include new fields
            try {
              const migrateResponse = await fetch(
                "/api/admin/products/migrate",
                {
                  method: "POST",
                }
              );
              if (migrateResponse.ok) {
                // Fetch the migrated product
                const migrateData = await migrateResponse.json();
                if (migrateData.products && migrateData.products.length > 0) {
                  const migratedProduct = migrateData.products[0];
                  setProduct(migratedProduct);
                  setIsEditing(true);
                  return;
                }
              }
            } catch (migrateError) {
              console.error("Migration failed, using fallback:", migrateError);
            }
          }

          // Ensure all required fields exist with fallbacks
          const productData = {
            ...product, // Use default values as fallback
            ...existingProduct,
            variants: existingProduct.variants || product.variants,
            devicePricing:
              existingProduct.devicePricing || product.devicePricing,
            bulkDiscounts:
              existingProduct.bulkDiscounts || product.bulkDiscounts,
            adultChannelsFeePercentage:
              existingProduct.adultChannelsFeePercentage ||
              product.adultChannelsFeePercentage,
          };

          setProduct(productData);
          setIsEditing(true); // Set to editing mode
        } else {
          // No products exist, stay in create mode
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          isEditing
            ? texts.productUpdatedSuccessfully
            : texts.productCreatedSuccessfully
        );
        setIsEditing(true);
        setProduct(data);
      } else {
        setMessage(data.message || texts.errorOccurred);
      }
    } catch (error) {
      setMessage(texts.errorOccurredWhileSaving);
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setProduct((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          name: "",
          durationMonths: 1,
          deviceLimit: 1,
          price: 0,
          currency: "USD",
          description: "",
          customerNote: "",
          features: [{ text: "", included: true }],
          recommended: false,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if ((product.variants || []).length > 1) {
      setProduct((prev) => ({
        ...prev,
        variants: (prev.variants || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateVariant = (index, field, value) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const addFeature = (variantIndex) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              features: [
                ...(variant.features || []),
                { text: "", included: true },
              ],
            }
          : variant
      ),
    }));
  };

  const removeFeature = (variantIndex, featureIndex) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              features: (variant.features || []).filter(
                (_, fi) => fi !== featureIndex
              ),
            }
          : variant
      ),
    }));
  };

  const updateFeature = (variantIndex, featureIndex, field, value) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              features: (variant.features || []).map((feature, fi) =>
                fi === featureIndex ? { ...feature, [field]: value } : feature
              ),
            }
          : variant
      ),
    }));
  };

  const setRecommended = (variantIndex) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).map((variant, i) => ({
        ...variant,
        recommended: i === variantIndex,
      })),
    }));
  };

  // Device Pricing Management
  const addDevicePricing = () => {
    setProduct((prev) => ({
      ...prev,
      devicePricing: [
        ...(prev.devicePricing || []),
        { deviceCount: 1, multiplier: 1, description: "" },
      ],
    }));
  };

  const removeDevicePricing = (index) => {
    if ((product.devicePricing || []).length > 1) {
      setProduct((prev) => ({
        ...prev,
        devicePricing: (prev.devicePricing || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateDevicePricing = (index, field, value) => {
    setProduct((prev) => ({
      ...prev,
      devicePricing: (prev.devicePricing || []).map((pricing, i) =>
        i === index ? { ...pricing, [field]: value } : pricing
      ),
    }));
  };

  // Bulk Discount Management
  const addBulkDiscount = () => {
    setProduct((prev) => ({
      ...prev,
      bulkDiscounts: [
        ...(prev.bulkDiscounts || []),
        { minQuantity: 1, discountPercentage: 0, description: "" },
      ],
    }));
  };

  const removeBulkDiscount = (index) => {
    if ((product.bulkDiscounts || []).length > 1) {
      setProduct((prev) => ({
        ...prev,
        bulkDiscounts: (prev.bulkDiscounts || []).filter((_, i) => i !== index),
      }));
    }
  };

  const updateBulkDiscount = (index, field, value) => {
    setProduct((prev) => ({
      ...prev,
      bulkDiscounts: (prev.bulkDiscounts || []).map((discount, i) =>
        i === index ? { ...discount, [field]: value } : discount
      ),
    }));
  };

  if (loading && !product.name) {
    return <div className="text-center py-8">{texts.loading}</div>;
  }

  // Show loading if we're still fetching and don't have product data
  if (loading) {
    return <div className="text-center py-8">{texts.loadingProductData}</div>;
  }

  // Ensure all arrays exist before rendering
  const variants = product.variants || [];
  const devicePricing = product.devicePricing || [];
  const bulkDiscounts = product.bulkDiscounts || [];

  return (
    <div className="max-w-6xl mx-auto p-6 font-secondary">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">{texts.heading}</h2>
        <p className="text-gray-300">
          {isEditing
            ? texts.editExistingProduct
            : texts.createProductWithVariants}
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("successfully")
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Basic Info */}
        <div className="bg-[#0C171C]/50 p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            {texts.productInformation}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.productName}
              </label>
              <Input
                name="name"
                value={product.name || ""}
                onChange={(e) =>
                  setProduct((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={texts.enterProductName}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.description}
              </label>
              <Input
                name="description"
                value={product.description || ""}
                onChange={(e) =>
                  setProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={texts.enterProductDescription}
              />
            </div>
          </div>
        </div>

        {/* Device Pricing Rules */}
        <div className="bg-[#0C171C]/50 p-6 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {texts.devicePricingRules}
            </h3>
            <Button onClick={addDevicePricing} variant="secondary" size="sm">
              {texts.addDeviceRule}
            </Button>
          </div>

          <div className="space-y-4">
            {devicePricing.map((pricing, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-white/20 rounded-lg p-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.deviceCount}
                  </label>
                  <Input
                    type="number"
                    value={pricing.deviceCount || 1}
                    onChange={(e) =>
                      updateDevicePricing(
                        index,
                        "deviceCount",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.priceMultiplier}
                  </label>
                  <Input
                    type="number"
                    value={pricing.multiplier || 1}
                    onChange={(e) =>
                      updateDevicePricing(
                        index,
                        "multiplier",
                        parseFloat(e.target.value)
                      )
                    }
                    min="1"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.description}
                  </label>
                  <Input
                    value={pricing.description || ""}
                    onChange={(e) =>
                      updateDevicePricing(index, "description", e.target.value)
                    }
                    placeholder="e.g., 2 Devices (50% more)"
                  />
                </div>
                <div>
                  {devicePricing.length > 1 && (
                    <Button
                      onClick={() => removeDevicePricing(index)}
                      variant="danger"
                      size="sm"
                    >
                      {texts.remove}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Discount Rules */}
        <div className="bg-[#0C171C]/50 p-6 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {texts.bulkDiscountRules}
            </h3>
            <Button onClick={addBulkDiscount} variant="secondary" size="sm">
              {texts.addDiscountRule}
            </Button>
          </div>

          <div className="space-y-4">
            {bulkDiscounts.map((discount, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-white/20 rounded-lg p-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.minimumQuantity}
                  </label>
                  <Input
                    type="number"
                    value={discount.minQuantity || 1}
                    onChange={(e) =>
                      updateBulkDiscount(
                        index,
                        "minQuantity",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.discountPercentage}
                  </label>
                  <Input
                    type="number"
                    value={discount.discountPercentage || 0}
                    onChange={(e) =>
                      updateBulkDiscount(
                        index,
                        "discountPercentage",
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.description}
                  </label>
                  <Input
                    value={discount.description || ""}
                    onChange={(e) =>
                      updateBulkDiscount(index, "description", e.target.value)
                    }
                    placeholder="e.g., 3+ Orders: 5% OFF"
                  />
                </div>
                <div>
                  {bulkDiscounts.length > 1 && (
                    <Button
                      onClick={() => removeBulkDiscount(index)}
                      variant="danger"
                      size="sm"
                    >
                      {texts.remove}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adult Channels Fee */}
        <div className="bg-[#0C171C]/50 p-6 rounded-xl border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            {texts.adultChannelsFee}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {texts.feePercentage}
              </label>
              <Input
                type="number"
                value={product.adultChannelsFeePercentage || 20}
                onChange={(e) =>
                  setProduct((prev) => ({
                    ...prev,
                    adultChannelsFeePercentage: parseInt(e.target.value),
                  }))
                }
                min="0"
                max="100"
                required
              />
              <p className="text-sm text-gray-400 mt-1">
                {texts.percentageAddedToTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-[#0C171C]/50 p-6 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {texts.productVariants}
            </h3>
            <Button onClick={addVariant} variant="secondary" size="sm">
              {texts.addVariant}
            </Button>
          </div>

          <div className="space-y-6">
            {variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="border border-white/20 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-white">
                    {texts.variant} {variantIndex + 1}
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setRecommended(variantIndex)}
                      variant={variant.recommended ? "primary" : "outline"}
                      size="sm"
                    >
                      {variant.recommended
                        ? texts.recommended
                        : texts.setAsRecommended}
                    </Button>
                    {variants.length > 1 && (
                      <Button
                        onClick={() => removeVariant(variantIndex)}
                        variant="danger"
                        size="sm"
                      >
                        {texts.remove}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.name}
                    </label>
                    <Input
                      value={variant.name || ""}
                      onChange={(e) =>
                        updateVariant(variantIndex, "name", e.target.value)
                      }
                      placeholder="Variant name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.durationMonths}
                    </label>
                    <Input
                      type="number"
                      value={variant.durationMonths || 1}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "durationMonths",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.deviceLimit}
                    </label>
                    <Input
                      type="number"
                      value={variant.deviceLimit || 1}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "deviceLimit",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.price}
                    </label>
                    <Input
                      type="number"
                      value={variant.price || 0}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "price",
                          parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.currency}
                    </label>
                    <Input
                      value={variant.currency || "USD"}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "currency",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="USD"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {texts.description}
                    </label>
                    <Input
                      value={variant.description || ""}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder={texts.variantDescription}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {texts.customerNote}
                  </label>
                  <Input
                    value={variant.customerNote || ""}
                    onChange={(e) =>
                      updateVariant(
                        variantIndex,
                        "customerNote",
                        e.target.value
                      )
                    }
                    placeholder={texts.specialNoteForCustomers}
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                      {texts.features}
                    </label>
                    <Button
                      onClick={() => addFeature(variantIndex)}
                      variant="outline"
                      size="sm"
                    >
                      {texts.addFeature}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(variant.features || []).map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={feature.included || false}
                          onChange={(e) =>
                            updateFeature(
                              variantIndex,
                              featureIndex,
                              "included",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                        />
                        <Input
                          value={feature.text || ""}
                          onChange={(e) =>
                            updateFeature(
                              variantIndex,
                              featureIndex,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder={texts.featureDescription}
                          className="flex-1"
                        />
                        {(variant.features || []).length > 1 && (
                          <Button
                            onClick={() =>
                              removeFeature(variantIndex, featureIndex)
                            }
                            variant="danger"
                            size="sm"
                          >
                            {texts.remove}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            fullWidth
          >
            {loading
              ? texts.saving
              : isEditing
              ? texts.updateProduct
              : texts.createProduct}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManageProduct;
