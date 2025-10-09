import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email allowlist
const ADMIN_EMAILS = [
  'admin@traiveller.ai',
  'adziyodevops@gmail.com',
  'harry@traiveller.ai',
  'mrharmain9@gmail.com'
];

async function checkAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { isAdmin: false, user: null };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { isAdmin: false, user: null };
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email || '') ||
                   (user.email && user.email.includes('admin'));

    return { isAdmin, user };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAdmin: false, user: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth(request);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intake_id, client_email, client_name, destination, travel_dates } = await request.json();

    if (!client_email || !client_name) {
      return NextResponse.json({ error: 'Client email and name are required' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
    }

    // Send quote email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Traiveller.ai <quotes@traiveller.ai>',
      to: [client_email],
      subject: `Your Travel Quote - ${destination}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Your Personal Travel Quote</h2>

          <p>Dear ${client_name},</p>

          <p>Thank you for your interest in traveling to <strong>${destination}</strong>!</p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Trip Details</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Destination:</strong> ${destination}</li>
              <li><strong>Travel Dates:</strong> ${travel_dates}</li>
              <li><strong>Quote Reference:</strong> #${intake_id?.slice(-8) || 'TRV-001'}</li>
            </ul>
          </div>

          <p>Our travel experts are currently working on creating a personalized quote for your trip. You can expect to receive a detailed proposal within 24-48 hours.</p>

          <p>Your quote will include:</p>
          <ul>
            <li>✈️ Flight options and recommendations</li>
            <li>🏨 Carefully selected accommodations</li>
            <li>🚗 Transportation arrangements (if requested)</li>
            <li>🎯 Activities and experiences tailored to your preferences</li>
            <li>💰 Transparent pricing with no hidden fees</li>
          </ul>

          <p>If you have any questions or would like to discuss your trip requirements further, please don't hesitate to contact us.</p>

          <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Need immediate assistance?</strong></p>
            <p style="margin: 5px 0 0 0;">Reply to this email or contact us at <a href="mailto:hello@traiveller.ai">hello@traiveller.ai</a></p>
          </div>

          <p>We're excited to help you create unforgettable travel memories!</p>

          <p>Best regards,<br>
          The Traiveller.ai Team</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent by Traiveller.ai. If you no longer wish to receive emails from us,
            please <a href="#" style="color: #6b7280;">unsubscribe here</a>.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      email_id: data?.id
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}