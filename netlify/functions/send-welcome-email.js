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
    const { email, name, age, referralSource } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: "Email is required." }),
      };
    }

    const userDisplayName = (name || "Friend").trim();
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
      subject: `✨ Welcome to My Network, ${userDisplayName}!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 36px 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to My Network! 🎉</h1>
            <p style="margin: 0; font-size: 15px; color: #ccfbf1; line-height: 1.5;">Thank you for connecting with me, ${userDisplayName}!</p>
          </div>
          
          <div style="padding: 30px 28px; color: #334155; line-height: 1.6;">
            <p style="font-size: 16px; margin: 0 0 16px 0;">Hello <strong>${userDisplayName}</strong>,</p>
            <p style="font-size: 14.5px; margin: 0 0 16px 0; color: #475569;">
              I'm thrilled to have you connected with my professional network. Whether you are exploring my mobile apps, web applications, or collaborating on innovative projects, you'll always have direct access to my latest work, exclusive deals, and technical insights.
            </p>

            ${referralSource ? `
            <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 12px 16px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 13.5px; color: #475569;">
              <strong>Heard about me via:</strong> ${referralSource} ${age ? ` | <strong>Age:</strong> ${age}` : ''}
            </div>
            ` : ''}

            <div style="text-align: center; margin: 28px 0 20px 0;">
              <a href="https://rasedulkarim.com" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14.5px; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);">
                Explore Projects & Showcase
              </a>
            </div>

            <p style="font-size: 13.5px; color: #64748b; margin-top: 24px; text-align: center;">
              Have an idea or need assistance? Feel free to reply directly to this email!
            </p>
          </div>

          <div style="background: #f1f5f9; padding: 18px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Rasedul Karim. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Welcome email delivered successfully." }),
    };
  } catch (error) {
    console.error("Welcome Mail Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
