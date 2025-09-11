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

export async function send2FACodeEmail(email, code, firstName) {
  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    to: email,
    subject: "Your 2FA Verification Code - Cheap Stream",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Two-Factor Authentication</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You've requested to sign in to your Cheap Stream account. To complete the login process, please use the verification code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 8px;">${code}</span>
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This code will expire in 5 minutes. If you didn't request this code, please ignore this email and consider changing your password.
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
    console.error("2FA email sending failed:", error);
    return false;
  }
}

export async function sendBulkNotificationEmail(emails, subject, htmlContent) {
  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    bcc: emails, // Use BCC to send to multiple recipients
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important Update</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          ${htmlContent}
          
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
    console.error("Bulk email sending failed:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail({
  toEmail,
  fullName,
  order,
  paymentMethod = "Balance",
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const productLine = order.products?.[0] || {};
  const orderDate = new Date(
    order.createdAt || Date.now()
  ).toLocaleDateString();

  const mailOptions = {
    from: `"Cheap Stream" <${process.env.SMTP_USER || ""}>`,
    to: toEmail,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #00b877 0%, #0aa86e 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${
            fullName || "there"
          }!</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 25px;">
            Your order has been successfully confirmed and payment processed. You can now access your IPTV service.
          </p>

          <!-- Order Details Card -->
          <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Order Details</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <strong style="color: #555;">Order Number:</strong><br>
                <span style="color: #333;">${order.orderNumber}</span>
              </div>
              <div>
                <strong style="color: #555;">Order Date:</strong><br>
                <span style="color: #333;">${orderDate}</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <strong style="color: #555;">Service:</strong><br>
                <span style="color: #333;">IPTV Subscription</span>
              </div>
              <div>
                <strong style="color: #555;">Duration:</strong><br>
                <span style="color: #333;">${
                  productLine.duration || 1
                } month(s)</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <strong style="color: #555;">Devices Allowed:</strong><br>
                <span style="color: #333;">${
                  productLine.devicesAllowed || 1
                }</span>
              </div>
              <div>
                <strong style="color: #555;">Adult Channels:</strong><br>
                <span style="color: #333;">${
                  productLine.adultChannels ? "Yes" : "No"
                }</span>
              </div>
            </div>
            
            <div style="border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #333; font-size: 18px;">Total Paid:</strong>
                <span style="color: #00b877; font-size: 20px; font-weight: bold;">$${(
                  order.totalAmount || 0
                ).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <span style="color: #666;">Payment Method:</span>
                <span style="color: #333;">${paymentMethod}</span>
              </div>
            </div>
          </div>

          <!-- Access Information -->
          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">🎯 What's Next?</h3>
            <ul style="color: #155724; margin: 0; padding-left: 20px;">
              <li>Your IPTV access keys have been generated</li>
              <li>Check your dashboard for detailed setup instructions</li>
              <li>Download our recommended IPTV player app</li>
              <li>Start streaming your favorite content immediately</li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard" 
               style="background: linear-gradient(135deg, #00b877 0%, #0aa86e 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;
                      margin: 0 10px;">
              View Dashboard
            </a>
            <a href="${baseUrl}/dashboard/orders" 
               style="background: transparent; 
                      color: #00b877; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border: 2px solid #00b877; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;
                      margin: 0 10px;">
              View Orders
            </a>
          </div>

          <!-- Support Information -->
          <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin: 0 0 10px 0;">Need Help?</h3>
            <p style="color: #1565c0; margin: 0; line-height: 1.6;">
              If you have any questions or need assistance with your order, our support team is here to help!<br>
              Contact us at: <strong>info@iptvstore.com</strong>
            </p>
          </div>

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
    console.error("Order confirmation email sending failed:", error);
    return false;
  }
}
