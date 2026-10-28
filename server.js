import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(uploadsDir));

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

// Cloudflare R2 Storage Configuration (AWS S3 SDK Client)
const r2AccountId = (process.env.R2_ACCOUNT_ID || '8640d86f82b73afcaa0fd1e4c5229d10').trim();
const r2AccessKeyId = (process.env.R2_ACCESS_KEY_ID || '21933dc73905f37bf57d4f47a0437527').trim();
const r2SecretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || 'a54d14821a6f7efe4185bd3932d836b44c9399d4e1efa532105c7aad57f1a951').trim();
const r2BucketName = (process.env.R2_BUCKET_NAME || 'portfolio').trim();
const r2PublicDomain = (process.env.R2_PUBLIC_DOMAIN || 'https://pub-646ef96285ab4ea585237b1060eb0116.r2.dev').trim().replace(/\/+$/, '');

let s3Client = null;
if (r2AccessKeyId && r2SecretAccessKey) {
  try {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
    console.log(`✅ Cloudflare R2 S3 Client configured for bucket: ${r2BucketName} (Public: ${r2PublicDomain})`);
  } catch (err) {
    console.warn('⚠️ Cloudflare R2 S3 Client initialization warning:', err.message);
  }
} else {
  console.log('ℹ️ Cloudflare R2 credentials (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY) not set in .env.');
}

// ৪. Universal Cloudflare R2 / S3-Compatible Upload Endpoint for All Website Sections
const handleR2UploadRoute = async (req, res) => {
  try {
    const { filename, fileData, image, contentType, folder } = req.body;
    const rawData = fileData || image;
    if (!filename || !rawData) {
      return res.status(400).json({ success: false, message: 'Filename and fileData are required.' });
    }

    // 1. Strict Validation: Cloudflare R2 Credentials MUST be present
    if (!r2AccessKeyId || !r2SecretAccessKey || !s3Client) {
      console.error('❌ Cloudflare R2 credentials missing');
      return res.status(400).json({ 
        success: false, 
        error: 'Cloudflare R2 ক্রেডেনশিয়াল পাওয়া যায়নি! বাকেটে আসল ফাইল আপলোড করতে অনুগ্রহ করে .env ফাইলে R2_ACCESS_KEY_ID এবং R2_SECRET_ACCESS_KEY কনফিগার করুন।' 
      });
    }

    // Folder categorization (e.g., sponsors, deals, projects, etc.)
    const folderName = (folder || req.query?.folder || 'uploads').toString().trim().replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_-]/g, '_') || 'uploads';
    const safeExt = contentType === 'image/jpeg' ? '.jpg' : '.webp';
    const cleanBase = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${Date.now()}_${cleanBase}${safeExt}`;
    const filePath = `${folderName}/${fileName}`;
    const base64Data = rawData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const mimeType = contentType || 'image/webp';

    // 2. Direct Cloudflare R2 Upload via AWS S3 SDK PutObjectCommand
    const putCommand = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: filePath,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    });
    await s3Client.send(putCommand);

    // 3. Construct Authentic Cloudflare R2 Public HTTPS URL
    const publicDomain = r2PublicDomain || 'https://pub-646ef96285ab4ea585237b1060eb0116.r2.dev';
    const publicUrl = `${publicDomain}/${filePath}`;

    console.log(`✅ [Cloudflare R2 PutObjectCommand] Successfully written to R2 bucket "${r2BucketName}/${filePath}": ${publicUrl} (${buffer.length} bytes)`);

    return res.json({ 
      success: true, 
      url: publicUrl, 
      filePath,
      key: filePath,
      filename: fileName,
      bucket: r2BucketName,
      size: buffer.length,
      storage: 'cloudflare-r2' 
    });
  } catch (err) {
    console.error('❌ Cloudflare R2 PutObjectCommand error:', err);
    return res.status(500).json({ 
      success: false, 
      error: `Cloudflare R2 বাকেটে ফাইল আপলোড ব্যর্থ হয়েছে: ${err.message || 'Unknown R2 error'}` 
    });
  }
};

app.post('/api/upload-to-r2', handleR2UploadRoute);
app.post('/api/r2-upload', handleR2UploadRoute);
app.post('/.netlify/functions/upload-to-r2', handleR2UploadRoute);
app.post('/.netlify/functions/r2-upload', handleR2UploadRoute);

// ৫. Cloudflare R2 Storage Purge Delete Endpoint
const handleR2DeleteRoute = async (req, res) => {
  try {
    const { fileUrl, key: directKey } = req.body;
    if (!fileUrl && !directKey) {
      return res.status(400).json({ success: false, message: 'fileUrl or key is required.' });
    }

    let key = directKey || '';
    if (!key && fileUrl) {
      try {
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
          const parsed = new URL(fileUrl);
          key = parsed.pathname.replace(/^\/+/, '');
        } else {
          key = fileUrl.replace(/^\/+/, '');
        }
      } catch {
        key = fileUrl.replace(/^\/+/, '');
      }
    }

    if (s3Client && key) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: r2BucketName,
          Key: key
        }));
        console.log(`🗑️ [Cloudflare R2 DeleteObjectCommand] Purged: ${key}`);
      } catch (s3DelErr) {
        console.warn('R2 DeleteObjectCommand notice:', s3DelErr.message);
      }
    }

    return res.json({ success: true, message: 'File purged successfully', key });
  } catch (err) {
    console.error('R2 delete error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/r2-delete', handleR2DeleteRoute);
app.post('/api/delete-from-r2', handleR2DeleteRoute);
app.post('/.netlify/functions/r2-delete', handleR2DeleteRoute);
app.post('/.netlify/functions/delete-from-r2', handleR2DeleteRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Email Service running on port ${PORT}`);
});
