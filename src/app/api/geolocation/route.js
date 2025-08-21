import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use a free IP geolocation service
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    return NextResponse.json({
      success: true,
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return NextResponse.json({
      success: false,
      country: "United States", // Fallback
      countryCode: "US",
    });
  }
}
