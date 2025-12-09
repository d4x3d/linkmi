'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { render } from '@react-email/components';
import nodemailer from 'nodemailer';
import { PurchaseEmail } from './PurchaseEmail';
import React from 'react';

export const sendPurchaseReceipt = internalAction({
  args: {
    email: v.string(),
    productName: v.string(),
    downloadUrl: v.optional(v.string()),
    deliveryNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, productName, downloadUrl, deliveryNote } = args;

    // 1. Check for required environment variables
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'Slobi <noreply@slobi.vercel.app>';

    if (!host || !user || !pass) {
      console.error('Missing SMTP configuration. Email not sent.');
      return; // Fail silently or throw? Silent is safer for payment flow continuity, but logging is essential.
    }

    // 2. Configure Transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    try {
      // 3. Render Email Template
      const emailHtml = await render(
        React.createElement(PurchaseEmail, {
          productName,
          downloadUrl,
          deliveryNote,
        }),
      );

      // 4. Send Email
      await transporter.sendMail({
        from,
        to: email,
        subject: `Your purchase of ${productName} is ready`,
        html: emailHtml,
      });

      console.log(`Email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      // We don't throw here to avoid failing unrelated logic if called in a chain,
      // but the caller can check the return value if needed.
      return { success: false, error: String(error) };
    }
  },
});
