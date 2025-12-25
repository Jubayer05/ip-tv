import { connectToDatabase } from "@/lib/db";
import { getClientIP, parseUserAgent } from "@/lib/deviceInfo";
import { getCountryFromIP } from "@/lib/geolocation";
import UrlClickTracking from "@/models/UrlClickTracking";
import UrlTracking from "@/models/UrlTracking";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { visitorId, deviceInfo: clientDeviceInfo, url } = body;

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Visitor ID is required" },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Find URL tracking by URL
    const urlTracking = await UrlTracking.findOne({
      url,
      isActive: true,
    });

    if (!urlTracking) {
      return NextResponse.json(
        { success: false, error: "URL tracking not found or inactive" },
        { status: 404 }
      );
    }

    // Get client IP
    const ip = getClientIP(request);

    // Get country information using MaxMind GeoLite2
    const location = getCountryFromIP(ip);

    // Parse device info from user agent
    const userAgent = request.headers.get("user-agent") || "";
    const parsedDevice = parseUserAgent(userAgent);

    // Determine platform (Mobile/Tablet/Desktop)
    let platform = "Desktop";
    if (parsedDevice.device === "Mobile") {
      platform = "Mobile";
    } else if (parsedDevice.device === "Tablet") {
      platform = "Tablet";
    }

    // Prepare device info
    const deviceInfo = {
      platform,
      deviceType: parsedDevice.device,
      browser: parsedDevice.browser,
      os: parsedDevice.os,
      userAgent,
      screenResolution: clientDeviceInfo?.screenResolution || "Unknown",
    };

    // Use findOneAndUpdate with upsert to atomically handle create/update
    const now = new Date();
    const clickTracking = await UrlClickTracking.findOneAndUpdate(
      {
        urlTrackingId: urlTracking._id,
        visitorId,
      },
      {
        $set: {
          deviceInfo,
          location,
          lastClickAt: now,
        },
        $inc: {
          clickCount: 1,
        },
        $setOnInsert: {
          firstClickAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Check if this was a new visitor (clickCount === 1 means it was just created)
    const isNewVisitor = clickTracking.clickCount === 1;

    // Update URL tracking stats
    if (isNewVisitor) {
      urlTracking.uniqueClickCount += 1;
    }
    // Increment total click count
    urlTracking.clickCount += 1;
    urlTracking.lastAccessed = now;
    await urlTracking.save();

    // Determine redirect URL based on pageType
    const redirectUrl =
      urlTracking.pageType === "existing"
        ? urlTracking.url // Return the actual page URL for existing pages
        : "https://www.cheapstreamtv.com"; // Redirect to homepage for non-existing pages

    return NextResponse.json({
      success: true,
      data: {
        redirectUrl,
        pageType: urlTracking.pageType,
        shouldRedirect: urlTracking.pageType !== "existing",
        clickCount: clickTracking.clickCount,
        isNewVisitor,
      },
    });
  } catch (error) {
    console.error("Error tracking URL click:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track click" },
      { status: 500 }
    );
  }
}
