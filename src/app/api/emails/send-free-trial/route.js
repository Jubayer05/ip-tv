import { sendFreeTrialCredentialsEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { toEmail, fullName, trialData } = await request.json();

    if (!toEmail || !trialData) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedTrial = {
      type: trialData.type,
      id: trialData.id,
      username: trialData.username,
      password: trialData.password,
      macAddress: trialData.mac_address,
      packageName: trialData.package?.name ?? "—",
      templateName: trialData.template?.name ?? "—",
      maxConnections: trialData.max_connections ?? "—",
      forcedCountry: trialData.forced_country ?? "—",
      adult: trialData.adult ? "Yes" : "No",
      note: trialData.note ?? "",
      paid: trialData.paid ? "Yes" : "No",
      expiringAt:
        trialData.expiring_at && !Number.isNaN(new Date(trialData.expiring_at))
          ? trialData.expiring_at
          : new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      dnsLink: trialData.dns_link ?? "",
      samsungLgDns: trialData.dns_link_for_samsung_lg ?? "",
      portalLink: trialData.portal_link ?? "",
    };

    const emailSent = await sendFreeTrialCredentialsEmail({
      toEmail,
      fullName,
      trialData: normalizedTrial,
    });

    if (emailSent) {
      return Response.json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      return Response.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in send-free-trial API:", error);
    console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
