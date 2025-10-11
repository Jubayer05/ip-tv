import nodemailer from "nodemailer";
import Settings from "../models/Settings";
import { connectToDatabase } from "./db";
import { getServerApiKeys, getServerSmtpUser } from "./serverApiKeys";

// Add this helper function at the top of the file after imports
const getCurrentYear = () => new Date().getFullYear();

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
export const getSmtpUser = async () => {
  return await getServerSmtpUser();
};

// Generic email sending function
export const sendGenericEmail = async ({ to, subject, html }) => {
  try {
    const smtpUser = await getSmtpUser();
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Cheap Stream" <${smtpUser}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Generic email sending failed:", error);
    return false;
  }
};

export async function sendVerificationEmail(email, token, firstName) {
  const baseUrl = "https://www.cheapstreamtv.com";
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
  const baseUrl = "https://www.cheapstreamtv.com";
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
  const baseUrl = "https://www.cheapstreamtv.com";
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
  const baseUrl = "https://www.cheapstreamtv.com";
  const smtpUser = await getSmtpUser();
  const productLine = order.products?.[0] || {};

  // Fetch email content directly from DB (avoid API fetch in mailer context)
  let emailContent = { content: "" };
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();
    emailContent = { content: settings?.emailContent?.content || "" };
  } catch (error) {
    console.error("Error loading email content from DB:", error);
  }

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

  // Generate connection info for M3U - Construct URL if not available
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
          // Try to extract M3U URL from lineInfo, or construct it
          let m3uUrl = "";
          let iptvUrl = "";

          if (cred.lineInfo) {
            const lines = cred.lineInfo.split("\n");
            m3uUrl = lines.find((line) => line.includes("m3u_plus")) || "";
            iptvUrl =
              lines
                .find((line) => line.includes("IPTV Url:"))
                ?.replace("IPTV Url:", "")
                .trim() || "";
          }

          // If M3U URL is not found in lineInfo, construct it
          if (!m3uUrl && cred.username && cred.password) {
            // Construct M3U URL based on common IPTV service patterns
            m3uUrl = `http://hfast.xyz/get.php?username=${cred.username}&password=${cred.password}&type=m3u_plus&output=ts`;
            iptvUrl = `http://hfast.xyz/get.php?username=${cred.username}&password=${cred.password}&type=m3u_plus&output=ts`;
          }

          return `
          <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #00b877;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Account #${
              m3uCredentials.indexOf(cred) + 1
            }</h4>
            <div style="margin-bottom: 10px;">
              <strong>M3U Playlist URL:</strong>
              <div style="background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 10px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 5px;">
                ${m3uUrl || "URL not available"}
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

  // Generate dynamic guides section
  const dynamicGuides = emailContent.content
    ? `
    <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0;">📚 Setup Guide</h3>
      <div style="color: #555; line-height: 1.6;">
        ${emailContent.content}
      </div>
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

          ${dynamicGuides}

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

export async function sendContactFormEmail({
  firstName,
  lastName,
  email,
  subject,
  description,
}) {
  const smtpUser = await getSmtpUser();

  const mailOptions = {
    from: `"Cheap Stream Contact Form" <${smtpUser}>`,
    to: smtpUser, // Send to the same SMTP user (admin email)
    subject: `New Contact Form Submission: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Cheap Stream</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Contact Form Details
            </h2>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #555; margin-bottom: 10px; font-size: 16px;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Subject:</td>
                  <td style="padding: 8px 0; color: #333;">${subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #555; margin-bottom: 10px; font-size: 16px;">Message</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap;">${description}</p>
              </div>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                This message was sent from the Cheap Stream contact form on ${new Date().toLocaleString()}.
              </p>
            </div>
          </div>
        </div>
        
        <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© ${getCurrentYear()} Cheap Stream. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = await createTransporter();
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending contact form email:", error);
    throw error;
  }
}

// Free Trial credentials email template
export async function sendFreeTrialCredentialsEmail({
  toEmail,
  fullName,
  trialData,
}) {
  try {
    const baseUrl = "https://www.cheapstreamtv.com";
    const smtpUser = await getSmtpUser();

    // Line type names
    const lineTypeNames = {
      0: "M3U Playlist",
      1: "MAG Device",
      2: "Enigma2",
    };

    // Extract connection information from lineInfo
    let m3uUrl = "";
    let iptvUrl = "";
    let connectionDetails = "";

    if (trialData.lineInfo) {
      const lines = trialData.lineInfo.split("\n");
      m3uUrl = lines.find((line) => line.includes("m3u_plus")) || "";
      iptvUrl =
        lines
          .find((line) => line.includes("IPTV Url:"))
          ?.replace("IPTV Url:", "")
          .trim() || "";

      // Format all connection details
      connectionDetails = lines
        .filter((line) => line.trim())
        .map(
          (line) =>
            `<div style="background: #f8f9fa; padding: 8px 12px; margin: 4px 0; border-radius: 4px; font-family: monospace; font-size: 13px; color: #495057;">${line}</div>`
        )
        .join("");
    }

    const expireDate = new Date(trialData.expire * 1000);
    const lineTypeName = lineTypeNames[trialData.lineType] || "M3U Playlist";

    const mailOptions = {
      from: `"Cheap Stream" <${smtpUser}>`,
      to: toEmail,
      subject: `🎉 Your Free Trial is Ready! - 24 Hours of Premium IPTV`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #fff;">
          <div style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Your Free Trial is Ready!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">24 Hours of Premium IPTV Access</p>
          </div>

          <div style="padding: 30px; background: #ffffff;">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hi ${
              fullName || "there"
            },</p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
              🚀 Congratulations! Your free trial is now active and ready to use. You have <strong>24 hours</strong> to experience our premium IPTV service completely free!
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">⏰ Trial Information</h3>
              <div style="color: #856404;">
                <p style="margin: 5px 0;"><strong>Duration:</strong> 24 hours</p>
                <p style="margin: 5px 0;"><strong>Expires:</strong> ${expireDate.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Device Type:</strong> ${lineTypeName}</p>
                <p style="margin: 5px 0;"><strong>Template:</strong> ${
                  trialData.templateName || `Template ${trialData.templateId}`
                }</p>
              </div>
            </div>

            <h3 style="color: #333; margin: 30px 0 20px 0; font-size: 20px;">🔐 Your Trial Credentials</h3>
            
            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin: 20px 0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #00b877;">
                  <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Username</h4>
                  <div style="font-family: monospace; font-size: 18px; font-weight: bold; color: #00b877; background: #f8f9fa; padding: 8px; border-radius: 4px; text-align: center;">
                    ${trialData.username}
                  </div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #44dcf3;">
                  <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Password</h4>
                  <div style="font-family: monospace; font-size: 18px; font-weight: bold; color: #44dcf3; background: #f8f9fa; padding: 8px; border-radius: 4px; text-align: center;">
                    ${trialData.password}
                  </div>
                </div>
              </div>

              ${
                trialData.lineId
                  ? `
              <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 15px;">
                <h4 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">Line ID</h4>
                <div style="font-family: monospace; font-size: 16px; font-weight: bold; color: #856404; background: #fff3cd; padding: 8px; border-radius: 4px; text-align: center;">
                  ${trialData.lineId}
                </div>
              </div>
              `
                  : ""
              }
            </div>

            ${
              m3uUrl
                ? `
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #0c5460; margin: 0 0 15px 0;">📱 M3U Playlist URL</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ccc;">
                <div style="font-family: monospace; font-size: 13px; word-break: break-all; color: #333; line-height: 1.4;">
                  ${m3uUrl}
                </div>
              </div>
            </div>
            `
                : ""
            }

            ${
              iptvUrl
                ? `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #0c5460; margin: 0 0 15px 0;">🌐 IPTV Server URL</h3>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #ccc;">
                <div style="font-family: monospace; font-size: 13px; word-break: break-all; color: #333; line-height: 1.4;">
                  ${iptvUrl}
                </div>
              </div>
            </div>
            `
                : ""
            }

            ${
              connectionDetails
                ? `
            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">📋 Complete Connection Details</h3>
              <div style="max-height: 300px; overflow-y: auto;">
                ${connectionDetails}
              </div>
            </div>
            `
                : ""
            }

            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #155724; margin: 0 0 15px 0;">🎯 What's Next?</h3>
              <div style="color: #155724;">
                <p style="margin: 8px 0;">• Use these credentials in your preferred IPTV player</p>
                <p style="margin: 8px 0;">• Enjoy 24 hours of premium content access</p>
                <p style="margin: 8px 0;">• Explore our channel lineup and features</p>
                <p style="margin: 8px 0;">• Upgrade to a full subscription when you're ready</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/packages" 
                 style="background: linear-gradient(135deg, #00b877 0%, #44dcf3 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;
                        margin-right: 15px;">
                🚀 Upgrade to Premium
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

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Important Reminders</h3>
              <div style="color: #856404; font-size: 14px;">
                <p style="margin: 5px 0;">• Keep your credentials secure and don't share them</p>
                <p style="margin: 5px 0;">• Your trial expires in exactly 24 hours</p>
                <p style="margin: 5px 0;">• No credit card required for this trial</p>
                <p style="margin: 5px 0;">• Contact support if you need any assistance</p>
              </div>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center;">
              <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                Enjoy your free trial! We hope you love our service.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                This email contains sensitive information. Please keep it secure.<br>
                If you didn't request this trial, please contact our support team immediately.
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
              <p style="color: #666; font-size: 16px; margin: 0;">
                Thank you for trying <strong style="color: #00b877;">Cheap Stream</strong>!<br>
                <span style="color: #999; font-size: 14px;">Happy Streaming! 🎬📺</span>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const transporter = await createTransporter();

    const result = await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("❌ Free trial credentials email sending failed:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    });
    return false;
  }
}
