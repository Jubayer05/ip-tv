import { sendGenericEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${fullName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your account has been created successfully. Below are your login credentials:
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Important Security Notice</h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Keep these credentials secure and do not share them with others. We recommend changing your password after your first login.
            </p>
          </div>

          <h3 style="color: #333; margin: 30px 0 20px 0; font-size: 20px;">🔐 Your Login Credentials</h3>
          
          <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #00b877;">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Email</h4>
                <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #00b877; background: white; padding: 8px; border-radius: 4px; text-align: center; word-break: break-all;">
                  ${email}
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #44dcf3;">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Password</h4>
                <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #44dcf3; background: white; padding: 8px; border-radius: 4px; text-align: center;">
                  ${password}
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.cheapstreamtv.com/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;">
              Login to Your Account
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 14px;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
          
          <p style="color: #999; line-height: 1.6; margin-top: 30px; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 20px;">
            Best regards,<br/>
            <strong>The Cheap Stream Team</strong>
          </p>
        </div>
        
        <div style="background: #212121; padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Cheap Stream. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailSent = await sendGenericEmail({
      to: email,
      subject: "Your Account Credentials - Cheap Stream",
      html: emailHtml,
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: "Credentials email sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send credentials email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending credentials email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
