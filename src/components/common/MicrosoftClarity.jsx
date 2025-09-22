"use client";
import { useEffect, useState } from "react";

export default function MicrosoftClarity() {
  const [clarityEnabled, setClarityEnabled] = useState(false);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    const checkClaritySetting = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.addons) {
          setClarityEnabled(data.data.addons.microsoftClarity);
          if (data.data.apiKeys?.microsoftClarity?.projectId) {
            setProjectId(data.data.apiKeys.microsoftClarity.projectId);
          }
        }
      } catch (error) {
        console.error("Failed to check Microsoft Clarity setting:", error);
      }
    };

    checkClaritySetting();
  }, []);

  useEffect(() => {
    if (!clarityEnabled || !projectId) return;

    // Microsoft Clarity tracking code
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);
  }, [clarityEnabled, projectId]);

  return null;
}
