const nodemailer = require('nodemailer');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

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
    throw new Error('Email server is not configured. Set Netlify environment variables.');
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed.' });
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, email, phone, service, message } = data;

    const validationError = validateInput({ name, email, phone, service, message });
    if (validationError) {
      return json(400, { success: false, message: validationError });
    }

    await sendWithSmtp({ name, email, phone, service, message });

    return json(200, { success: true, message: 'Thanks! Your message has been sent.' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Netlify contact send failed:', error);
    return json(500, {
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Unable to send your message right now. Please try again shortly.'
          : `Unable to send your message right now: ${error.message}`
    });
  }
};
