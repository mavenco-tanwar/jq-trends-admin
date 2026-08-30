import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// POST: Superadmin resets password or merchant requests password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, customPassword, requestedBy = 'superadmin' } = body;

    if (!slug && !email) {
      return NextResponse.json(
        { error: 'slug or email is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanSlug = slug ? slug.toLowerCase().trim() : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const db = await getDatabase();
    let tenantDoc: any = null;

    if (db) {
      if (cleanSlug) {
        tenantDoc = await db.collection('tenants').findOne({ slug: cleanSlug });
      }
      if (!tenantDoc && cleanEmail) {
        tenantDoc = await db.collection('tenants').findOne({
          $or: [
            { ownerEmail: cleanEmail },
            { 'contact.email': cleanEmail },
          ],
        });
      }
    }

    const targetSlug = tenantDoc?.slug || cleanSlug || 'store';
    const targetEmail = tenantDoc?.ownerEmail || tenantDoc?.contact?.email || cleanEmail;
    const storeName = tenantDoc?.name || targetSlug.toUpperCase();

    // Generate or use custom password
    const newPassword =
      customPassword || `Mavenco@${new Date().getFullYear()}!${Math.floor(1000 + Math.random() * 9000)}`;

    // Save updated password in MongoDB Atlas
    if (db && (tenantDoc?.slug || cleanSlug)) {
      await db.collection('tenants').updateOne(
        { slug: tenantDoc?.slug || cleanSlug },
        {
          $set: {
            temporaryPassword: newPassword,
            isTemporaryPassword: true,
            passwordUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }

    const adminLoginUrl = `https://mavenco-admin.vercel.app/login?tenant=${targetSlug}&email=${encodeURIComponent(targetEmail)}`;

    // Dispatch Email via Gmail SMTP / Resend
    let emailDelivered = false;
    let deliveryMethod = 'none';

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || 'ammar.tanwar.dev@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'ubup gwkg sbeo bldb';
    const smtpPort = Number(process.env.SMTP_PORT || 465);

    const emailSubject = `🔐 Password Reset & Temporary Credentials: ${storeName}`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d0f17; color: #ffffff; padding: 30px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #161822; border: 1px solid #2d3748; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; text-align: center;">
            <h2 style="margin: 0; color: #ffffff; font-size: 20px; text-transform: uppercase;">MAVENCO COMMERCE</h2>
            <p style="margin: 4px 0 0; color: #ffe4e6; font-size: 13px;">Merchant Password Reset &amp; Security</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
              A temporary password has been generated for your merchant store <strong style="color:#ffffff;">${storeName}</strong> (${targetSlug}).
            </p>
            <div style="background-color: #0f111a; border: 1px solid #e11d48; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">
                <strong>Merchant Login Email:</strong> <span style="color:#ffffff; font-family:monospace;">${targetEmail}</span>
              </div>
              <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
                <strong>New Temporary Password:</strong> <span style="background: #1e2230; padding: 4px 10px; border-radius: 4px; color: #38bdf8; font-family:monospace; font-weight: bold;">${newPassword}</span>
              </div>
              <a href="${adminLoginUrl}" style="display: block; text-align: center; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                Log In &amp; Change Password →
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              Requested by: ${requestedBy}. Please change this temporary password upon logging into your store settings.
            </p>
          </div>
        </div>
      </div>
    `;

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Mavenco Security" <${smtpUser}>`,
        to: targetEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      emailDelivered = true;
      deliveryMethod = 'nodemailer_smtp';
    } catch (err: any) {
      console.error('Password reset email error:', err);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Password reset successfully! Dispatched to ${targetEmail}`,
        emailDelivered,
        deliveryMethod,
        credentials: {
          storeName,
          slug: targetSlug,
          email: targetEmail,
          temporaryPassword: newPassword,
          adminLoginUrl,
          resetAt: new Date().toISOString(),
        },
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

// PATCH: Merchant changes their own temporary password to permanent
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanSlug = slug ? slug.toLowerCase().trim() : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const db = await getDatabase();
    if (db && (cleanSlug || cleanEmail)) {
      await db.collection('tenants').updateOne(
        { $or: [{ slug: cleanSlug }, { ownerEmail: cleanEmail }] },
        {
          $set: {
            password: newPassword,
            isTemporaryPassword: false,
            passwordUpdatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          $unset: { temporaryPassword: '' },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Permanent password set successfully! You can now log in with your new password.',
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
