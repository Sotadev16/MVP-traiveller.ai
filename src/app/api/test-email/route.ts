import { NextRequest, NextResponse } from 'next/server';
import { sendTripOptionsEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, language } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Testing email service...');
    console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);

    const result = await sendTripOptionsEmail({
      customerName: customerName || 'Test User',
      email,
      tripOptions: [],
      language: language || 'nl'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        emailSent: true
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        emailSent: false
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailSent: false
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test email sending',
    requiredFields: ['email'],
    optionalFields: ['customerName', 'language']
  });
}