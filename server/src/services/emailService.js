import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

export const sendLoginOtpEmail = async ({ email, otp }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials (EMAIL_USER, EMAIL_PASS) not configured.');
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: '"VedaCraft" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Your VedaCraft login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
          <div style="padding: 20px 0; text-align: center;">
            <h1 style="color: #1c6b32; margin: 0;">VedaCraft</h1>
          </div>
          <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px;">
            <h2 style="margin: 0 0 12px; color: #111827;">Login OTP</h2>
            <p style="margin: 0 0 18px; line-height: 1.5;">Use this one-time password to sign in to your VedaCraft account.</p>
            <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #1c6b32; text-align: center; padding: 18px; background: #f3f7f4; border-radius: 8px;">
              ${otp}
            </div>
            <p style="margin: 18px 0 0; color: #6b7280; font-size: 13px;">This code expires soon. If you did not request it, you can ignore this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Login OTP email sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send login OTP email:', error.message);
    throw error;
  }
};

/**
 * Sends an order confirmation email
 * @param {Object} params
 * @param {string} params.email - The customer's email address
 * @param {string} params.name - The customer's name
 * @param {string} params.orderId - The order ID
 * @param {Array} params.items - The list of ordered items
 * @param {number} params.total - The total order amount
 * @param {Object} params.address - The delivery address object
 */
export const sendOrderConfirmationEmail = async ({
  email,
  name,
  orderId,
  items,
  total,
  address,
}) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials (EMAIL_USER, EMAIL_PASS) not configured. Skipping email.');
      return;
    }

    const transporter = getTransporter();

    // Format products list
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        </tr>
      `
      )
      .join('');

    // Format delivery address
    const addressHtml = address
      ? `
        <p style="margin: 5px 0;"><strong>${address.fullName}</strong></p>
        <p style="margin: 5px 0;">${address.address}</p>
        <p style="margin: 5px 0;">${address.city}, ${address.state} - ${address.pincode}</p>
        <p style="margin: 5px 0;">Phone: ${address.phoneNumber}</p>
      `
      : '<p>Standard Delivery Address</p>';

    // Estimated delivery (e.g., 5 days from today)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0; background-color: #f9fafb;">
          <h1 style="color: #1c6b32; margin: 0;">VedaCraft</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="color: #2c3e50; text-align: center;">Order Placed Successfully!</h2>
          <p>Hi ${name || 'Customer'},</p>
          <p>Thank you for your order! We are preparing your items for delivery. Below are the details of your order.</p>
          
          <div style="background-color: #f4f6f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> #${orderId}</p>
            <p style="margin: 5px 0 0 0;"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
          </div>

          <h3 style="color: #2c3e50; border-bottom: 2px solid #1c6b32; padding-bottom: 5px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #1c6b32;">₹${total}</td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color: #2c3e50; border-bottom: 2px solid #1c6b32; padding-bottom: 5px;">Delivery Details</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
            ${addressHtml}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; color: #666;">Thank you for shopping with VedaCraft!</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"VedaCraft" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
    // We do NOT throw here so that the main order flow is not interrupted
  }
};
