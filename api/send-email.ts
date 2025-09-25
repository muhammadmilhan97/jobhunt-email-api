import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, toName, subject, html, text } = (req.body ?? {}) as {
    to?: string;
    toName?: string;
    subject?: string;
    html?: string;
    text?: string;
  };

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
      to: { name: toName || 'User', address: to },
      subject,
      html,
      text
    });

    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to send email' });
  }
}
