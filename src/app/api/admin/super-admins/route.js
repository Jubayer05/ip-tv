import { getSuperAdminEmails } from "@/lib/superAdmin";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Only allow authenticated admin requests
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const emails = getSuperAdminEmails();
    return NextResponse.json({
      success: true,
      emails: emails,
    });
  } catch (error) {
    console.error("Error fetching super admin emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch super admin emails" },
      { status: 500 }
    );
  }
}
