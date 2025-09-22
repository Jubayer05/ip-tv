"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getIptvApiKey } from "@/lib/apiKeys";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Crown,
  Play,
  Shield,
  Star,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FreeTrialCard = () => {
  const { user, getAuthToken } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(2); // Europe template (ID 2)
  const [selectedLineType, setSelectedLineType] = useState(0);
  const [macAddress, setMacAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [trialData, setTrialData] = useState(null);
  const [visitorId, setVisitorId] = useState("");
  const [visitorEligible, setVisitorEligible] = useState(null);
  const [vpnStatus, setVpnStatus] = useState(null);
  const [vpnChecking, setVpnChecking] = useState(false);
  const [iptvApiKey, setIptvApiKey] = useState(null);
  const [freeTrialContent, setFreeTrialContent] = useState({
    title: "Start Your Free Trial",
    description:
      "Experience premium IPTV content for 24 hours - completely free!",
    features: [
      {
        id: 1,
        title: "24 Hours Free",
        description: "Full access to all channels and features",
        icon: "clock",
      },
      {
        id: 2,
        title: "Premium Quality",
        description: "HD and 4K content with no buffering",
        icon: "star",
      },
      {
        id: 3,
        title: "No Commitment",
        description: "Cancel anytime, no hidden fees",
        icon: "shield",
      },
    ],
    includedTitle: "What's Included in Your Free Trial?",
    includedItems: [
      "Access to all channels in your selected template",
      "HD and 4K quality streaming",
      "24/7 customer support",
      "No credit card required",
    ],
  });

  // Check if user has already used free trial
  const hasUsedFreeTrial =
    user?.freeTrial?.hasUsed || visitorEligible === false;

  // Check if VPN is detected and blocking
  const isVpnBlocked = vpnStatus?.isVPN === true;

  // Initialize FingerprintJS
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setVisitorId(result.visitorId);
      } catch (error) {
        console.error("FingerprintJS error:", error);
        setVisitorId("Unable to generate ID");
      }
    };

    initFingerprint();
  }, []);

  // After visitorId is set, check/register it
  useEffect(() => {
    if (!visitorId) return;

    let isMounted = true; // Prevent state updates if component unmounts

    (async () => {
      try {
        const res = await fetch("/api/visitors/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, userEmail: user?.email }),
        });
        const json = await res.json();

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (json.success) {
          setVisitorEligible(json.eligible);

          // If fraud detected, refresh user data to get updated freeTrial status
          if (!json.eligible && user?.email) {
            // Trigger a refresh of user data in AuthContext
            window.location.reload(); // Simple approach - you might want to implement a more elegant refresh
          }
        } else {
          // Set to false instead of true to prevent infinite loop
          // Only allow trial if we can't determine eligibility
          setVisitorEligible(false);
        }
      } catch (e) {
        console.error("Visitor check error:", e);
        // Set to false instead of true to prevent infinite loop
        // Only allow trial if we can't determine eligibility
        if (isMounted) {
          setVisitorEligible(false);
        }
      }
    })();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [visitorId]); // Remove user?.email dependency to prevent unnecessary re-runs

  // Check VPN status when user is logged in and visitor is eligible
  useEffect(() => {
    if (!user || visitorEligible === false) return;

    const checkVpnStatus = async () => {
      setVpnChecking(true);
      try {
        // Get user's IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (!ipResponse.ok) {
          throw new Error("Failed to get IP address");
        }
        const { ip } = await ipResponse.json();

        // Check VPN status
        const vpnResponse = await fetch("/api/vpn/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip }),
        });

        if (!vpnResponse.ok) {
          throw new Error("Failed to check VPN status");
        }

        const vpnData = await vpnResponse.json();
        if (vpnData.success) {
          setVpnStatus(vpnData.data);
        } else {
          throw new Error(vpnData.error || "VPN check failed");
        }
      } catch (error) {
        console.error("VPN check error:", error);
        // Default to allowing if we can't detect VPN status
        setVpnStatus({ isVPN: false, status: "error", error: error.message });
      } finally {
        setVpnChecking(false);
      }
    };

    checkVpnStatus();
  }, [user, visitorEligible]);

  // Load IPTV API key on component mount
  useEffect(() => {
    const loadIptvApiKey = async () => {
      try {
        const apiKey = await getIptvApiKey();
        setIptvApiKey(apiKey);
      } catch (error) {
        console.error("Failed to load IPTV API key:", error);
      }
    };

    loadIptvApiKey();
  }, []);

  // Line type options
  const lineTypes = [
    {
      id: 0,
      name: "M3U Playlist",
      description: "Compatible with most IPTV players",
      icon: "📱",
    },
    {
      id: 1,
      name: "MAG Device",
      description: "For MAG set-top boxes",
      icon: "📺",
    },
    {
      id: 2,
      name: "Enigma2",
      description: "For Enigma2 receivers",
      icon: "📡",
    },
  ];

  const handleStartTrial = async () => {
    if (!user) {
      setError("Please log in to start your free trial");
      return;
    }

    if (isVpnBlocked) {
      setError(
        "VPN, Proxy, or Tor connections are not allowed for free trials. Please disable your VPN and try again."
      );
      return;
    }

    if (!iptvApiKey) {
      setError("IPTV service configuration error. Please contact support.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Use user's email or username as the token
      const token = user.email || user.profile?.username;

      if (!token) {
        setError("User information not found. Please log in again.");
        return;
      }

      const response = await fetch("/api/iptv/free-trial-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: iptvApiKey, // Use the API key from database
          templateId: selectedTemplate,
          lineType: selectedLineType,
          mac: selectedLineType > 0 ? macAddress : undefined,
          visitorId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTrialData(data.data);
        setError("");
      } else {
        setError(data.error || "Failed to create free trial");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Free trial error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleLineTypeChange = (lineType) => {
    setSelectedLineType(lineType);
    if (lineType === 0) {
      setMacAddress(""); // Clear MAC address for M3U
    }
  };

  // Fetch free trial content
  useEffect(() => {
    const fetchFreeTrialContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success && data.data.freeTrialContent) {
          setFreeTrialContent(data.data.freeTrialContent);
        }
      } catch (error) {
        console.error("Failed to fetch free trial content:", error);
        // Keep default content if fetch fails
      }
    };

    fetchFreeTrialContent();
  }, []);

  // Icon mapping for dynamic features
  const iconMap = {
    clock: Clock,
    star: Star,
    shield: Shield,
    play: Play,
    checkCircle: CheckCircle,
  };

  if (success && trialData) {
    return (
      <div className="max-w-4xl mx-auto p-6 font-secondary">
        <div className="bg-gradient-to-br from-[#0C171C] to-[#1a1a1a] border border-[#00b877]/30 rounded-2xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-[#00b877] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Free Trial Created Successfully!
            </h2>
            <p className="text-gray-300 text-lg">
              Your 24-hour free trial is now active
            </p>
          </div>

          {/* Full JSON Response */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Full API Response
            </h3>
            <div className="bg-black/50 rounded-lg p-4 overflow-auto">
              <pre className="text-green-400 text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(trialData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Formatted Trial Details */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Trial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Username:</span>
                <span className="text-white ml-2 font-mono">
                  {trialData.username}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Password:</span>
                <span className="text-white ml-2 font-mono">
                  {trialData.password}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Package:</span>
                <span className="text-white ml-2">{trialData.packageName}</span>
              </div>
              <div>
                <span className="text-gray-400">Template:</span>
                <span className="text-white ml-2">
                  {trialData.templateName}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Expires:</span>
                <span className="text-white ml-2">
                  {new Date(trialData.expire * 1000).toLocaleString()}
                </span>
              </div>
              {trialData.lineId && (
                <div>
                  <span className="text-gray-400">Line ID:</span>
                  <span className="text-white ml-2 font-mono">
                    {trialData.lineId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Connection Information */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Connection Information
            </h3>
            <div className="space-y-3">
              <div className="bg-black/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">M3U Playlist URL:</p>
                <p className="text-white font-mono text-sm break-all">
                  {trialData.lineInfo
                    .split("\n")
                    .find((line) => line.includes("m3u_plus"))}
                </p>
              </div>
              <div className="bg-black/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">IPTV URL:</p>
                <p className="text-white font-mono text-sm break-all">
                  {trialData.lineInfo
                    .split("\n")
                    .find((line) => line.includes("IPTV Url:"))
                    ?.replace("IPTV Url:", "")
                    .trim()}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Line Info */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Raw Line Information
            </h3>
            <div className="bg-black/50 rounded-lg p-4">
              <pre className="text-yellow-400 text-sm whitespace-pre-wrap break-words">
                {trialData.lineInfo}
              </pre>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSuccess(false);
              setTrialData(null);
            }}
            className="w-full md:w-auto"
          >
            Start Another Trial
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-secondary text-center">
      {/* VPN Status Display */}
      {vpnChecking && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <span className="text-blue-400 text-sm">Checking VPN status...</span>
        </div>
      )}

      {vpnStatus && vpnStatus.status === "error" && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">
            VPN detection unavailable. Proceeding with caution.
          </span>
        </div>
      )}

      {vpnStatus && isVpnBlocked && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm font-medium">
            VPN/Proxy/Tor detected! Free trials are not available with VPN
            connections.
          </span>
        </div>
      )}

      {vpnStatus && !isVpnBlocked && vpnStatus.status !== "error" && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Connection verified ✓</span>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#0C171C] to-[#1a1a1a] border border-[#FFFFFF26] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00b877] to-[#44dcf3] p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Play className="w-8 h-8 mr-3" />
            <h1 className="text-4xl font-bold text-black">
              {freeTrialContent.title}
            </h1>
          </div>
          <p className="text-black/80 text-xl font-medium">
            {freeTrialContent.description}
          </p>
        </div>

        {/* Features */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {freeTrialContent.features.map((feature) => {
              const IconComponent = iconMap[feature.icon] || Clock;
              return (
                <div key={feature.id} className="text-center">
                  <IconComponent className="w-12 h-12 text-[#00b877] mx-auto mb-3" />
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Line Type Selection */}
          <div className="mb-8">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-[#44dcf3]" />
              Choose Your Device Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lineTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedLineType === type.id
                      ? "border-[#00b877] bg-[#00b877]/10"
                      : "border-[#FFFFFF26] hover:border-[#44dcf3]/50"
                  }`}
                  onClick={() => handleLineTypeChange(type.id)}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <h4 className="text-white font-medium text-base mb-1">
                    {type.name}
                  </h4>
                  <p className="text-gray-400 text-sm">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MAC Address Input (for MAG and Enigma2) */}
          {selectedLineType > 0 && (
            <div className="mb-8">
              <h3 className="text-white font-semibold text-lg mb-3">
                MAC Address
              </h3>
              <Input
                type="text"
                placeholder="Enter MAC address (e.g., 1A:2B:3C:4D:5E:6F)"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="max-w-md"
              />
              <p className="text-gray-400 text-sm mt-2">
                Required for {lineTypes[selectedLineType].name} devices
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Start Trial Button */}
          <div className="text-center">
            {hasUsedFreeTrial ? (
              // Show upgrade button if user has used free trial
              <Link href="/packages">
                <Button
                  variant="primary"
                  size="xl"
                  className="w-full md:w-auto"
                >
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </div>
                </Button>
              </Link>
            ) : (
              // Show start trial button if user hasn't used free trial
              <Button
                variant="primary"
                size="xl"
                onClick={handleStartTrial}
                disabled={
                  visitorEligible === null ||
                  loading ||
                  vpnChecking ||
                  (vpnStatus && isVpnBlocked) ||
                  (selectedLineType > 0 && !macAddress)
                }
                className="w-full md:w-auto"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Creating Trial...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Start 24-Hour Free Trial
                  </div>
                )}
              </Button>
            )}

            {!user && (
              <p className="text-gray-400 text-sm mt-3">
                You need to be logged in to start a free trial
              </p>
            )}

            {hasUsedFreeTrial && (
              <p className="text-gray-400 text-sm mt-3">
                You have already used your free trial. Upgrade to premium for
                unlimited access!
              </p>
            )}

            {isVpnBlocked && (
              <p className="text-red-400 text-sm mt-3">
                Please disable your VPN, proxy, or Tor connection to continue
                with the free trial.
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-black/30 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-3">
              {freeTrialContent.includedTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {freeTrialContent.includedItems.map((item, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialCard;
