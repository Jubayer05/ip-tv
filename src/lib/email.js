import nodemailer from "nodemailer";

// Create transporter (you'll need to add nodemailer to package.json)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendVerificationEmail(email, token, firstName) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Only include token in URL, no email or fullName
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    to: email,
    subject: "Verify Your Email - Cheap Stream",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to the future of streaming!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for creating your account with Cheap Stream. To complete your registration and start enjoying unlimited movies, shows, and live TV, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Or copy and paste this link into your browser:
          </p>
          
          <p style="background: #e9ecef; padding: 15px; border-radius: 8px; word-break: break-all; color: #495057; font-family: monospace; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This verification link will expire in 24 hours. If you didn't create an account with Cheap Stream, you can safely ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Cheap Stream Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email, firstName) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    to: email,
    subject: "Welcome to Cheap Stream! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Cheap Stream!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been successfully verified</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your email has been verified and your account is now active. You're all set to start streaming your favorite content.
          </p>
          
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">What's Next?</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Explore our content library</li>
              <li>Choose your subscription plan</li>
              <li>Start streaming instantly</li>
              <li>Invite friends and earn rewards</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, our support team is here to help!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Best regards,<br>
              The Cheap Stream Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

export async function sendOrderKeysEmail({ toEmail, fullName, order }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const keysList = (order.keys || [])
    .map(
      (k, i) => `
        <tr>
          <td style="padding:8px;border:1px solid #e9ecef;">${i + 1}</td>
          <td style="padding:8px;border:1px solid #e9ecef;">${k.key}</td>
          <td style="padding:8px;border:1px solid #e9ecef;">${new Date(
            k.expiresAt
          ).toLocaleDateString()}</td>
        </tr>`
    )
    .join("");

  const productLine = order.products?.[0] || {};
  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    to: toEmail,
    subject: `Your IPTV Access Keys - Order ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00b877 0%, #0aa86e 100%); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Cheap Stream</h1>
          <p style="margin: 8px 0 0 0;">Order ${order.orderNumber}</p>
        </div>

        <div style="padding: 24px; background: #ffffff;">
          <p style="color: #333;">Hi ${fullName || "there"},</p>
          <p style="color: #555; line-height: 1.6;">
            Thank you for your order. Below are your IPTV access key(s). Keep them secure.
          </p>

          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border:1px solid #e9ecef;">#</th>
                <th style="text-align:left;padding:8px;border:1px solid #e9ecef;">Key</th>
                <th style="text-align:left;padding:8px;border:1px solid #e9ecef;">Expires</th>
              </tr>
            </thead>
            <tbody>${keysList}</tbody>
          </table>

          <p style="color: #555; line-height: 1.6;">
            Devices Allowed: ${productLine.devicesAllowed || "-"}<br />
            Adult Channels: ${productLine.adultChannels ? "Yes" : "No"}<br />
            Duration: ${productLine.duration || 0} month(s)
          </p>

          <p style="color: #555;">
            Total Paid (pending): $${(order.totalAmount || 0).toFixed(2)}
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${baseUrl}/dashboard/orders"
               style="background: #00b877; color: white; padding: 12px 22px; text-decoration: none; border-radius: 24px; display: inline-block; font-weight: bold;">
              View Orders
            </a>
          </div>

          <p style="font-size: 12px; color: #999;">
            If you didn’t make this purchase, please contact support immediately.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
