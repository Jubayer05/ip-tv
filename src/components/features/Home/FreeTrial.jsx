"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock,
  Crown,
  Flag,
  Globe,
  Mountain,
  Palmtree,
  Play,
  Shield,
  Star,
  Sun,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FreeTrialCard = () => {
  const { user, getAuthToken } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(5);
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

  // Template options
  const templates = [
    {
      id: 1,
      name: "Bouquet Sorting in Americas",
      region: "Americas",
      icon: <Building2 className="w-8 h-8 text-blue-500" />,
      color: "blue",
    },
    {
      id: 2,
      name: "Bouquet Sorting in Europe",
      region: "Europe",
      icon: <Flag className="w-8 h-8 text-green-500" />,
      color: "green",
    },
    {
      id: 3,
      name: "Bouquet Sorting in Middle East",
      region: "Middle East",
      icon: <Sun className="w-8 h-8 text-yellow-500" />,
      color: "yellow",
    },
    {
      id: 4,
      name: "Bouquet Sorting in Spain",
      region: "Spain",
      icon: <Palmtree className="w-8 h-8 text-orange-500" />,
      color: "orange",
    },
    {
      id: 5,
      name: "Channels of Arab Countries",
      region: "Arab Countries",
      icon: <Mountain className="w-8 h-8 text-red-500" />,
      color: "red",
    },
    {
      id: 6,
      name: "Channels of Spain",
      region: "Spain",
      icon: <Palmtree className="w-8 h-8 text-orange-500" />,
      color: "orange",
    },
    {
      id: 7,
      name: "Channels of Americas",
      region: "Americas",
      icon: <Building2 className="w-8 h-8 text-blue-500" />,
      color: "blue",
    },
    {
      id: 8,
      name: "Channels of Europe",
      region: "Europe",
      icon: <Flag className="w-8 h-8 text-green-500" />,
      color: "green",
    },
  ];

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

      // Get the IPTV API key from environment variables
      const iptvApiKey = process.env.NEXT_PUBLIC_IPTV_API_KEY;

      if (!iptvApiKey) {
        setError("IPTV service configuration error. Please contact support.");
        return;
      }

      const response = await fetch("/api/iptv/free-trial-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: iptvApiKey, // Use the actual API key
          templateId: selectedTemplate,
          lineType: selectedLineType,
          mac: selectedLineType > 0 ? macAddress : undefined,
          visitorId, // <-- NEW
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
              Start Your Free Trial
            </h1>
          </div>
          <p className="text-black/80 text-xl font-medium">
            Experience premium IPTV content for 24 hours - completely free!
          </p>
        </div>

        {/* Features */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <Clock className="w-12 h-12 text-[#00b877] mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">
                24 Hours Free
              </h3>
              <p className="text-gray-400 text-sm">
                Full access to all channels and features
              </p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-[#44dcf3] mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-400 text-sm">
                HD and 4K content with no buffering
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-[#00b877] mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">
                No Commitment
              </h3>
              <p className="text-gray-400 text-sm">
                Cancel anytime, no hidden fees
              </p>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h3 className="text-white font-semibold text-xl mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-[#44dcf3]" />
              Select Your Region & Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? "border-[#00b877] bg-[#00b877]/10"
                      : "border-[#FFFFFF26] hover:border-[#44dcf3]/50"
                  }`}
                  onClick={() => handleTemplateChange(template.id)}
                >
                  <div className="flex justify-center mb-2">
                    {template.icon}
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    {template.region}
                  </h4>
                  <p className="text-gray-400 text-xs leading-tight">
                    {template.name}
                  </p>
                </div>
              ))}
            </div>
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
              What's Included in Your Free Trial?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Access to all channels in your selected template
                </span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  HD and 4K quality streaming
                </span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">24/7 customer support</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialCard;
