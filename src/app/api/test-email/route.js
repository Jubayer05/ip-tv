import { sendGenericEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { toEmail } = await request.json();

    if (!toEmail) {
      return Response.json(
        { success: false, error: "Email address required" },
        { status: 400 }
      );
    }


    const testEmailSent = await sendGenericEmail({
      to: toEmail,
      subject: "Test Email - Cheap Stream",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00b877;">Test Email</h1>
          <p>This is a test email to verify SMTP configuration.</p>
          <p>If you receive this, the email system is working correctly!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    if (testEmailSent) {
      return Response.json({
        success: true,
        message: "Test email sent successfully",
      });
    } else {
      return Response.json({
        success: false,
        error: "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("❌ Test email error:", error);
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
