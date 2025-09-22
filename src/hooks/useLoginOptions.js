"use client";
import { useEffect, useState } from "react";

export const useLoginOptions = () => {
  const [loginOptions, setLoginOptions] = useState({
    google: false,
    facebook: false,
    twitter: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoginOptions = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.loginOptions) {
          setLoginOptions(data.data.loginOptions);
        }
      } catch (error) {
        console.error("Failed to fetch login options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginOptions();
  }, []);

  return { loginOptions, loading };
};
