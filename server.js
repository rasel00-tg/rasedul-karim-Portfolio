import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Google SMTP ট্রান্সপোর্টার কনফিগারেশন (পোর্ট ৪৬৫ - ডেডিকেটেড SSL, নো MX লুকআপ)
const senderEmail = (process.env.GMAIL_USER || 'rasedul.karim00@gmail.com').trim();
const rawPass = process.env.GMAIL_APP_PASS || 'twhziydraulxyqos';
const appPassword = rawPass.replace(/[\s\r\n]+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: senderEmail,
    pass: appPassword,
  },
  pool: false, // একক কানেকশন নিশ্চিত করবে
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection on startup with clear diagnostics
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ SMTP Transporter Warning:', error.message);
    if (error.responseCode === 535 || error.code === 'EAUTH') {
      console.warn('💡 Google App Password Notice: Please generate a fresh 16-character App Password at: https://myaccount.google.com/apppasswords and update GMAIL_APP_PASS in .env');
    }
  } else {
    console.log('✅ Gmail SMTP Server is ready to deliver messages.');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'Rasedul Karim Portfolio SMTP Service', time: new Date().toISOString() });
});

// ১. সাবস্ক্রিপশন ওটিপি (OTP) ভেরিফিকেশন এন্ডপয়েন্ট (Express & Netlify Serverless Function compatibility)
const handleSendOtpRoute = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'ইমেইল ও ওটিপি আবশ্যক।' });
  }

  const gmailUser = process.env.GMAIL_USER || 'rasedul.karim00@gmail.com';
  const mailOptions = {
    from: `"Rasedul Karim" <${gmailUser}>`,
    to: email,
    subject: `🔐 ${otp} হলো আপনার সাবস্ক্রিপশন ভেরিফিকেশন কোড`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0d9488; margin: 0;">ইমেইল যাচাইকরণ ওটিপি</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">পোর্টফোলিওতে সাবস্ক্রিপশন নিশ্চিত করতে নিচের কোডটি ব্যবহার করুন:</p>
        </div>
        <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">কোডটি পরবর্তী ৫ মিনিটের জন্য কার্যকর থাকবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে এটি উপেক্ষা করুন।</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer] OTP successfully delivered to ${email}: ${info.messageId}`);
    return res.json({ 
      success: true, 
      message: 'ওটিপি সফলভাবে ইনবক্সে পাঠানো হয়েছে।',
      messageId: info.messageId 
    });
  } catch (err) {
    console.error('❌ Nodemailer Dispatch Error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'ইমেইল পাঠাতে ব্যর্থ হয়েছে।' 
    });
  }
};

app.post('/api/send-otp', handleSendOtpRoute);
app.post('/.netlify/functions/send-otp', handleSendOtpRoute);

// ২. অর্ডার রসিদ / ডিসপ্যাচ এন্ডপয়েন্ট
app.post('/api/send-order-receipt', async (req, res) => {
  const { customerEmail, customerName, dealTitle, finalPrice, couponCode, message, htmlInvoice } = req.body;

  const mailOptions = {
    from: `"Rasedul Karim Portfolio" <${process.env.GMAIL_USER || 'rasedul.karim00@gmail.com'}>`,
    to: [process.env.GMAIL_USER || 'rasedul.karim00@gmail.com', customerEmail].filter(Boolean), // অ্যাডমিন ও কাস্টমার উভয়ের ইনবক্সে যাবে
    subject: `🎉 Order Confirmation: ${dealTitle || 'Project Order'}`,
    html: htmlInvoice || `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px;">
        <h3 style="color: #0d9488; margin-top: 0;">অর্ডার নিশ্চিতকরণ রসিদ</h3>
        <p><strong>প্রজেক্ট:</strong> ${dealTitle || 'Deal'}</p>
        <p><strong>গ্রাহকের নাম:</strong> ${customerName || 'N/A'}</p>
        <p><strong>ইমেইল:</strong> ${customerEmail}</p>
        <p><strong>কুপন কোড:</strong> ${couponCode || 'প্রযোজ্য নয়'}</p>
        <p><strong>পরিশোধযোগ্য মূল্য:</strong> ৳${finalPrice} BDT</p>
        <p><strong>বার্তা:</strong> ${message || 'কোনো বার্তা নেই'}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'অর্ডার রসিদ সফলভাবে পাঠানো হয়েছে।' });
  } catch (error) {
    console.error('Order receipt email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ৩. নতুন ইউজারের অনবোর্ডিং ওয়েলকাম ইমেইল এন্ডপয়েন্ট
const handleSendWelcomeEmailRoute = async (req, res) => {
  const { email, name, age, referralSource } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'ইমেইল আবশ্যক।' });
  }

  const userDisplayName = (name || 'Friend').trim();
  const gmailUser = process.env.GMAIL_USER || 'rasedul.karim00@gmail.com';

  const mailOptions = {
    from: `"Rasedul Karim" <${gmailUser}>`,
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Nodemailer] Welcome email sent to ${email}: ${info.messageId}`);
    return res.json({ success: true, message: 'Welcome email delivered successfully.', messageId: info.messageId });
  } catch (err) {
    console.error('❌ Welcome email error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/send-welcome-email', handleSendWelcomeEmailRoute);
app.post('/.netlify/functions/send-welcome-email', handleSendWelcomeEmailRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Email Service running on port ${PORT}`);
});
