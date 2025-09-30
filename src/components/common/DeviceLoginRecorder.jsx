"use client";
import { useAuth } from "@/contexts/AuthContext";
import { parseUserAgent } from "@/lib/deviceInfo";
import { useEffect, useRef } from "react";

export default function DeviceLoginRecorder() {
  const { user, getAuthToken, isAuthenticated } = useAuth();
  const hasRecorded = useRef(false);
  const isRecording = useRef(false);

  useEffect(() => {
    const recordDeviceLogin = async () => {
      // Only record once per session and avoid concurrent recordings
      if (
        hasRecorded.current ||
        !isAuthenticated ||
        !user ||
        isRecording.current
      )
        return;

      try {
        isRecording.current = true;

        // Wait a bit for token to be available
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const token = getAuthToken();
        if (!token) {
          console.log("No auth token available for device login recording");
          return;
        }

        // Get device info using the parseUserAgent function
        const userAgent = navigator.userAgent;
        const deviceInfo = {
          userAgent,
          ...parseUserAgent(userAgent),
        };

        const sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        console.log("Recording device login for user:", user.email);

        const response = await fetch("/api/device-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deviceInfo,
            sessionId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Device login recorded successfully:", result);
          hasRecorded.current = true;
        } else {
          const errorData = await response.json();
          console.error("Failed to record device login:", errorData);
        }
      } catch (error) {
        console.error("Device login recording error:", error);
      } finally {
        isRecording.current = false;
      }
    };

    recordDeviceLogin();
  }, [user, isAuthenticated, getAuthToken]);

  return null; // This component doesn't render anything
}
