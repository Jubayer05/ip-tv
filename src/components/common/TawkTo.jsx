"use client";
import { useEffect, useState } from "react";

export default function TawkTo() {
  const [tawkToEnabled, setTawkToEnabled] = useState(false);

  useEffect(() => {
    const checkTawkToSetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setTawkToEnabled(data.data.addons.tawkTo);
        }
      } catch (error) {
        console.error("Failed to check Tawk.to setting:", error);
      }
    };

    checkTawkToSetting();
  }, []);

  useEffect(() => {
    if (!tawkToEnabled) return;

    // Tawk.to live chat widget (using your exact code format)
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68aef16506c0ee195af39a57/1j3llttoi';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    s0.parentNode.insertBefore(s1, s0);

  }, [tawkToEnabled]);

  return null;
}
