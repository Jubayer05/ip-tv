import { checkVPN } from "@/lib/vpnDetection";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP address is required" },
        { status: 400 }
      );
    }

    const vpnResult = await checkVPN(ip);

    return NextResponse.json({
      success: true,
      data: vpnResult,
    });
  } catch (error) {
    console.error("VPN check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check VPN status" },
      { status: 500 }
    );
  }
}
