import nodemailer from "nodemailer";

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method Not Allowed" }),
    };
  }

  try {
    const { email, otp } = JSON.parse(event.body || "{}");

    if (!email || !otp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: "Email and OTP are required." }),
      };
    }

    const senderEmail = (process.env.GMAIL_USER || "rasedul.karim00@gmail.com").trim();
    const appPassword = (process.env.GMAIL_APP_PASS || "twhziydraulxyqos").replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Rasedul Karim" <${senderEmail}>`,
      to: email.trim(),
      subject: `🔐 ${otp} is your verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #0d9488; text-align: center;">Subscription Verification</h2>
          <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 14px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f766e;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Valid for 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "OTP sent successfully." }),
    };
  } catch (error) {
    console.error("Mail Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
