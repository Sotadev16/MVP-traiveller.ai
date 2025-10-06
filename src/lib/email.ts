import { Resend } from 'resend';

interface EmailData {
  customerName: string;
  email: string;
  tripOptions: TripOption[];
  language?: 'nl' | 'en';
}

interface TripOption {
  destination: string;
  duration: string;
  accommodation: string;
  price: number;
  departure: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_TRIP_OPTIONS: TripOption[] = [
  {
    destination: "Amsterdam → Barcelona",
    duration: "5 nachten",
    accommodation: "Hotel 3★",
    price: 299,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Rome",
    duration: "7 nachten",
    accommodation: "Appartement",
    price: 399,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Gran Canaria",
    duration: "10 nachten",
    accommodation: "All-Inclusive",
    price: 699,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Athens",
    duration: "7 nachten",
    accommodation: "Boutique Hotel",
    price: 549,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Aruba",
    duration: "14 nachten",
    accommodation: "Beach Resort",
    price: 1299,
    departure: "Amsterdam"
  }
];

const ENGLISH_TRIP_OPTIONS: TripOption[] = [
  {
    destination: "Amsterdam → Barcelona",
    duration: "5 nights",
    accommodation: "Hotel 3★",
    price: 299,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Rome",
    duration: "7 nights",
    accommodation: "Apartment",
    price: 399,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Gran Canaria",
    duration: "10 nights",
    accommodation: "All-Inclusive",
    price: 699,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Athens",
    duration: "7 nights",
    accommodation: "Boutique Hotel",
    price: 549,
    departure: "Amsterdam"
  },
  {
    destination: "Amsterdam → Aruba",
    duration: "14 nights",
    accommodation: "Beach Resort",
    price: 1299,
    departure: "Amsterdam"
  }
];

function generateDutchEmailContent(customerName: string, tripOptions: TripOption[]): { subject: string; html: string; text: string } {
  const subject = "Jouw TrAIveller.ai Reisopties 🌍✈️";

  const tripOptionsHtml = tripOptions.map(option =>
    `<li style="margin-bottom: 12px; color: #374151;">
      ✈️ ${option.destination} – ${option.duration}, ${option.accommodation} – €${option.price} p.p.
    </li>`
  ).join('');

  const tripOptionsText = tripOptions.map(option =>
    `✈️ ${option.destination} – ${option.duration}, ${option.accommodation} – €${option.price} p.p.`
  ).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jouw TrAIveller.ai Reisopties</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">TrAIveller.ai</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Jouw droomreis wacht op je! 🌴</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hoi ${customerName}!</h2>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Bedankt dat je TrAIveller.ai hebt gebruikt! 🎉<br>
            Op basis van je intake hebben we 5 voorbeeld reisopties voor je samengesteld:
          </p>

          <ul style="list-style: none; padding: 0; margin: 30px 0;">
            ${tripOptionsHtml}
          </ul>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong style="color: #374151;">📍 Volgende stappen:</strong><br>
              Je kunt deze opties ook direct bekijken op de resultatenpagina van onze website.
              Ons team neemt binnen 24-48 uur contact met je op voor meer gepersonaliseerde opties.
            </p>
          </div>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
            Wij wensen je alvast een geweldige reis! 🏖️✨
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            — Het TrAIveller.ai Team<br>
            <a href="mailto:info@traiveller.ai" style="color: #667eea; text-decoration: none;">info@traiveller.ai</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hoi ${customerName},

Bedankt dat je TrAIveller.ai hebt gebruikt! 🎉

Op basis van je intake hebben we 5 voorbeeld reisopties voor je samengesteld:

${tripOptionsText}

Je kunt deze opties ook direct bekijken op de resultatenpagina van onze website.

Wij wensen je alvast een geweldige reis! 🏖️

— Het TrAIveller.ai Team
info@traiveller.ai
  `.trim();

  return { subject, html, text };
}

function generateEnglishEmailContent(customerName: string, tripOptions: TripOption[]): { subject: string; html: string; text: string } {
  const subject = "Your TrAIveller.ai Trip Options 🌍✈️";

  const tripOptionsHtml = tripOptions.map(option =>
    `<li style="margin-bottom: 12px; color: #374151;">
      ✈️ ${option.destination} – ${option.duration}, ${option.accommodation} – €${option.price} p.p.
    </li>`
  ).join('');

  const tripOptionsText = tripOptions.map(option =>
    `✈️ ${option.destination} – ${option.duration}, ${option.accommodation} – €${option.price} p.p.`
  ).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your TrAIveller.ai Trip Options</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">TrAIveller.ai</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your dream trip awaits! 🌴</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hi ${customerName}!</h2>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Thank you for using TrAIveller.ai! 🎉<br>
            Based on your intake, here are 5 example travel options for you:
          </p>

          <ul style="list-style: none; padding: 0; margin: 30px 0;">
            ${tripOptionsHtml}
          </ul>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong style="color: #374151;">📍 Next steps:</strong><br>
              You can also view these options directly on our website results page.
              Our team will contact you within 24-48 hours for more personalized options.
            </p>
          </div>

          <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
            We wish you a wonderful journey ahead! 🏖️✨
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            — The TrAIveller.ai Team<br>
            <a href="mailto:info@traiveller.ai" style="color: #667eea; text-decoration: none;">info@traiveller.ai</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${customerName},

Thank you for using TrAIveller.ai! 🎉

Based on your intake, here are 5 example travel options for you:

${tripOptionsText}

You can also view these options directly on our website results page.

We wish you a wonderful journey ahead! 🏖️

— The TrAIveller.ai Team
info@traiveller.ai
  `.trim();

  return { subject, html, text };
}

export async function sendTripOptionsEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { customerName, email, language = 'nl' } = emailData;
    const tripOptions = language === 'nl' ? DEFAULT_TRIP_OPTIONS : ENGLISH_TRIP_OPTIONS;

    const { subject, html, text } = language === 'nl'
      ? generateDutchEmailContent(customerName, tripOptions)
      : generateEnglishEmailContent(customerName, tripOptions);

    const result = await resend.emails.send({
      from: 'TrAIveller.ai <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
      text,
      headers: {
        'X-Entity-Ref-ID': Date.now().toString(),
      },
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return {
        success: false,
        error: result.error.message || 'Email sending failed'
      };
    }

    console.log('Email sent successfully:', result.data?.id);
    return { success: true };

  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}

export async function testEmailService(): Promise<{ success: boolean; error?: string }> {
  try {
    const testResult = await sendTripOptionsEmail({
      customerName: 'Test User',
      email: 'test@example.com',
      tripOptions: DEFAULT_TRIP_OPTIONS,
      language: 'nl'
    });

    return testResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    };
  }
}