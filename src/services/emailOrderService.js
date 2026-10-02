import emailjs from '@emailjs/browser';

/**
 * Default EmailJS Configuration
 * You can also set these in your .env file:
 * VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
 */
export const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_rasedul',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_deal_order',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
  recipientEmail: 'rasedul.karim00@gmail.com'
};

/**
 * Generate full, responsive, high-end HTML Invoice Card Layout
 * Ready for EmailJS, transactional mailers, or in-app preview
 * Conditionally renders either a Special Offer Discount Invoice or a Standard Project Order Receipt
 */
export const generateHtmlInvoice = (data = {}) => {
  const hasCoupon = data.has_coupon === true || (
    data.coupon_code && 
    data.coupon_code !== 'ব্যবহার করা হয়নি' && 
    data.coupon_code !== 'Not applied' && 
    data.coupon_code !== 'None'
  );

  const orderId = data.order_id || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
  const orderDate = data.order_date || new Date().toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const projectName = data.project_name || 'Exclusive Deal';
  const couponCode = hasCoupon ? (data.coupon_code || 'SPECIAL') : null;
  const originalPrice = data.original_price || '৳৫,০০০ BDT';
  const discountPercentage = data.discount_percentage || '75';
  const discountAmount = data.discount_amount || '৳৩,৭৫০ BDT';
  const finalPrice = data.final_price || '৳১,২৫০ BDT';
  const userName = data.user_name || 'গ্রাহকের নাম উল্লেখ করা হয়নি';
  const userEmail = data.user_email || 'client@example.com';
  const userMessage = data.user_message || 'কোনো বিশেষ রিকোয়ারমেন্ট উল্লেখ করা হয়নি।';

  // Conditional Hero Banner & Badge
  const bannerBackground = hasCoupon 
    ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' 
    : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
  const bannerEmoji = hasCoupon ? '🎉' : '📦';
  const bannerTitle = hasCoupon 
    ? 'আপনার অফার অর্ডার কনফার্ম হয়েছে!' 
    : 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!';
  const bannerSubtitle = hasCoupon 
    ? 'আপনার স্পেশাল ডিসকাউন্ট ক্লেইম অর্ডারটি গ্রহণ করা হয়েছে। খুব শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।' 
    : 'আপনার প্রজেক্ট রিকোয়েস্টটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।';

  const badgeHtml = hasCoupon
    ? `<span style="display: inline-block; padding: 6px 14px; border-radius: 20px; background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; color: #10b981; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">✓ অর্ডার ভেরিফাইড</span>`
    : `<span style="display: inline-block; padding: 6px 14px; border-radius: 20px; background: rgba(59, 130, 246, 0.15); border: 1.5px solid #3b82f6; color: #60a5fa; font-size: 12px; font-weight: 800; letter-spacing: 0.5px;">✓ অর্ডার গৃহীত</span>`;

  // Conditional Pricing Table Rows (No discount lines if no coupon)
  const pricingTableRows = hasCoupon
    ? `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <td align="left" style="padding: 14px 0;">
                <div style="font-weight: 800; color: #ffffff; font-size: 15px;">${projectName}</div>
                <div style="font-size: 12px; color: #14b8a6; margin-top: 4px;">কুপন কোড: <strong>${couponCode}</strong></div>
              </td>
              <td align="center" style="padding: 14px 0; font-size: 14px; color: #cbd5e1;">১টি</td>
              <td align="right" style="padding: 14px 0; font-size: 14px; color: #cbd5e1; font-family: monospace;">${originalPrice}</td>
            </tr>
            <tr>
              <td colspan="2" align="left" style="padding: 12px 0 4px; font-size: 13px; color: #94a3b8;">প্যাকেজের নিয়মিত মূল্য:</td>
              <td align="right" style="padding: 12px 0 4px; font-size: 13px; color: #cbd5e1; font-family: monospace;">${originalPrice}</td>
            </tr>
            <tr>
              <td colspan="2" align="left" style="padding: 6px 0; font-size: 13px; color: #10b981;">প্রযোজ্য কুপন ছাড় (${discountPercentage}%):</td>
              <td align="right" style="padding: 6px 0; font-size: 13px; color: #10b981; font-weight: 700; font-family: monospace;">-${discountAmount}</td>
            </tr>
            <tr style="border-top: 1.5px solid rgba(20, 184, 166, 0.4);">
              <td colspan="2" align="left" style="padding: 14px 0; font-size: 15px; font-weight: 900; color: #ffffff;">চূড়ান্ত প্রদেয় মূল্য (Total):</td>
              <td align="right" style="padding: 14px 0; font-size: 19px; font-weight: 900; color: #10b981; font-family: monospace;">${finalPrice}</td>
            </tr>
    `
    : `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <td align="left" style="padding: 14px 0;">
                <div style="font-weight: 800; color: #ffffff; font-size: 15px;">${projectName}</div>
              </td>
              <td align="center" style="padding: 14px 0; font-size: 14px; color: #cbd5e1;">১টি</td>
              <td align="right" style="padding: 14px 0; font-size: 14px; color: #cbd5e1; font-family: monospace;">${finalPrice}</td>
            </tr>
            <tr style="border-top: 1.5px solid rgba(255, 255, 255, 0.12);">
              <td colspan="2" align="left" style="padding: 14px 0; font-size: 15px; font-weight: 900; color: #ffffff;">চূড়ান্ত প্রদেয় মূল্য (Total):</td>
              <td align="right" style="padding: 14px 0; font-size: 19px; font-weight: 900; color: #10b981; font-family: monospace;">${finalPrice}</td>
            </tr>
    `;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation Invoice - ${projectName}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #070d1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(20, 184, 166, 0.35); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);">
    
    <!-- 1. Branding Bar -->
    <tr>
      <td style="padding: 24px 28px 20px; background-color: #091124; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left">
              <span style="font-size: 19px; font-weight: 900; letter-spacing: 2px; color: #14b8a6; text-transform: uppercase;">RASEDUL KARIM</span>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 3px; letter-spacing: 0.6px;">EXCLUSIVE DEALS & DIGITAL SOLUTIONS</div>
            </td>
            <td align="right">
              ${badgeHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 2. Hero Banner (Conditional) -->
    <tr>
      <td style="padding: 32px 28px; background: ${bannerBackground}; text-align: center; color: #ffffff;">
        <div style="font-size: 38px; margin-bottom: 8px;">${bannerEmoji}</div>
        <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px;">${bannerTitle}</h1>
        <p style="margin: 0; font-size: 13px; color: #e6fffa; line-height: 1.5;">${bannerSubtitle}</p>
      </td>
    </tr>

    <!-- 3. Order Metadata Row -->
    <tr>
      <td style="padding: 16px 28px; background-color: #111e38; border-bottom: 1px dashed rgba(255, 255, 255, 0.15);">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="color: #94a3b8; font-size: 13px;">
              অর্ডার নম্বর: <strong style="color: #22d3ee; font-family: monospace; font-size: 14px;">#${orderId}</strong>
            </td>
            <td align="right" style="color: #94a3b8; font-size: 12px;">
              তারিখ: <strong style="color: #ffffff;">${orderDate}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- 4. Structured Pricing Table -->
    <tr>
      <td style="padding: 26px 28px;">
        <div style="font-size: 13px; font-weight: 800; color: #22d3ee; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📋 প্রজেক্ট ও প্রাইসিং বিবরণ</div>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <th align="left" style="padding: 10px 0; font-size: 12px; color: #94a3b8; font-weight: 700;">আইটেম / প্রজেক্ট</th>
              <th align="center" style="padding: 10px 0; font-size: 12px; color: #94a3b8; font-weight: 700;">পরিমাণ</th>
              <th align="right" style="padding: 10px 0; font-size: 12px; color: #94a3b8; font-weight: 700;">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${pricingTableRows}
          </tbody>
        </table>
      </td>
    </tr>

    <!-- 5. Customer Details & Requirements Card -->
    <tr>
      <td style="padding: 0 28px 24px;">
        <div style="background-color: #111e38; border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 13px; font-weight: 800; color: #22d3ee; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">👤 গ্রাহকের তথ্য ও রিকোয়ারমেন্ট</div>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8; width: 110px;">গ্রাহকের নাম:</td>
              <td style="padding: 4px 0; font-size: 13px; color: #ffffff; font-weight: 700;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13px; color: #94a3b8;">ভেরিফাইড ইমেইল:</td>
              <td style="padding: 4px 0; font-size: 13px; color: #10b981; font-weight: 700; font-family: monospace;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0 4px; font-size: 13px; color: #94a3b8; vertical-align: top;">বিশেষ বার্তা:</td>
              <td style="padding: 8px 10px 4px; font-size: 13px; color: #cbd5e1; line-height: 1.5; background: rgba(0, 0, 0, 0.25); border-radius: 8px;">${userMessage}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <!-- 6. Footer Note -->
    <tr>
      <td style="padding: 20px 28px; background-color: #091124; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; color: #64748b; font-size: 11px; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">© 2026 Rasedul Karim. All rights reserved.</p>
        <p style="margin: 0;">যেকোনো জিজ্ঞাসা বা সহায়তার জন্য সরাসরি যোগাযোগ করুন: <a href="mailto:rasedul.karim00@gmail.com" style="color: #14b8a6; text-decoration: none; font-weight: bold;">rasedul.karim00@gmail.com</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Dispatch Styled Order Email via EmailJS with graceful fallback
 */
export const sendStyledOrderEmail = async ({
  activeDeal,
  isCouponApplied,
  enteredCoupon,
  userName,
  userEmail,
  userMessage,
  pricing
}) => {
  const deal = activeDeal || {};
  const hasCoupon = !!(isCouponApplied && enteredCoupon);
  const rate = pricing?.rate || 75;
  const originalPriceText = `৳${pricing?.basePrice || (deal.originalPrice ? Math.round(Number(deal.originalPrice)) : 5000)} BDT`;
  const discountAmountText = `৳${pricing?.discountAmount || 0} BDT`;
  const finalPriceText = `৳${pricing?.finalPrice || (deal.originalPrice ? Math.round(Number(deal.originalPrice)) : 5000)} BDT`;
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const templateParams = {
    order_id: orderId,
    order_date: orderDate,
    has_coupon: hasCoupon,
    order_type: hasCoupon ? "স্পেশাল অফার অর্ডার" : "প্রজেক্ট অর্ডার",
    project_name: deal.title || 'Exclusive Deal Project',
    coupon_code: hasCoupon ? enteredCoupon : "ব্যবহার করা হয়নি",
    original_price: originalPriceText,
    discount_percentage: hasCoupon ? String(rate) : "0",
    discount_amount: hasCoupon ? discountAmountText : "৳0 BDT",
    final_price: finalPriceText,
    user_name: userName || 'গ্রাহকের নাম উল্লেখ করা হয়নি',
    user_email: userEmail,
    user_message: userMessage || "কোনো বিশেষ রিকোয়ারমেন্ট উল্লেখ করা হয়নি।",
    html_invoice: generateHtmlInvoice({
      order_id: orderId,
      order_date: orderDate,
      has_coupon: hasCoupon,
      project_name: deal.title,
      coupon_code: hasCoupon ? enteredCoupon : null,
      original_price: originalPriceText,
      discount_percentage: String(rate),
      discount_amount: discountAmountText,
      final_price: finalPriceText,
      user_name: userName,
      user_email: userEmail,
      user_message: userMessage
    })
  };

  // Try EmailJS dispatch if configured
  if (
    EMAILJS_CONFIG.serviceId && 
    EMAILJS_CONFIG.templateId && 
    EMAILJS_CONFIG.publicKey && 
    EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
  ) {
    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      return { success: true, response, templateParams };
    } catch (error) {
      console.warn("EmailJS cloud dispatch note:", error);
      return { success: false, error, templateParams };
    }
  }

  // Fallback: Return template params for mail client / preview
  return { 
    success: false, 
    isConfigNeeded: true, 
    templateParams 
  };
};

/**
 * Send Styled Order Receipt to Admin and Customer via Backend Nodemailer Gmail SMTP
 */
export const sendOrderReceiptViaBackend = async ({
  customerEmail,
  customerName,
  dealTitle,
  finalPrice,
  couponCode,
  message,
  htmlInvoice
}) => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = baseUrl ? `${baseUrl}/api/send-order-receipt` : '/api/send-order-receipt';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerEmail,
        customerName,
        dealTitle,
        finalPrice,
        couponCode,
        message,
        htmlInvoice
      })
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend send-order-receipt error:', err);
    return { success: false, error: err.message };
  }
};

