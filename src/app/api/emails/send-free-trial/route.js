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

    const emailSent = await sendFreeTrialCredentialsEmail({
      toEmail,
      fullName,
      trialData,
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
