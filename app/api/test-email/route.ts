import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = (process.env.EMAIL_API_KEY || '').replace(/^﻿/, '').trim();
  const fromEmail = (process.env.EMAIL_FROM || 'onboarding@resend.dev').replace(/^﻿/, '').trim();

  if (!apiKey || apiKey === 'placeholder') {
    return NextResponse.json({ error: 'EMAIL_API_KEY is not set' }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: ['sanpedrobeach9@gmail.com'],
      subject: 'CC Incident System — Email Test',
      html: '<p>This is a test email from the CC Incident Management System. If you received this, email alerts are working correctly.</p>',
    });

    return NextResponse.json({
      success: true,
      result,
      from: fromEmail,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      error: msg,
      from: fromEmail,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
    }, { status: 500 });
  }
}
