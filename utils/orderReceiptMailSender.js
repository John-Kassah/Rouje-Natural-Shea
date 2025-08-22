import nodemailer from 'nodemailer';

/**
 * Build an HTML email for an order receipt (dark theme, readable, semantic)
 * @param {Object} orderDetails - Order object containing user, items, totals, payment info
 * @returns {string} - HTML string for the email body
 */
export const buildOrderReceiptHtml = (orderDetails) => {
  // Accept Mongoose doc or plain object
  const o = orderDetails

  // Normalize fields with safe fallbacks
  const orderId = o.orderId ?? o._id?.toString?.() ?? 'N/A';
  const orderDate = o.orderDate ?? o.createdAt ?? new Date().toISOString();
  const user = o.user ?? (o.customer ?? {});
  const userEmail = user.email ?? o.email ?? '';

  // derive display name: prefer paymentMethod.fullName, then user.fullName if it's a real name
  const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
 
  const displayName = (
    (o.paymentMethod && o.paymentMethod.fullName) ? o.paymentMethod.fullName
    : (user.fullName && !isEmail(user.fullName)) ? user.fullName
    : user.name || userEmail || 'Customer'
  ) || 'Customer';

  const shippingAddress = (o.shippingAddress && String(o.shippingAddress)) || o.address || o.deliveryAddress || null;

  // Items normalization: prefer product.name if available
  const rawItems = Array.isArray(o.items) ? o.items : [];
  const items = rawItems.map(it => {
    const product = it.product ?? it.productDetails ?? {};
    const name = product && (product.name || product.title) ? (product.name || product.title) : (it.name ?? 'Item');
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const unitPrice = Number(it.priceAtPurchase ?? it.price ?? product.price ?? 0);
    const lineTotal = +(qty * unitPrice).toFixed(2);
    return { name: String(name), qty, unitPrice, lineTotal };
  });

  // Totals: prefer explicit order total, otherwise compute
  const providedTotal = Number(o.total ?? o.totalCharge ?? o.amount ?? NaN);
  const computedSubtotal = items.reduce((s, it) => s + it.lineTotal, 0);
  const subtotal = +computedSubtotal.toFixed(2);
  const finalTotal = Number.isFinite(providedTotal) ? +providedTotal.toFixed(2) : subtotal;

  // Payment method string to display at bottom
  const paymentMethodLabel = (o.paymentMethod && (o.paymentMethod.paymentMethod ?? o.paymentMethod.provider)) || (o.paymentMethod ?? o.payment) || 'Unknown';

  // Currency default to GHS
  const currency = o.currency ?? 'GHS';

  // Table rows HTML
  const itemRowsHtml = items.map(it => `
    <tr>
      <td style="padding:12px 8px; vertical-align:middle; word-break:break-word; overflow-wrap:anywhere;">${escapeHtml(it.name)}</td>
      <td style="padding:12px 8px; vertical-align:middle; text-align:center; white-space:nowrap;">${it.qty}</td>
      <td style="padding:12px 8px; vertical-align:middle; text-align:right; white-space:nowrap;">${formatCurrency(it.unitPrice, currency)}</td>
      <td style="padding:12px 8px; vertical-align:middle; text-align:right; white-space:nowrap;">${formatCurrency(it.lineTotal, currency)}</td>
    </tr>
  `).join('');

  // Shipping block if present
  const shippingHtml = shippingAddress ? `
    <div style="background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; min-width:220px;">
      <div style="color:#9fb0c9; font-size:13px;">Shipping</div>
      <div style="font-weight:600; color:#fff; margin-top:6px;">${escapeHtml(shippingAddress)}</div>
    </div>` : '';

  // PREHEADER (hidden)
  const preheader = `Thank you ${displayName} — your order ${String(orderId)} has been received.`;

  // Summary strip
  const summaryStripHtml = `
    <div style="margin-top:10px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
      <div style="background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:8px; min-width:140px;">
        <div style="font-size:11px; color:#9fb0c9">Total</div>
        <div style="font-weight:700; color:#fff; margin-top:4px;">${formatCurrency(finalTotal, currency)}</div>
      </div>

      <div style="background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:8px; min-width:160px;">
        <div style="font-size:11px; color:#9fb0c9">Recipient</div>
        <div style="font-weight:600; color:#fff; margin-top:4px;">${escapeHtml(displayName)}</div>
      </div>

      <div style="background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:8px; min-width:160px;">
        <div style="font-size:11px; color:#9fb0c9">Payment</div>
        <div style="font-weight:600; color:#fff; margin-top:4px;">${escapeHtml(String(paymentMethodLabel))}</div>
      </div>
    </div>
  `;

  // Final HTML
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Order Receipt</title>
    <style>
      body { margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial; background:#0b1220; color:#e6eef6; }
      .wrap { max-width:720px; margin:28px auto; padding:18px 20px; background:linear-gradient(180deg,#141a22,#0b0f14); border-radius:12px; box-shadow:0 8px 30px rgba(2,6,23,0.7); }
      .top { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
      .brand { font-weight:700; font-size:20px; color:#fff; }
      .meta { text-align:right; color:#bcd3ea; font-size:13px; min-width:120px; }
      .lead { margin:6px 0 12px 0; color:#9fb0c9; font-size:14px; }
      table.items { width:100%; border-collapse:collapse; margin-top:12px; table-layout:auto; }
      table.items thead th { text-align:left; color:#9fb0c9; font-size:13px; padding:12px 8px; border-bottom:2px solid rgba(255,255,255,0.06); }
      table.items tbody td { color:#e6eef6; font-size:14px; padding:12px 8px; vertical-align:middle; border-bottom:2px solid rgba(255,255,255,0.04); }
      @media (max-width:600px) { .top { flex-direction:column; } .meta { text-align:left; } }
    </style>
  </head>
  <body>
    <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</div>
    <!-- Gmail-safe preheader addition -->
    <div style="display:none; max-height:0; overflow:hidden;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;&nbsp;&zwnj;&nbsp;</div>

    <div class="wrap" role="article" aria-label="Order Receipt">
      <div class="top">
        <div>
          <div class="brand">Rouje Naturel Shea</div>
          <h1 style="margin:6px 0 4px 0; font-size:18px; color:#f7fafc;">Thanks for your order, ${escapeHtml(displayName)}!</h1>
          <div class="lead">Order <strong>#${escapeHtml(String(orderId))}</strong> • Placed on ${formatDate(orderDate)}</div>

          ${summaryStripHtml}
        </div>

        <div class="meta" aria-hidden="false">
          <div style="font-size:11px; color:#9fb0c9">Total</div>
          <div style="font-weight:700;color:#dbeafe;margin-top:6px">${formatCurrency(finalTotal, currency)}</div>
        </div>
      </div>

      <table class="items" role="table" aria-label="Ordered items">
        <colgroup>
          <col style="width:50%" />
          <col style="width:16.6667%" />
          <col style="width:16.6667%" />
          <col style="width:16.6667%" />
        </colgroup>
        <thead>
          <tr>
            <th style="padding:12px 8px; text-align:left;">Item</th>
            <th style="padding:12px 8px; text-align:center;">Qty</th>
            <th style="padding:12px 8px; text-align:right;">Unit</th>
            <th style="padding:12px 8px; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml || `<tr><td colspan="4" style="padding:18px 8px;color:#9fb0c9">No items found</td></tr>`}
        </tbody>
      </table>

      <div style="float:right; width:260px; margin-top:12px; text-align:right;">
        <div style="font-size:13px; color:#9fb0c9">Total Charged</div>
        <div style="font-weight:700; color:#fff; font-size:16px; margin-top:6px;">${formatCurrency(finalTotal, currency)}</div>
      </div>

      <div style="clear:both;"></div>

      <div style="display:flex; gap:18px; margin-top:18px; flex-wrap:wrap;">
        <div style="flex:1 1 280px; background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; min-width:220px;">
          <div style="color:#9fb0c9; font-size:13px;">Recipient</div>
          <div style="font-weight:600; color:#fff; margin-top:6px;">${escapeHtml(displayName)}</div>
          <div style="color:#9fb0c9; font-size:13px; margin-top:6px;">${escapeHtml(userEmail)}</div>
        </div>

        <div style="flex:1 1 280px; background:rgba(255,255,255,0.02); padding:12px; border-radius:8px; min-width:220px;">
          <div style="color:#9fb0c9; font-size:13px;">Payment Method</div>
          <div style="font-weight:600; color:#fff; margin-top:6px;">${escapeHtml(String(paymentMethodLabel))}</div>
        </div>

        ${shippingHtml}
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:22px; border-collapse:collapse; border-top:1px solid rgba(255,255,255,0.04);">
        <tr>
          <td style="padding:12px 0; text-align:center; color:#7f98b0; font-size:12px; opacity:0.96;">
            Questions? Reply to this email or contact support at <a href="mailto:support@rouje.example" style="color:#cfe7ff; text-decoration:none">support@rouje.example</a><br>
            &copy; ${new Date().getFullYear()} Rouje Naturel Shea. All rights reserved.
          </td>
        </tr>
      </table>
      <!-- Invisible personalized footer addition -->
      <div style="font-size:1px; color:#111111; opacity:0.01; height:0; overflow:hidden;">Ref: ${orderId} — ${escapeHtml(displayName)}</div>
    </div>
  </body>
  </html>
  `;

  return html;
};

/**
 * Send an order receipt email
 */
export const sendOrderReceiptMail = async (orderDetails) => {
  if (!orderDetails || typeof orderDetails !== 'object') {
    throw new Error('sendOrderReceiptMail: orderDetails object is required');
  }

  const smtpService = process.env.SMTP_SERVICE;
  const smtpHost = process.env.SMTP_SERVER_HOST;
  const smtpPort = process.env.SMTP_SERVER_PORT ? Number(process.env.SMTP_SERVER_PORT) : undefined;
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = process.env.AUTHENTICATION_EMAIL;
  const smtpPass = process.env.EMAIL_AUTHENTICATION_PASSWORD;
  const fromAddress = process.env.SENDER_ADDRESS || smtpUser;

  const transporterOptions = smtpService
    ? { service: smtpService, auth: { user: smtpUser, pass: smtpPass } }
    : { host: smtpHost, port: smtpPort, secure: smtpSecure, auth: { user: smtpUser, pass: smtpPass } };

  const transporter = nodemailer.createTransport(transporterOptions);

  try {
    await transporter.verify();
  } catch (err) {
    const hint = smtpService ? `service=${smtpService}` : `host=${smtpHost} port=${smtpPort}`;
    throw new Error(`SMTP verification failed (${hint}): ${err.message}`);
  }

  const html = buildOrderReceiptHtml(orderDetails);

  const toAddress = (orderDetails.user && orderDetails.user.email) ? orderDetails.user.email : (orderDetails.email || null);
  if (!toAddress) throw new Error('sendOrderReceiptMail: recipient email not found');

  const mailOptions = {
    from: fromAddress,
    to: toAddress,
    subject: `Your Order Receipt • #${orderDetails.orderId ?? 'N/A'}`,
    text: `Thank you for your order. Order #${orderDetails.orderId ?? 'N/A'} — Total ${orderDetails.total ?? orderDetails.totalCharge ?? 'N/A'}`,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/* -----------------------
 * Helper utilities below
 * ---------------------- */
function maskPhone(phone = '') {
  const s = String(phone);
  if (s.length <= 4) return s;
  const last4 = s.slice(-4);
  return s.slice(0, Math.max(0, s.length - 4)).replace(/\d/g, '*') + last4;
}
function formatCurrency(amount, currency = 'GHS') {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(1)}`;
  }
}
function formatDate(dateInput) {
  try {
    const d = new Date(dateInput);
    return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', hour12: true });
  } catch {
    return String(dateInput);
  }
}
function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
