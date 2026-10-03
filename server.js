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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Email Service running on port ${PORT}`);
});
