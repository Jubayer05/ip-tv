import nodemailer from "nodemailer";
import { getServerApiKeys, getServerSmtpUser } from "./serverApiKeys";

// Create transporter using database SMTP settings
export const createTransporter = async () => {
  const settings = await getServerApiKeys();

  if (!settings?.smtp) {
    throw new Error("SMTP configuration not found");
  }

  const { host, port, user, pass, secure } = settings.smtp;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration incomplete");
  }

  return nodemailer.createTransport({
    host: host,
    port: port || 587,
    secure: secure || false,
    auth: {
      user: user,
      pass: pass,
    },
  });
};

// Helper function to get SMTP user from database (server-side)
const getSmtpUser = async () => {
  return await getServerSmtpUser();
};

export async function sendVerificationEmail(email, token, firstName) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const smtpUser = await getSmtpUser();
  // Only include token in URL, no email or fullName
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
    to: email,
    subject: "Verify Your Email - Cheap Stream",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to the future of streaming!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for joining Cheap Stream! To complete your registration and start enjoying premium IPTV content, please verify your email address.
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
              Verify My Email
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <code style="color: #495057; word-break: break-all;">${verificationUrl}</code>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This verification link will expire in 24 hours. If you didn't create an account with Cheap Stream, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Verification email sending failed:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email, firstName) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const smtpUser = await getSmtpUser();

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
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
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Welcome email sending failed:", error);
    return false;
  }
}

export async function sendOrderKeysEmail({ toEmail, fullName, order }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const smtpUser = await getSmtpUser();

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
    from: `"Cheap Stream" <${smtpUser}>`,
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
            Devices Allowed: ${productLine.devicesAllowed || 1}<br />
            Adult Channels: ${productLine.adultChannels ? "Yes" : "No"}<br />
            Duration: ${productLine.duration || 0} month(s)
          </p>

          <p style="color: #555;">
            Total Paid: $${(order.totalAmount || 0).toFixed(2)}
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${baseUrl}/dashboard/orders"
               style="background: #00b877; color: white; padding: 12px 22px; text-decoration: none; border-radius: 24px; display: inline-block; font-weight: bold;">
              View Orders
            </a>
          </div>

          <p style="font-size: 12px; color: #999;">
            If you didn't make this purchase, please contact support immediately.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

// Enhanced IPTV credentials email template
export async function sendIPTVCredentialsEmail({ toEmail, fullName, order }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const smtpUser = await getSmtpUser();
  const productLine = order.products?.[0] || {};

  // Line type names
  const lineTypeNames = {
    0: "M3U Playlist",
    1: "MAG Device",
    2: "Enigma2",
  };

  // Generate credentials table with enhanced styling
  const credentialsList = (order.iptvCredentials || [])
    .map((cred, i) => {
      const lineTypeName = lineTypeNames[cred.lineType] || "Unknown";
      const deviceInfo =
        cred.lineType > 0
          ? `<br><small style="color: #666;">MAC: ${cred.macAddress}</small>`
          : `<br><small style="color: #666;">Devices: ${
              productLine.devicesAllowed || 1
            }</small>`;

      const adultStatus = cred.adultChannels
        ? '<span style="color: #ff6b35; font-weight: bold;">Adult Enabled</span>'
        : '<span style="color: #28a745; font-weight: bold;">Non Adult</span>';

      const expireDate = new Date(cred.expire * 1000);
      const isExpiringSoon =
        expireDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

      return `
        <tr style="border-bottom: 1px solid #e9ecef; background: ${
          i % 2 === 0 ? "#f8f9fa" : "#ffffff"
        };">
          <td style="padding: 15px 12px; border-right: 1px solid #e9ecef; vertical-align: top;">
            <div style="font-weight: bold; color: #333; margin-bottom: 5px;">
              ${lineTypeName} #${i + 1}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${cred.templateName || `Template ${cred.templateId}`}
            </div>
            ${deviceInfo}
          </td>
          <td style="padding: 15px 12px; border-right: 1px solid #e9ecef; font-family: 'Courier New', monospace; background: #fff3cd; font-weight: bold; font-size: 16px; color: #856404; text-align: center;">
            ${cred.username}
          </td>
          <td style="padding: 15px 12px; border-right: 1px solid #e9ecef; font-family: 'Courier New', monospace; background: #fff3cd; font-weight: bold; font-size: 16px; color: #856404; text-align: center;">
            ${cred.password}
          </td>
          <td style="padding: 15px 12px; border-right: 1px solid #e9ecef; text-align: center; vertical-align: middle;">
            ${adultStatus}
          </td>
          <td style="padding: 15px 12px; text-align: center; vertical-align: middle; color: ${
            isExpiringSoon ? "#dc3545" : "#28a745"
          }; font-weight: bold;">
            ${expireDate.toLocaleDateString()}
            ${
              isExpiringSoon
                ? '<br><small style="color: #dc3545;">⚠️ Expires Soon!</small>'
                : ""
            }
          </td>
        </tr>
      `;
    })
    .join("");

  // Generate connection info for M3U
  const m3uCredentials = order.iptvCredentials.filter(
    (cred) => cred.lineType === 0
  );
  const connectionInfo =
    m3uCredentials.length > 0
      ? `
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0;">📱 Connection Information</h3>
      ${m3uCredentials
        .map((cred) => {
          const lines = cred.lineInfo.split("\n");
          const m3uUrl = lines.find((line) => line.includes("m3u_plus")) || "";
          const iptvUrl =
            lines
              .find((line) => line.includes("IPTV Url:"))
              ?.replace("IPTV Url:", "")
              .trim() || "";

          return `
          <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #00b877;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Account #${
              m3uCredentials.indexOf(cred) + 1
            }</h4>
            <div style="margin-bottom: 10px;">
              <strong>Username:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${
                cred.username
              }</span>
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Password:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${
                cred.password
              }</span>
            </div>
            <div style="margin-bottom: 10px;">
              <strong>M3U Playlist URL:</strong>
              <div style="background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 5px;">
                ${m3uUrl}
              </div>
            </div>
            ${
              iptvUrl
                ? `
              <div>
                <strong>IPTV Server URL:</strong>
                <div style="background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 5px;">
                  ${iptvUrl}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `;
        })
        .join("")}
    </div>
  `
      : "";

  // Generate MAG/Enigma2 connection info
  const magCredentials = order.iptvCredentials.filter(
    (cred) => cred.lineType > 0
  );
  const magConnectionInfo =
    magCredentials.length > 0
      ? `
    <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #0c5460; margin: 0 0 15px 0;">📺 MAG/Enigma2 Configuration</h3>
      ${magCredentials
        .map((cred) => {
          const deviceType = lineTypeNames[cred.lineType];
          return `
          <div style="margin-bottom: 15px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #007bff;">
            <h4 style="margin: 0 0 10px 0; color: #333;">${deviceType} #${
            magCredentials.indexOf(cred) + 1
          }</h4>
            <div style="margin-bottom: 8px;">
              <strong>Username:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${
                cred.username
              }</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>Password:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${
                cred.password
              }</span>
            </div>
            <div style="margin-bottom: 8px;">
              <strong>MAC Address:</strong> <span style="font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${
                cred.macAddress
              }</span>
            </div>
            <div>
              <strong>Adult Channels:</strong> ${
                cred.adultChannels
                  ? '<span style="color: #ff6b35; font-weight: bold;">Enabled</span>'
                  : '<span style="color: #28a745; font-weight: bold;">Disabled</span>'
              }
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `
      : "";

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
    to: toEmail,
    subject: `🎉 Your IPTV Credentials Are Ready! - Order ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Your IPTV Access is Ready!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Order ${
            order.orderNumber
          }</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hi ${
            fullName || "there"
          },</p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
            🚀 Great news! Your IPTV subscription is now active and ready to use. Below are your login credentials and connection details.
          </p>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Important Security Notice</h3>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              Keep these credentials secure and do not share them with others. Each account is monitored for usage violations.
            </p>
          </div>

          <h3 style="color: #333; margin: 30px 0 20px 0; font-size: 20px;">🔐 Your IPTV Credentials</h3>
          
          <div style="overflow-x: auto; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); color: white;">
                  <th style="padding: 15px 12px; text-align: left; font-weight: bold;">Device Type</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: bold;">Username</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: bold;">Password</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: bold;">Adult Channels</th>
                  <th style="padding: 15px 12px; text-align: center; font-weight: bold;">Expires</th>
                </tr>
              </thead>
              <tbody>
                ${credentialsList}
              </tbody>
            </table>
          </div>

          ${connectionInfo}
          ${magConnectionInfo}

          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0c5460; margin: 0 0 15px 0;">📋 Order Summary</h3>
            <div style="color: #0c5460;">
              <p style="margin: 5px 0;"><strong>Subscription Duration:</strong> ${
                productLine.duration || 0
              } month(s)</p>
              <p style="margin: 5px 0;"><strong>Total Accounts:</strong> ${
                order.iptvCredentials?.length || 0
              }</p>
              <p style="margin: 5px 0;"><strong>Line Type:</strong> ${
                lineTypeNames[productLine.lineType] || "M3U Playlist"
              }</p>
              <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${(
                order.totalAmount || 0
              ).toFixed(2)}</p>
            </div>
          </div>

          <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">🎯 Quick Start Guide</h3>
            <ol style="color: #155724; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li><strong>Download an IPTV Player:</strong> We recommend VLC, IPTV Smarters, or TiviMate</li>
              <li><strong>Add Your Credentials:</strong> Use the username and password from the table above</li>
              ${
                m3uCredentials.length > 0
                  ? "<li><strong>M3U Users:</strong> Copy the M3U URL and paste it into your player</li>"
                  : ""
              }
              ${
                order.iptvCredentials.some((c) => c.lineType > 0)
                  ? "<li><strong>MAG/Enigma2 Users:</strong> Enter the server URL and your MAC address</li>"
                  : ""
              }
              <li><strong>Start Streaming:</strong> Enjoy thousands of channels and on-demand content!</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard/orders" 
               style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;
                      margin-right: 15px;">
              📊 View Order History
            </a>
            
            <a href="${baseUrl}/support/contact" 
               style="background: transparent; 
                      color: #00b877; 
                      border: 2px solid #00b877;
                      padding: 13px 28px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      font-size: 16px;">
              💬 Get Support
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Need help setting up your IPTV? Our support team is here to assist you 24/7.
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              This email contains sensitive information. Please keep it secure and do not forward it to others.<br>
              If you didn't make this purchase, please contact our support team immediately.
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 16px; margin: 0;">
              Thank you for choosing <strong style="color: #00b877;">Cheap Stream</strong>!<br>
              <span style="color: #999; font-size: 14px;">Happy Streaming! 🎬📺</span>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("IPTV credentials email sending failed:", error);
    return false;
  }
}

export async function send2FACodeEmail(email, code, firstName) {
  const smtpUser = await getSmtpUser();

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
    to: email,
    subject: "Your 2FA Code - Cheap Stream",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Two-Factor Authentication</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}! 🔐</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            You requested a two-factor authentication code for your account. Use the code below to complete your login:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 20px 30px; 
                        border-radius: 15px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 32px;
                        letter-spacing: 8px;
                        font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            This code will expire in <strong>10 minutes</strong> for security reasons.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and consider changing your password.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 14px; margin: 0; text-align: center;">
              Best regards,<br>
              The Cheap Stream Security Team
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("2FA email sending failed:", error);
    return false;
  }
}

export async function sendBulkNotificationEmail(emails, subject, htmlContent) {
  const smtpUser = await getSmtpUser();

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
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
    const transporter = await createTransporter();
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
  const smtpUser = await getSmtpUser();

  const productLine = order.products?.[0] || {};
  const orderDate = new Date(
    order.createdAt || Date.now()
  ).toLocaleDateString();

  const mailOptions = {
    from: `"Cheap Stream" <${smtpUser}>`,
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
    const transporter = await createTransporter();
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Order confirmation email sending failed:", error);
    return false;
  }
}
