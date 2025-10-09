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

  const tripOptionsHtml = tripOptions.map((option, index) =>
    `<tr>
      <td style="padding: 15px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #fef3c7, #fbbf24); border-radius: 12px; padding: 20px; margin: 8px 0; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 40px; vertical-align: top;">
                    <div style="background: #f59e0b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                      ${index + 1}
                    </div>
                  </td>
                  <td style="padding-left: 15px;">
                    <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 18px; font-weight: bold;">
                      ✈️ ${option.destination}
                    </h3>
                    <p style="margin: 0; color: #b45309; font-size: 15px; line-height: 1.4;">
                      ${option.duration} • ${option.accommodation}
                    </p>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="background: #059669; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 16px;">
                      €${option.price} p.p.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
  ).join('');

  const tripOptionsText = tripOptions.map(option =>
    `✈️ ${option.destination} – ${option.duration}, ${option.accommodation} – €${option.price} p.p.`
  ).join('\n');

  const html = `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Jouw TrAIveller.ai Reisopties</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f8fafc; width: 100% !important; min-width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

      <!-- Preheader text -->
      <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Jouw gepersonaliseerde reisopties van TrAIveller.ai zijn klaar! Bekijk je droomvakantie opties.
      </div>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          🌍 TrAIveller.ai
                        </h1>
                        <p style="color: #fef3c7; margin: 15px 0 0 0; font-size: 18px; font-weight: 500;">
                          Jouw droomreis wacht op je! ✈️
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="background: white; padding: 50px 40px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">

                    <!-- Greeting -->
                    <tr>
                      <td>
                        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">
                          Hoi ${customerName}! 👋
                        </h2>

                        <p style="color: #4b5563; font-size: 18px; margin-bottom: 30px; line-height: 1.7;">
                          Bedankt dat je TrAIveller.ai hebt gebruikt! 🎉<br>
                          <strong>Op basis van je intake hebben we 5 prachtige reisopties voor je samengesteld:</strong>
                        </p>
                      </td>
                    </tr>

                    <!-- Trip Options -->
                    <tr>
                      <td style="padding: 30px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                          ${tripOptionsHtml}
                        </table>
                      </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="background: linear-gradient(135deg, #f59e0b, #f97316); border-radius: 12px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);">
                              <a href="https://traiveller.ai/results" style="display: inline-block; padding: 18px 36px; color: white; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 12px;">
                                🎯 Bekijk Online Resultaten
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Next Steps -->
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #fef9e7; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 20px 0;">
                          <tr>
                            <td>
                              <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: 600;">
                                🚀 Volgende stappen:
                              </p>
                              <p style="margin: 10px 0 0 0; color: #b45309; font-size: 15px; line-height: 1.6;">
                                Je kunt deze opties ook direct bekijken op de resultatenpagina van onze website.
                                <strong>Ons team neemt binnen 24-48 uur contact met je op</strong> voor meer gepersonaliseerde opties en verdere assistentie.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Closing -->
                    <tr>
                      <td>
                        <p style="color: #4b5563; font-size: 18px; margin: 30px 0; text-align: center; line-height: 1.7;">
                          Wij wensen je alvast een <strong>geweldige reis</strong>! 🏖️✨
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 40px 30px; text-align: center; background: #f9fafb; border-radius: 0 0 16px 16px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <p style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">
                          — Het TrAIveller.ai Team
                        </p>
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
                          <a href="mailto:info@traiveller.ai" style="color: #f59e0b; text-decoration: none; font-weight: 500;">info@traiveller.ai</a> |
                          <a href="https://traiveller.ai" style="color: #f59e0b; text-decoration: none; font-weight: 500;">traiveller.ai</a>
                        </p>

                        <!-- Unsubscribe -->
                        <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0; line-height: 1.5;">
                          Dit is een bevestigingsmail voor jouw reisaanvraag.<br>
                          TrAIveller.ai | Amsterdam, Nederland<br>
                          <a href="#" style="color: #9ca3af; text-decoration: underline;">Voorkeuren beheren</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
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
      from: 'TrAIveller.ai <info@traiveller.ai>',
      to: [email],
      subject,
      html,
      text,
      replyTo: 'info@traiveller.ai',
      headers: {
        'X-Entity-Ref-ID': Date.now().toString(),
        'X-Priority': '3',
        'X-Mailer': 'TrAIveller.ai',
        'List-Unsubscribe': '<mailto:unsubscribe@traiveller.ai>',
        'List-Id': 'TrAIveller.ai Trip Confirmations <trips.traiveller.ai>',
        'Message-ID': `<${Date.now()}-${Math.random().toString(36).substring(2, 11)}@traiveller.ai>`,
      },
      tags: [
        { name: 'type', value: 'trip-confirmation' },
        { name: 'language', value: language },
      ],
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