const nodemailer = require("nodemailer");

exports.handler = async (event) => {
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
        body: JSON.stringify({ success: false, message: "ইমেইল ও ওটিপি আবশ্যক।" }),
      };
    }

    const senderEmail = (process.env.GMAIL_USER || "rasedul.karim00@gmail.com").trim();
    // পাসওয়ার্ডের কোনো ফাঁকা স্পেস থাকলে তা স্বয়ংক্রিয়ভাবে ক্লিন হবে
    const rawPass = process.env.GMAIL_APP_PASS || "twhziydraulxyqos";
    const appPassword = rawPass.replace(/[\s\r\n]+/g, "");

    // পিওর গুগল এসএমটিপি কনফিগারেশন (পোর্ট ৪৬৫ - ডেডিকেটেড SSL)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
      pool: false, // একক কানেকশন নিশ্চিত করবে
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    const mailOptions = {
      from: `"Rasedul Karim" <${senderEmail}>`,
      to: email.trim(),
      subject: `🔐 ${otp} হলো আপনার সাবস্ক্রিপশন কোড`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #0d9488; text-align: center; margin: 0;">ইমেইল ভেরিফিকেশন কোড</h2>
          <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 6px;">সাবস্ক্রিপশন সম্পন্ন করতে নিচের ওটিপি কোডটি দিন:</p>
          <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 14px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f766e;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">কোডটি ৫ মিনিটের জন্য কার্যকর থাকবে।</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Sent Successfully:", info.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "ওটিপি সফলভাবে পাঠানো হয়েছে।" }),
    };
  } catch (error) {
    console.error("SMTP Error Details:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message || "ইমেইল পাঠানো সম্ভব হয়নি।" 
      }),
    };
  }
};
