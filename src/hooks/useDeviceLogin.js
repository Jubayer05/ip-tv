import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";

export const useDeviceLogin = () => {
  const { getAuthToken, isAuthenticated } = useAuth();
  const [deviceLogins, setDeviceLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recordDeviceLogin = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return;
      }

      const userAgent = navigator.userAgent;
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const response = await fetch("/api/device-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userAgent,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record device login");
      }

      const result = await response.json();

      // Don't refresh here - let the component handle it
      return result;
    } catch (error) {
      console.error("Device login recording error:", error);
    }
  };

  const fetchDeviceLogins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        return;
      }


      const response = await fetch("/api/device-login?limit=15", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch device logins");
      }

      const data = await response.json();
      setDeviceLogins(data.data || []);
    } catch (error) {
      console.error("Fetch device logins error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  const suspendDevice = async (deviceLoginId) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`/api/device-login/${deviceLoginId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to suspend device");
      }

      // Refresh the list
      await fetchDeviceLogins();
      return await response.json();
    } catch (error) {
      console.error("Suspend device error:", error);
      throw error;
    }
  };

  // Fetch device logins when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDeviceLogins();
    }
  }, [isAuthenticated, fetchDeviceLogins]);

  return {
    deviceLogins,
    loading,
    error,
    recordDeviceLogin,
    fetchDeviceLogins,
    suspendDevice,
  };
};
