// test-resend.js
require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function testSend() {
  console.log('Sending test email...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Divas Kloset <noreply@divaskloset.com>',
      to: ['iyanuajala0@gmail.com'],
      subject: 'Test Email',
      html: '<strong>This is a test email</strong>'
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Email sent:', data);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

testSend();