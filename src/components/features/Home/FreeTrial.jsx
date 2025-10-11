"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  WifiOff,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const FreeTrialCard = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(1271);
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

  const [originalFreeTrialContent, setOriginalFreeTrialContent] =
    useState(null);

  // Translate freeTrialContent when language changes
  useEffect(() => {
    if (!originalFreeTrialContent) return;

    let isMounted = true;
    (async () => {
      try {
        const textsToTranslate = [
          originalFreeTrialContent.title,
          originalFreeTrialContent.description,
          ...(originalFreeTrialContent.features || []).map((f) => f.title),
          ...(originalFreeTrialContent.features || []).map(
            (f) => f.description
          ),
          originalFreeTrialContent.includedTitle,
          ...(originalFreeTrialContent.includedItems || []),
        ];

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        const titleIndex = 0;
        const descriptionIndex = 1;
        const featuresStartIndex = 2;
        const featuresCount = originalFreeTrialContent.features?.length || 0;
        const includedTitleIndex = featuresStartIndex + featuresCount * 2;
        const includedItemsStartIndex = includedTitleIndex + 1;

        const translatedFreeTrialContent = {
          title: translated[titleIndex],
          description: translated[descriptionIndex],
          features: (originalFreeTrialContent.features || []).map(
            (feature, index) => ({
              ...feature,
              title: translated[featuresStartIndex + index * 2],
              description: translated[featuresStartIndex + index * 2 + 1],
            })
          ),
          includedTitle: translated[includedTitleIndex],
          includedItems: translated.slice(includedItemsStartIndex),
        };

        setFreeTrialContent(translatedFreeTrialContent);
      } catch (error) {
        console.error("Error translating freeTrialContent:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [translate, originalFreeTrialContent]);

  // Fetch free trial content - SINGLE useEffect (removed duplicate)
  useEffect(() => {
    const fetchFreeTrialContent = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        if (data.success && data.data.freeTrialContent) {
          setOriginalFreeTrialContent(data.data.freeTrialContent);
        } else {
          setOriginalFreeTrialContent({
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
        }
      } catch (error) {
        console.error("Failed to fetch free trial content:", error);
        setOriginalFreeTrialContent({
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
      }
    };

    fetchFreeTrialContent();
  }, []);

  const hasUsedFreeTrial = useMemo(() => {
    return user?.freeTrial?.hasUsed || visitorEligible === false;
  }, [user?.freeTrial?.hasUsed, visitorEligible]);

  const isVpnBlocked = vpnStatus?.isVPN === true;

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

  useEffect(() => {
    if (!visitorId) return;

    let isMounted = true;

    (async () => {
      try {
        const res = await fetch("/api/visitors/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, userEmail: user?.email }),
        });
        const json = await res.json();

        if (!isMounted) return;

        if (json.success) {
          setVisitorEligible(json.eligible);

          if (!json.eligible && user?.email) {
            window.location.reload();
          }
        } else {
          setVisitorEligible(false);
        }
      } catch (e) {
        console.error("Visitor check error:", e);
        if (isMounted) {
          setVisitorEligible(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [visitorId]);

  useEffect(() => {
    if (!user || visitorEligible === false || hasUsedFreeTrial) return;

    const checkVpnStatus = async () => {
      setVpnChecking(true);
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        if (!ipResponse.ok) {
          throw new Error("Failed to get IP address");
        }
        const { ip } = await ipResponse.json();

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
        setVpnStatus({ isVPN: false, status: "error", error: error.message });
      } finally {
        setVpnChecking(false);
      }
    };

    checkVpnStatus();
  }, [user, visitorEligible, hasUsedFreeTrial]);

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

    if (!hasUsedFreeTrial && isVpnBlocked) {
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
          key: iptvApiKey,
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

        try {
          const emailResponse = await fetch("/api/emails/send-free-trial", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              toEmail: user.email,
              fullName:
                user.profile?.firstName || user.profile?.username || "User",
              trialData: data.data,
            }),
          });

          const emailResult = await emailResponse.json();

          if (emailResponse.ok && emailResult.success) {
          } else {
            console.error("❌ Failed to send free trial email:", emailResult);
          }
        } catch (emailError) {
          console.error("❌ Error sending free trial email:", emailError);
        }
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

  const handleLineTypeChange = (lineType) => {
    setSelectedLineType(lineType);
    if (lineType === 0) {
      setMacAddress("");
    }
  };

  const iconMap = {
    clock: Clock,
    star: Star,
    shield: Shield,
    play: Play,
    checkCircle: CheckCircle,
  };

  const ORIGINAL_TEXTS = {
    freeTrialCreatedSuccessfully: "Free Trial Created Successfully!",
    your24HourFreeTrialIsNowActive: "Your 24-hour free trial is now active",
    fullApiResponse: "Full API Response",
    trialDetails: "Trial Details",
    connectionInformation: "Connection Information",
    rawLineInformation: "Raw Line Information",
    startAnotherTrial: "Start Another Trial",
    checkingVpnStatus: "Checking VPN status...",
    vpnDetectionUnavailable:
      "VPN detection unavailable. Proceeding with caution.",
    vpnProxyTorDetected:
      "VPN/Proxy/Tor detected! Free trials are not available with VPN connections.",
    chooseYourDeviceType: "Choose Your Device Type",
    macAddress: "MAC Address",
    enterMacAddress: "Enter MAC address (e.g., 1A:2B:3C:4D:5E:6F)",
    requiredForDevices: "Required for",
    devices: "devices",
    start24HourFreeTrial: "Start 24-Hour Free Trial",
    creatingTrial: "Creating Trial...",
    youNeedToBeLoggedIn: "You need to be logged in to start a free trial",
    youHaveAlreadyUsed:
      "You have already used your free trial. Upgrade to premium for unlimited access!",
    pleaseDisableYourVpn:
      "Please disable your VPN, proxy, or Tor connection to continue with the free trial.",
    buyPackages: "Buy Packages",
    upgradeToPremium: "Upgrade to Premium",
  };

  const [translatedTexts, setTranslatedTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const textsToTranslate = Object.values(ORIGINAL_TEXTS);
      const translated = await translate(textsToTranslate);
      if (!isMounted) return;

      const newTranslatedTexts = {};
      Object.keys(ORIGINAL_TEXTS).forEach((key, index) => {
        newTranslatedTexts[key] = translated[index];
      });
      setTranslatedTexts(newTranslatedTexts);
    })();

    return () => {
      isMounted = false;
    };
  }, [translate]);

  if (success && trialData) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 font-secondary">
        <div className="bg-gradient-to-br from-[#0C171C] to-[#1a1a1a] border border-[#00b877]/30 rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-[#00b877] mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
              {translatedTexts.freeTrialCreatedSuccessfully}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
              {translatedTexts.your24HourFreeTrialIsNowActive}
            </p>
          </div>

          {/* Trial Details - Shows each field once */}
          <div className="bg-black/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              {translatedTexts.trialDetails}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                  Username:
                </span>
                <span className="text-white font-mono text-sm sm:text-base break-all">
                  {trialData.username}
                </span>
              </div>
              <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                  Password:
                </span>
                <span className="text-white font-mono text-sm sm:text-base break-all">
                  {trialData.password}
                </span>
              </div>
              <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                  Package:
                </span>
                <span className="text-white text-sm sm:text-base">
                  {trialData.packageName}
                </span>
              </div>
              <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                  Template:
                </span>
                <span className="text-white text-sm sm:text-base">
                  {trialData.templateName}
                </span>
              </div>
              <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                  Expires:
                </span>
                <span className="text-white text-sm sm:text-base">
                  {new Date(trialData.expire * 1000).toLocaleString()}
                </span>
              </div>
              {trialData.lineId && (
                <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                  <span className="text-gray-400 block mb-1 text-xs sm:text-sm">
                    Line ID:
                  </span>
                  <span className="text-white font-mono text-sm sm:text-base break-all">
                    {trialData.lineId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Connection Information - Shows M3U and IPTV URLs */}
          <div className="bg-black/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              {translatedTexts.connectionInformation}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {trialData.lineInfo &&
                trialData.lineInfo.includes("m3u_plus") && (
                  <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 font-medium">
                      M3U Playlist URL:
                    </p>
                    <p className="text-white font-mono text-xs sm:text-sm break-all bg-gray-900/50 p-2 rounded">
                      {trialData.lineInfo
                        .split("\n")
                        .find((line) => line.includes("m3u_plus"))}
                    </p>
                  </div>
                )}

              {trialData.lineInfo &&
                trialData.lineInfo.includes("IPTV Url:") && (
                  <div className="bg-black/50 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-400 text-xs sm:text-sm mb-2 font-medium">
                      IPTV URL:
                    </p>
                    <p className="text-white font-mono text-xs sm:text-sm break-all bg-gray-900/50 p-2 rounded">
                      {trialData.lineInfo
                        .split("\n")
                        .find((line) => line.includes("IPTV Url:"))
                        ?.replace("IPTV Url:", "")
                        .trim()}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Copy Button */}
          <div className="mb-4 sm:mb-6">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                const connectionDetails = `Username: ${
                  trialData.username
                }\nPassword: ${trialData.password}\nPackage: ${
                  trialData.packageName
                }\nTemplate: ${trialData.templateName}\nExpires: ${new Date(
                  trialData.expire * 1000
                ).toLocaleString()}\n\nConnection Details:\n${
                  trialData.lineInfo || "No connection details available"
                }`;
                navigator.clipboard.writeText(connectionDetails);
              }}
              className="mr-3 w-full sm:w-auto"
            >
              Copy All Details
            </Button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setSuccess(false);
              setTrialData(null);
            }}
            className="w-full sm:w-auto"
          >
            {translatedTexts.startAnotherTrial}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 font-secondary text-center mt-3 sm:mt-5">
      {!hasUsedFreeTrial && vpnChecking && (
        <div className="mb-3 sm:mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          <span className="text-blue-400 text-xs sm:text-sm">
            {translatedTexts.checkingVpnStatus}
          </span>
        </div>
      )}

      {!hasUsedFreeTrial && vpnStatus && vpnStatus.status === "error" && (
        <div className="mb-3 sm:mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-xs sm:text-sm">
            {translatedTexts.vpnDetectionUnavailable}
          </span>
        </div>
      )}

      {!hasUsedFreeTrial && vpnStatus && isVpnBlocked && (
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          <span className="text-red-400 text-xs sm:text-sm font-medium">
            {translatedTexts.vpnProxyTorDetected}
          </span>
        </div>
      )}

      <div className="bg-gradient-to-br from-[#0C171C] to-[#1a1a1a] border border-[#FFFFFF26] rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#00b877] to-[#44dcf3] p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
              {freeTrialContent.title}
            </h1>
          </div>
          <p className="text-black/80 text-base sm:text-lg lg:text-xl font-medium">
            {freeTrialContent.description}
          </p>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {freeTrialContent.features.map((feature) => {
              const IconComponent = iconMap[feature.icon] || Clock;
              return (
                <div key={feature.id} className="text-center">
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12 text-[#00b877] mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-white font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center justify-center sm:justify-start">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#44dcf3]" />
              {translatedTexts.chooseYourDeviceType}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {lineTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedLineType === type.id
                      ? "border-[#00b877] bg-[#00b877]/10"
                      : "border-[#FFFFFF26] hover:border-[#44dcf3]/50"
                  }`}
                  onClick={() => handleLineTypeChange(type.id)}
                >
                  <div className="text-xl sm:text-2xl mb-2">{type.icon}</div>
                  <h4 className="text-white font-medium text-sm sm:text-base mb-1">
                    {type.name}
                  </h4>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {selectedLineType > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                {translatedTexts.macAddress}
              </h3>
              <Input
                type="text"
                placeholder={translatedTexts.enterMacAddress}
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="max-w-md w-full"
              />
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                {`${translatedTexts.requiredForDevices} ${lineTypes[selectedLineType].name} ${translatedTexts.devices}`}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="text-red-400 text-xs sm:text-sm">{error}</span>
            </div>
          )}

          <div className="text-center">
            {hasUsedFreeTrial ? (
              <Link href="/packages">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  <div className="flex items-center justify-center">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {translatedTexts.upgradeToPremium}
                  </div>
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleStartTrial}
                disabled={
                  visitorEligible === null ||
                  loading ||
                  (!hasUsedFreeTrial && vpnChecking) ||
                  (!hasUsedFreeTrial && vpnStatus && isVpnBlocked) ||
                  (selectedLineType > 0 && !macAddress)
                }
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-black mr-2"></div>
                    {translatedTexts.creatingTrial}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {translatedTexts.start24HourFreeTrial}
                  </div>
                )}
              </Button>
            )}

            {!user && (
              <p className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">
                {translatedTexts.youNeedToBeLoggedIn}
              </p>
            )}

            {hasUsedFreeTrial && (
              <p className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">
                {translatedTexts.youHaveAlreadyUsed}
              </p>
            )}

            {!hasUsedFreeTrial && isVpnBlocked && (
              <p className="text-red-400 text-xs sm:text-sm mt-2 sm:mt-3">
                {translatedTexts.pleaseDisableYourVpn}
              </p>
            )}
          </div>

          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-black/30 rounded-xl">
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-3">
              {freeTrialContent.includedTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              {freeTrialContent.includedItems.map((item, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#00b877] mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link href="/packages">
            <Button
              variant="primary"
              size="md"
              className="mt-4 sm:mt-5 w-full sm:w-auto"
            >
              {translatedTexts.buyPackages}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialCard;
