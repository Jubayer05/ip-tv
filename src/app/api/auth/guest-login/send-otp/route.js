import { createTransporter, getSmtpUser } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in localStorage equivalent (using a simple in-memory store)
    // In production, you might want to use Redis or database
    global.guestOtps = global.guestOtps || new Map();
    global.guestOtps.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send OTP email
    try {
      const smtpUser = await getSmtpUser();
      const transporter = await createTransporter();

      const mailOptions = {
        from: `"Cheap Stream" <${smtpUser}>`,
        to: email,
        subject: "Your Guest Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Guest Login Verification</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi there! 👋</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                You requested to view your order history as a guest. Use the verification code below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); 
                            color: white; 
                            padding: 20px 30px; 
                            border-radius: 15px; 
                            display: inline-block; 
                            font-weight: bold;
                            font-size: 32px;
                            letter-spacing: 5px;
                            font-family: monospace;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                This code will expire in <strong>10 minutes</strong> for security reasons.
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>Security Notice:</strong> If you didn't request this code, please ignore this email.
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="color: #999; font-size: 14px; margin: 0; text-align: center;">
                  Best regards,<br>
                  The Cheap Stream Team
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
