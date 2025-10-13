"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useState } from "react";

export default function IPTVAccountCreator() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    val: 2, // Package ID (2, 3, 4, or 5)
    con: 1, // Device count (1-3)
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "val" || name === "con" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/iptv/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Create IPTV Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Order Number
          </label>
          <Input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            placeholder="Enter order number"
            required
          />
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Package ID (val)
          </label>
          <select
            name="val"
            value={formData.val}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value={2}>1 Month Subscription</option>
            <option value={3}>3 Month Subscription</option>
            <option value={4}>6 Month Subscription</option>
            <option value={5}>12 Month Subscription</option>
          </select>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Device Count (con)
          </label>
          <select
            name="con"
            value={formData.con}
            onChange={handleChange}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value={1}>1 Device</option>
            <option value={2}>2 Devices</option>
            <option value={3}>3 Devices</option>
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      {result && (
        <div
          className={`mt-4 p-4 rounded ${
            result.success
              ? "bg-green-900 text-green-200"
              : "bg-red-900 text-red-200"
          }`}
        >
          {result.success ? (
            <div>
              <h3 className="font-bold">Success!</h3>
              <p>Account created successfully</p>
              {result.data.credentials && (
                <div className="mt-2">
                  <h4 className="font-semibold">Credentials:</h4>
                  {result.data.credentials.map((cred, index) => (
                    <div key={index} className="text-sm">
                      <p>Username: {cred.username}</p>
                      <p>Password: {cred.password}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-bold">Error:</h3>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
