import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Gmail SMTP ট্রান্সপোর্টার (SSL port 465 সহ সঠিক কনফিগারেশন)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL ব্যবহার
  auth: {
    user: process.env.GMAIL_USER || 'rasedul.karim00@gmail.com',
    pass: (process.env.GMAIL_APP_PASS || 'ntccgwbwttjlukle').replace(/\s+/g, ''), // স্পেস ছাড়া ১৬ অক্ষরের অ্যাপ পাসওয়ার্ড
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

// ১. সাবস্ক্রিপশন ওটিপি (OTP) ভেরিফিকেশন এন্ডপয়েন্ট
app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'ইমেইল ও ওটিপি আবশ্যক।' });
  }

  const mailOptions = {
    from: `"Rasedul Karim Portfolio" <${process.env.GMAIL_USER || 'rasedul.karim00@gmail.com'}>`,
    to: email,
    subject: '🔐 সাবস্ক্রিপশন ভেরিফিকেশন কোড',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2>আপনার সাবস্ক্রিপশন ওটিপি (OTP)</h2>
        <h1 style="color: #0d9488; letter-spacing: 5px;">${otp}</h1>
        <p>কোডটি ৫ মিনিটের জন্য কার্যকর থাকবে।</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to: ${email}`);
    return res.json({ success: true, message: 'ওটিপি সফলভাবে পাঠানো হয়েছে।' });
  } catch (err) {
    console.error('❌ Nodemailer Error:', err.message);

    // Google SMTP 535 BadCredentials / Authentication Error
    const isAuthError = err.code === 'EAUTH' || err.responseCode === 535 || err.message?.includes('535');
    if (isAuthError) {
      console.warn(`⚠️ [Google SMTP 535 Notice] Google rejected the App Password for ${process.env.GMAIL_USER || 'rasedul.karim00@gmail.com'}.`);
      console.warn(`🔑 [DEV TEST CODE] OTP for ${email} is: [ ${otp} ]`);

      // Allow smooth local development if DEV_OTP_FALLBACK is enabled
      const devBypass = process.env.DEV_OTP_FALLBACK === 'true' || !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
      if (devBypass) {
        return res.json({
          success: true,
          devNotice: true,
          message: 'ওটিপি কোড তৈরি হয়েছে (লোকাল টেস্ট মোড)। টার্মিনাল কনসোলে ওটিপি কোডটি দেখুন।'
        });
      }

      return res.status(500).json({ 
        success: false, 
        error: 'Google SMTP Authentication Failed (535 BadCredentials). Please create a new 16-character App Password at https://myaccount.google.com/apppasswords and update .env' 
      });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
});

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
