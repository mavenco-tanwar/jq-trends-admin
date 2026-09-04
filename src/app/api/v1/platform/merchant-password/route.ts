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
        tenantDoc = await db.collection('tenants').findOne({
          $or: [
            { slug: cleanSlug },
            { id: cleanSlug },
            { id: `store_${cleanSlug}` },
          ],
        });
      }
      if (!tenantDoc && cleanEmail) {
        tenantDoc = await db.collection('tenants').findOne({
          $or: [
            { ownerEmail: cleanEmail },
            { 'contact.email': cleanEmail },
            { email: cleanEmail },
          ],
        });
      }
      if (!tenantDoc && cleanSlug) {
        tenantDoc = await db.collection('platform_tenants_registry').findOne({
          $or: [
            { slug: cleanSlug },
            { id: cleanSlug },
            { tenantId: cleanSlug },
          ],
        });
      }
    }

    const targetSlug = tenantDoc?.slug || cleanSlug || 'store';
    const targetEmail = (tenantDoc?.ownerEmail || tenantDoc?.contact?.email || cleanEmail).toLowerCase().trim();
    const storeName = tenantDoc?.name || targetSlug.toUpperCase();
    const now = new Date().toISOString();

    // Generate or use custom password
    const newPassword =
      customPassword || `Mavenco@${new Date().getFullYear()}!${Math.floor(1000 + Math.random() * 9000)}`;

    // Save updated password across MongoDB Atlas (tenants, platform_tenants_registry, users)
    if (db) {
      const tenantMatchConditions: any[] = [];
      if (targetSlug) {
        tenantMatchConditions.push({ slug: targetSlug });
        tenantMatchConditions.push({ id: targetSlug });
        tenantMatchConditions.push({ id: `store_${targetSlug}` });
      }
      if (targetEmail) {
        tenantMatchConditions.push({ ownerEmail: targetEmail });
        tenantMatchConditions.push({ 'contact.email': targetEmail });
        tenantMatchConditions.push({ email: targetEmail });
      }

      const updateData = {
        password: newPassword,
        temporaryPassword: newPassword,
        isTemporaryPassword: true,
        passwordUpdatedAt: now,
        updatedAt: now,
      };

      if (tenantMatchConditions.length > 0) {
        // 1. Synchronize 'tenants' collection
        await db.collection('tenants').updateMany(
          { $or: tenantMatchConditions },
          { $set: updateData }
        );

        // 2. Synchronize 'platform_tenants_registry'
        await db.collection('platform_tenants_registry').updateMany(
          { $or: tenantMatchConditions },
          { $set: updateData }
        );
      }

      // 3. Upsert into 'users' collection so merchant can immediately authenticate
      if (targetEmail) {
        await db.collection('users').updateOne(
          { email: targetEmail },
          {
            $set: {
              email: targetEmail,
              name: tenantDoc?.ownerName || tenantDoc?.name || storeName || 'Store Owner',
              password: newPassword,
              temporaryPassword: newPassword,
              isTemporaryPassword: true,
              tenantSlug: targetSlug,
              tenantId: tenantDoc?.id || `store_${targetSlug}`,
              roleId: 'role_owner',
              role: 'owner',
              roleName: 'Store Owner & Administrator',
              status: 'active',
              passwordUpdatedAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              id: `user_${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              createdAt: now,
            },
          },
          { upsert: true }
        );
      }

      // Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Merchant password reset & updated for store ${targetSlug} (${targetEmail})`,
        actor: requestedBy,
        tenantId: targetSlug,
        tenantName: storeName,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || process.env.ADMIN_URL || 'https://mavenco-admin.vercel.app';
    const adminLoginUrl = `${adminBaseUrl}/login?tenant=${targetSlug}&email=${encodeURIComponent(targetEmail)}`;

    // Dispatch Email via Gmail SMTP / Resend
    let emailDelivered = false;
    let deliveryMethod = 'none';

    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || 465);

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

    if (smtpUser && smtpPass) {
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
          resetAt: now,
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
    const { slug, email, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanSlug = slug ? slug.toLowerCase().trim() : '';
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const now = new Date().toISOString();

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503, headers: corsHeaders() }
      );
    }

    const matchConditions = [];
    if (cleanSlug) {
      matchConditions.push({ slug: cleanSlug });
      matchConditions.push({ id: cleanSlug });
      matchConditions.push({ id: `store_${cleanSlug}` });
    }
    if (cleanEmail) {
      matchConditions.push({ ownerEmail: cleanEmail });
      matchConditions.push({ 'contact.email': cleanEmail });
      matchConditions.push({ email: cleanEmail });
    }

    const updatePayload = {
      password: newPassword,
      temporaryPassword: newPassword,
      isTemporaryPassword: false,
      passwordUpdatedAt: now,
      updatedAt: now,
    };

    if (matchConditions.length > 0) {
      // 1. Update in tenants collection
      await db.collection('tenants').updateMany(
        { $or: matchConditions },
        { $set: updatePayload }
      );

      // 2. Update in platform_tenants_registry
      await db.collection('platform_tenants_registry').updateMany(
        { $or: matchConditions },
        { $set: updatePayload }
      );

      // 3. Update or upsert in users collection
      const userConditions = [];
      if (cleanEmail) userConditions.push({ email: cleanEmail });
      if (cleanSlug) userConditions.push({ tenantSlug: cleanSlug });

      if (userConditions.length > 0) {
        await db.collection('users').updateMany(
          { $or: userConditions },
          { $set: updatePayload }
        );
      }

      if (cleanEmail) {
        await db.collection('users').updateOne(
          { email: cleanEmail },
          {
            $set: {
              ...updatePayload,
              ...(cleanSlug ? { tenantSlug: cleanSlug, tenantId: `store_${cleanSlug}` } : {}),
            },
            $setOnInsert: {
              id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              name: 'Store Administrator',
              roleId: 'role_owner',
              role: 'owner',
              roleName: 'Store Owner & Administrator',
              status: 'active',
              createdAt: now,
            },
          },
          { upsert: true }
        );
      }

      // Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Merchant password updated to permanent for store ${cleanSlug || cleanEmail}`,
        actor: cleanEmail || 'merchant',
        tenantId: cleanSlug || 'store',
        tenantName: cleanSlug || cleanEmail,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Permanent password updated successfully in database! You can now log in with your new password.',
      },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
