import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeName,
      slug,
      ownerName,
      ownerEmail,
      status = 'active',
      planName = 'Starter Boutique',
      temporaryPassword = `Mavenco@2026!${slug}`,
      customDomain,
    } = body;

    if (!ownerEmail || !slug) {
      return NextResponse.json(
        { error: 'ownerEmail and slug are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const adminLoginUrl = `https://mavenco-admin.vercel.app/login?tenant=${slug}&email=${encodeURIComponent(ownerEmail)}`;
    const storefrontUrl = `https://mavenco-storefront.vercel.app/stores/${slug}`;
    const statusBadge =
      status === 'active'
        ? '🟢 Active (Production)'
        : status === 'trial'
        ? '🟡 14-Day Boutique Trial'
        : '🔴 Suspended';

    const emailSubject = `🎉 Welcome to Mavenco Commerce: ${storeName} Activation & Admin Credentials`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0f17; color: #ffffff; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #161822; border: 1px solid #2d3748; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; color: #ffffff; text-transform: uppercase;">
              MAVENCO COMMERCE
            </h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: #ffe4e6; font-weight: 500;">
              Store Provisioning &amp; Merchant Activation
            </p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px;">
            <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #ffffff;">
              Hello ${ownerName || 'Merchant Partner'},
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px;">
              Your dedicated multi-tenant e-commerce store <strong style="color: #ffffff;">${storeName}</strong> has been successfully provisioned on the Mavenco Multi-Tenant Cloud Platform.
            </p>

            <!-- Store Status Badge -->
            <div style="background-color: #1e2230; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #94a3b8; padding: 6px 0;">Store Brand:</td>
                  <td style="color: #ffffff; font-weight: 700; text-align: right; padding: 6px 0;">${storeName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 6px 0;">Store Slug:</td>
                  <td style="color: #38bdf8; font-family: monospace; text-align: right; padding: 6px 0;">/stores/${slug}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 6px 0;">Lifecycle Status:</td>
                  <td style="color: #ffffff; font-weight: 700; text-align: right; padding: 6px 0;">${statusBadge}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 6px 0;">Subscription Plan:</td>
                  <td style="color: #e11d48; font-weight: 700; text-align: right; padding: 6px 0;">${planName}</td>
                </tr>
                ${customDomain ? `
                <tr>
                  <td style="color: #94a3b8; padding: 6px 0;">Custom Domain:</td>
                  <td style="color: #4ade80; text-align: right; padding: 6px 0;">${customDomain}</td>
                </tr>` : ''}
              </table>
            </div>

            <!-- Credentials Box -->
            <div style="background-color: #0f111a; border: 1px solid #e11d48; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #f43f5e; text-transform: uppercase; letter-spacing: 0.05em;">
                🔐 Merchant Admin Portal Credentials
              </h3>
              <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">
                <strong>Admin Login Email:</strong> <span style="font-family: monospace; color: #ffffff;">${ownerEmail}</span>
              </div>
              <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
                <strong>Temporary Password:</strong> <span style="font-family: monospace; background: #1e2230; padding: 3px 8px; border-radius: 4px; color: #38bdf8;">${temporaryPassword}</span>
              </div>
              <a href="${adminLoginUrl}" style="display: block; text-align: center; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                Log In to Merchant Admin Portal →
              </a>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${storefrontUrl}" style="display: inline-block; background-color: #1e2230; border: 1px solid #475569; color: #cbd5e1; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                🏬 Visit Live Customer Storefront
              </a>
            </div>

            <!-- Getting Started Checklist -->
            <h4 style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">
              🚀 Getting Started Checklist:
            </h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
              <li>Log in to your merchant dashboard using the temporary credentials above.</li>
              <li>Upload your catalog products, images, and set your pricing.</li>
              <li>Customize your brand visual theme (logo, primary color, typography).</li>
              <li>Configure payment gateways and shipping methods in <strong>Settings</strong>.</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="background-color: #0f111a; border-top: 1px solid #2d3748; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px;">Mavenco Commerce Cloud • Multi-Tenant Enterprise Engine</p>
            <p style="margin: 0;">For 24/7 technical assistance, contact <a href="mailto:support@mavenco.com" style="color: #e11d48; text-decoration: none;">support@mavenco.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailDelivered = false;
    let deliveryMethod = 'none';
    let deliveryError = null;

    // 1. Try Nodemailer SMTP (Gmail, Brevo, SendGrid, Amazon SES, Custom SMTP)
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 587);
    const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || (smtpUser ? `"Mavenco Platform" <${smtpUser}>` : '"Mavenco Platform" <no-reply@mavenco.com>');

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost || 'smtp.gmail.com',
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: ownerEmail,
          subject: emailSubject,
          html: emailHtml,
        });

        emailDelivered = true;
        deliveryMethod = 'nodemailer_smtp';
      } catch (err: any) {
        console.error('SMTP delivery error:', err);
        deliveryError = err.message;
      }
    }

    // 2. Try Resend API if SMTP was not used or failed
    if (!emailDelivered) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Mavenco Platform <onboarding@resend.dev>',
              to: ownerEmail,
              subject: emailSubject,
              html: emailHtml,
            }),
          });
          if (res.ok) {
            emailDelivered = true;
            deliveryMethod = 'resend_api';
          } else {
            const errJson = await res.json();
            deliveryError = errJson.message || 'Resend API failed';
          }
        } catch (e: any) {
          console.warn('Resend dispatch error:', e);
          deliveryError = e.message;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        delivered: emailDelivered,
        deliveryMethod,
        deliveryError,
        message: emailDelivered
          ? `Activation email successfully sent to ${ownerEmail} via ${deliveryMethod}`
          : `Activation email formatted. Please configure SMTP credentials (SMTP_USER & SMTP_PASS) or RESEND_API_KEY to send directly to inboxes.`,
        emailDetails: {
          recipient: ownerEmail,
          storeName,
          slug,
          status,
          planName,
          temporaryPassword,
          adminLoginUrl,
          storefrontUrl,
          dispatchedAt: new Date().toISOString(),
        },
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch activation email' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
