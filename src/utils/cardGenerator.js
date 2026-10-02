/**
 * Full-HD Branded Digital Contact Card Generator & Downloader
 * Generates an ultra-high-definition (3x pixel ratio) PNG contact card via HTML5 Canvas
 */

export const generateAndDownloadContactCard = async () => {
  const canvas = document.createElement('canvas');
  const width = 1080;
  const height = 1520;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Base Deep Cosmic Navy Gradient Canvas
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#070B14');
  bgGrad.addColorStop(0.5, '#0D1527');
  bgGrad.addColorStop(1, '#070B14');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Cyber Aurora Glow Orbs
  const cyanGlow = ctx.createRadialGradient(200, 200, 10, 200, 200, 480);
  cyanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
  cyanGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, width, height);

  const purpleGlow = ctx.createRadialGradient(width - 200, height - 250, 10, width - 200, height - 250, 520);
  purpleGlow.addColorStop(0, 'rgba(139, 92, 246, 0.32)');
  purpleGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 0, width, height);

  const magentaGlow = ctx.createRadialGradient(width / 2, 480, 10, width / 2, 480, 420);
  magentaGlow.addColorStop(0, 'rgba(236, 72, 153, 0.16)');
  magentaGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
  ctx.fillStyle = magentaGlow;
  ctx.fillRect(0, 0, width, height);

  // Helper for Rounded Rectangles
  const drawRoundRect = (x, y, w, h, radius, fillStyle, strokeStyle, lineWidth = 1) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  };

  // 3. Central Glassmorphic Card Frame
  const cardX = 70;
  const cardY = 80;
  const cardW = width - 140;
  const cardH = height - 160;
  
  // Card Shadow & Backing
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 20;
  drawRoundRect(cardX, cardY, cardW, cardH, 44, 'rgba(13, 20, 36, 0.85)', 'rgba(0, 240, 255, 0.35)', 2);
  ctx.restore();

  // Decorative Card Top Header Stripe
  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  headerGrad.addColorStop(0, '#00F0FF');
  headerGrad.addColorStop(0.5, '#00E676');
  headerGrad.addColorStop(1, '#FF007F');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX + 44, cardY, cardW - 88, 4);

  // 4. Load & Render Avatar Image
  const avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  
  await new Promise((resolve) => {
    avatarImg.onload = resolve;
    avatarImg.onerror = () => {
      // Fallback
      avatarImg.src = '/profile.jpeg';
      avatarImg.onload = resolve;
      avatarImg.onerror = resolve;
    };
    avatarImg.src = '/about.png';
  });

  const avatarCenterX = width / 2;
  const avatarCenterY = 320;
  const avatarRadius = 135;

  // Avatar Glowing Outer Ring
  const ringGrad = ctx.createLinearGradient(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarCenterX + avatarRadius, avatarCenterY + avatarRadius);
  ringGrad.addColorStop(0, '#00F0FF');
  ringGrad.addColorStop(0.5, '#00E676');
  ringGrad.addColorStop(1, '#FF007F');

  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 6, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Avatar Clip and Draw
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatarImg, avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
  ctx.restore();

  // 5. Name Typography with Verified Badge
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px "DM Serif Display", serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rasedul Karim', width / 2, 530);

  // Draw Verified Rosette Checkmark Icon next to Name
  const nameWidth = ctx.measureText('Rasedul Karim').width;
  const badgeX = width / 2 + nameWidth / 2 + 20;
  const badgeY = 512;
  
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#FF1744';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', badgeX, badgeY);
  ctx.textBaseline = 'alphabetic';

  // 6. Professional Tagline
  ctx.fillStyle = '#00F0FF';
  ctx.font = '600 24px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Software & Web Developer  |  Photo Editor  |  Digital Creator', width / 2, 580);

  // Divider Line
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 80, 625);
  ctx.lineTo(cardX + cardW - 80, 625);
  ctx.stroke();

  // 7. Contact Metadata Pill Rows
  const items = [
    { label: 'WhatsApp / Call', value: '+8801871176267', icon: '📱', color: '#00E676' },
    { label: 'Official Email', value: 'rasedul.karim.dev@gmail.com', icon: '✉️', color: '#00F0FF' },
    { label: 'Website Portfolio', value: 'rasedul-karim.web.app', icon: '🌐', color: '#A855F7' },
    { label: 'Official Location', value: 'Natun Pollan Para, Teknaf, Cox\'s Bazar', icon: '📍', color: '#FFB300' }
  ];

  let startY = 670;
  const pillHeight = 100;
  const pillGap = 24;

  items.forEach((item, idx) => {
    const py = startY + idx * (pillHeight + pillGap);
    const px = cardX + 60;
    const pw = cardW - 120;

    // Pill Background
    drawRoundRect(px, py, pw, pillHeight, 22, 'rgba(15, 23, 42, 0.9)', 'rgba(255, 255, 255, 0.1)', 1.5);

    // Left Icon Capsule
    drawRoundRect(px + 16, py + 16, 68, 68, 16, `${item.color}18`, `${item.color}45`, 1.5);
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, px + 50, py + 52);
    ctx.textBaseline = 'alphabetic';

    // Label & Value
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 19px "Space Grotesk", sans-serif';
    ctx.fillText(item.label, px + 104, py + 42);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 27px "Space Grotesk", sans-serif';
    ctx.fillText(item.value, px + 104, py + 76);
  });

  // 8. Footer Motto & Watermark
  const footerY = 1270;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FF1744';
  ctx.font = 'italic bold 25px "DM Serif Display", serif, sans-serif';
  ctx.fillText('"Always serve humanity with sincerity and empathy."', width / 2, footerY);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 18px "Space Grotesk", sans-serif';
  ctx.fillText('Digital NFC Verified Business Card  •  © 2026 Rasedul Karim', width / 2, footerY + 42);

  // 9. Trigger Instant Download
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Rasedul_Karim_Full_HD_Contact_Card.png';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(true);
    }, 'image/png');
  });
};
