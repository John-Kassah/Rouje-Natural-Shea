import nodemailer from 'nodemailer';

/**
 * Build the HTML for the owner's notification mail
 * showing buyer info + ordered items with same UI as customer
 */
export const buildOwnerOrderNotificationHtml = (orderDetails) => {
  const o = (orderDetails && typeof orderDetails.toObject === 'function')
    ? orderDetails.toObject()
    : (orderDetails || {});

  const buyer = o.user || {};
  const paymentMethod = o.paymentMethod || {};
  const items = Array.isArray(o.items) ? o.items : [];

  const itemsHtml = items.map(item => {
    const product = item.product || {};
    return `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #ddd;">
          <strong>${product.name || 'Unnamed Product'}</strong><br/>
          <small>Qty: ${item.quantity || 0}</small>
        </td>
        <td style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">
          ${(product.price || 0).toFixed(2)} × ${item.quantity || 0}
        </td>
        <td style="padding:10px; text-align:right; border-bottom:1px solid #ddd;">
          ${(item.quantity * (product.price || 0)).toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="background:#293647; color:#fff; padding:16px; text-align:center; font-size:18px; font-weight:bold; border-radius:6px 6px 0 0;">
      🚨 New Order Received on Rouje Naturel Shea
    </div>
    <div style="background:#ffffff; margin:0 auto; padding:20px; border-radius:0 0 6px 6px; max-width:600px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
      
      <!-- Buyer Information -->
      <h2 style="color:#293647;">Buyer Information</h2>
      <p><strong>Name:</strong> ${buyer.fullName || 'N/A'}</p>
      <p><strong>Email:</strong> ${buyer.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${paymentMethod.phone || buyer.phoneNumber || 'N/A'}</p>
      <p><strong>Address:</strong> ${buyer.address || paymentMethod.address || 'N/A'}</p>
      <p><strong>City:</strong> ${buyer.city || paymentMethod.city || 'N/A'}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod.paymentMethod || 'N/A'}</p>

      <!-- Order Items -->
      <h2 style="color:#293647; margin-top:30px;">Order Details</h2>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:10px; border-bottom:2px solid #293647;">Item</th>
            <th align="right" style="padding:10px; border-bottom:2px solid #293647;">Price</th>
            <th align="right" style="padding:10px; border-bottom:2px solid #293647;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals -->
      <h3 style="text-align:right; margin-top:20px; color:#293647;">
        Grand Total: ${(o.total || o.totalCharge || 0).toFixed(2)}
      </h3>
    </div>
  `;
};

/**
 * Send order notification email to site owner
 */
export const sendOrderNotificationToOwner = async (orderDetails) => {
  const smtpService = process.env.SMTP_SERVICE;
  const smtpHost = process.env.SMTP_SERVER_HOST;
  const smtpPort = process.env.SMTP_SERVER_PORT ? Number(process.env.SMTP_SERVER_PORT) : undefined;
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.AUTHENTICATION_EMAIL;
  const smtpPass = process.env.EMAIL_AUTHENTICATION_PASSWORD;
  const fromAddress = process.env.SENDER_ADDRESS || smtpUser;
  const ownerAddress = process.env.SITE_OWNER_EMAIL; // 👈 must be set in .env

  if (!ownerAddress) throw new Error('SITE_OWNER_EMAIL not configured');

  const transporterOptions = smtpService
    ? { service: smtpService, auth: { user: smtpUser, pass: smtpPass } }
    : { host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } };

  const transporter = nodemailer.createTransport(transporterOptions);

  await transporter.verify();

  const html = buildOwnerOrderNotificationHtml(orderDetails);

  const orderId = orderDetails.orderId ?? orderDetails._id ?? 'N/A';
  const subject = `New Order Received • #${orderId}`;

  const mailOptions = {
    from: fromAddress,
    to: ownerAddress,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
