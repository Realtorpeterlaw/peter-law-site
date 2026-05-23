export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const honeypot = String(formData.get('website') || '').trim();

  // Bot trap: real users never fill the hidden 'website' field
  if (honeypot) {
    return redirect('/contact/thanks', 303);
  }

  if (!email || !message) {
    return new Response('Email and message are required.', { status: 400 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY env var not set on Vercel');
    return new Response('Email service not configured on the server.', { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: 'RealtorPeterLaw.com Contact <onboarding@resend.dev>',
      to: 'peter@realtorpeterlaw.com',
      replyTo: email,
      subject: `New message from ${name || email}`,
      text: `Name: ${name || '(not provided)'}
Email: ${email}
Phone: ${phone || '(not provided)'}

Message:
${message}

—
Sent from the realtorpeterlaw.com contact form`,
    });
    return redirect('/contact/thanks', 303);
  } catch (err) {
    console.error('Resend send error:', err);
    return new Response('Failed to send. Please email peter@realtorpeterlaw.com directly.', { status: 500 });
  }
};
