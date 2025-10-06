// Edge Function: on-new-intake
// Triggered when new intake is submitted
// Sends email notification to admin

/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json()

    // Log the event
    console.log('New intake submission:', record.id)

    // Prepare email content
    const emailSubject = `🛫 New Travel Intake: ${record.bestemming || 'Unknown Destination'}`
    const emailBody = `
      <h2>New Travel Intake Submission</h2>

      <h3>Contact Information</h3>
      <p><strong>Name:</strong> ${record.full_name || 'Not provided'}</p>
      <p><strong>Email:</strong> ${record.email}</p>
      <p><strong>Phone:</strong> ${record.phone || 'Not provided'}</p>

      <h3>Travel Details</h3>
      <p><strong>Destination:</strong> ${record.bestemming || 'Not specified'}</p>
      <p><strong>Departure Date:</strong> ${record.vertrek_datum}</p>
      <p><strong>Return Date:</strong> ${record.terug_datum}</p>
      <p><strong>Budget:</strong> €${record.budget}</p>
      <p><strong>Travelers:</strong> ${record.adults} adults, ${record.children} children</p>
      <p><strong>Traveler Type:</strong> ${record.traveler_type}</p>

      <h3>Preferences</h3>
      <p><strong>Departure Airport:</strong> ${record.vertrek_vanaf}</p>
      <p><strong>Flight Class:</strong> ${record.cabin_class}</p>
      <p><strong>Car Rental:</strong> ${record.car_needed ? 'Yes' : 'No'}</p>
      <p><strong>Accommodation:</strong> ${record.accommodation_type}</p>
      <p><strong>Flexible Dates:</strong> ${record.flexible ? 'Yes' : 'No'}</p>

      ${record.notes ? `<h3>Notes</h3><p>${record.notes}</p>` : ''}

      <hr>
      <p><small>Submission ID: ${record.id}</small></p>
      <p><small>Submitted: ${new Date(record.created_at).toLocaleString()}</small></p>

      <p><a href="${Deno.env.get('SITE_URL')}/admin" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Dashboard</a></p>
    `

    // 1. Send admin notification email
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@traiveller.ai',
        to: ['mrharmain9@gmail.com'],
        subject: emailSubject,
        html: emailBody
      })
    })

    if (!adminEmailResponse.ok) {
      console.error('Failed to send admin email:', await adminEmailResponse.text())
    } else {
      console.log('Admin notification sent successfully')
    }

    // 2. Send customer confirmation email with travel options
    const customerName = record.full_name || 'Reiziger'
    const customerEmailSubject = 'Jouw TrAIveller.ai Reisopties 🌍✈️'
    const customerEmailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jouw TrAIveller.ai Reisopties</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; border-radius: 12px; color: white; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .trip-option { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0; border-left: 5px solid #f59e0b; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .trip-title { font-weight: bold; color: #1f2937; margin-bottom: 8px; font-size: 16px; }
          .trip-price { color: #059669; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
          .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4); }
          .emoji { font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌍 TrAIveller.ai</div>
            <h1 style="margin: 0; font-size: 24px;">Jouw Reisopties zijn klaar!</h1>
          </div>

          <p>Hoi ${customerName},</p>

          <p>Bedankt dat je TrAIveller.ai hebt gebruikt! <span class="emoji">🎉</span></p>

          <p><strong>Op basis van je intake hebben we 5 voorbeeld reisopties voor je samengesteld:</strong></p>

          <div class="trip-option">
            <div class="trip-title"><span class="emoji">✈️</span> Amsterdam → Barcelona – 5 nachten, Hotel 3★ – <span class="trip-price">€299 p.p.</span></div>
          </div>

          <div class="trip-option">
            <div class="trip-title"><span class="emoji">✈️</span> Amsterdam → Rome – 7 nachten, Appartement – <span class="trip-price">€399 p.p.</span></div>
          </div>

          <div class="trip-option">
            <div class="trip-title"><span class="emoji">✈️</span> Amsterdam → Gran Canaria – 10 nachten, All-Inclusive – <span class="trip-price">€699 p.p.</span></div>
          </div>

          <div class="trip-option">
            <div class="trip-title"><span class="emoji">✈️</span> Amsterdam → Athene – 7 nachten, Boutique Hotel – <span class="trip-price">€549 p.p.</span></div>
          </div>

          <div class="trip-option">
            <div class="trip-title"><span class="emoji">✈️</span> Amsterdam → Aruba – 14 nachten, Strandresort – <span class="trip-price">€1.299 p.p.</span></div>
          </div>

          <p>Je kunt deze opties ook direct bekijken op de resultatenpagina van onze website.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://traiveller.ai'}/results?id=${record.id}" class="button">
              Bekijk Online Resultaten
            </a>
          </div>

          <p>Wij wensen je alvast een geweldige reis! <span class="emoji">🌴</span></p>

          <div class="footer">
            <p><strong>— Het TrAIveller.ai Team</strong></p>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
              Dit is een automatisch gegenereerde email van TrAIveller.ai.<br>
              Heb je vragen? Reageer op deze email of bezoek onze website.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'info@traiveller.ai',
        to: [record.email],
        subject: customerEmailSubject,
        html: customerEmailBody
      })
    })

    if (!customerEmailResponse.ok) {
      console.error('Failed to send customer confirmation email:', await customerEmailResponse.text())
    } else {
      console.log('Customer confirmation email sent successfully')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})