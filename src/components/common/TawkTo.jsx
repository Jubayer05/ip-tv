"use client";
import { useEffect, useState } from "react";

export default function TawkTo() {
  const [tawkToEnabled, setTawkToEnabled] = useState(false);
  const [propertyId, setPropertyId] = useState("");

  useEffect(() => {
    const checkTawkToSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setTawkToEnabled(data.data.addons.tawkTo);
          if (data.data.apiKeys?.tawkTo?.propertyId) {
            setPropertyId(data.data.apiKeys.tawkTo.propertyId);
          }
        }
      } catch (error) {
        console.error("Failed to check Tawk.to setting:", error);
      }
    };

    checkTawkToSetting();
  }, []);

  useEffect(() => {
    if (!tawkToEnabled || !propertyId) return;

    // Tawk.to live chat widget
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    s0.parentNode.insertBefore(s1, s0);

  }, [tawkToEnabled, propertyId]);

  return null;
}
