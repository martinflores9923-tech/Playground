const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function validateInput({ name, email, phone, service, message }) {
  if (!name || !email || !phone || !service || !message) {
    return 'Please complete all required fields.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please provide a valid email address.';
  }

  return null;
}

async function sendWithSmtp({ name, email, phone, service, message }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.CONTACT_TO_EMAIL) {
    throw new Error('Email server is not configured. Please set environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const subject = `New Pacific Services Cleaning inquiry: ${service}`;
  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Service: ${service}`,
    '',
    'Message:',
    message
  ].join('\n');

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: process.env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject,
    text: textBody,
    html: `
      <h2>New Website Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  });
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    const validationError = validateInput({ name, email, phone, service, message });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    await sendWithSmtp({ name, email, phone, service, message });

    return res.json({ success: true, message: 'Thanks! Your message has been sent.' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Contact form send failed:', error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Unable to send your message right now. Please try again shortly.'
          : `Unable to send your message right now: ${error.message}`
    });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Pacific Services Cleaning site running at http://localhost:${PORT}`);
});
