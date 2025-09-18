// FILE: api/mail.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = req.body || {};
  if (body.website) return res.status(400).json({ ok: false, error: 'Bot detected' }); // honeypot
  if (!body.name || !body.email) return res.status(400).json({ ok: false, error: 'Naam en e-mail verplicht' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
  const insertPayload = {
    name: body.name,
    email: body.email,
    trip_mode: body.trip_mode || '',
    destination: body.destination || body.destinations || '',
    cruise_region: body.cruise_region || '',
    payload: body,
  };
  const { data, error } = await supabase.from('intakes').insert(insertPayload).select().single();
  if (error) return res.status(500).json({ ok: false, error: error.message });

  // Build admin mail as HTML table
  const tableRows = Object.entries(body)
    .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${String(v)}</td></tr>`)
    .join('');
  const adminHtml = `<h2>Nieuwe intake</h2><table border="1" cellpadding="6">${tableRows}</table>`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: `Nieuwe intake: ${body.name} (${body.trip_mode})`,
      html: adminHtml,
    });
    if (process.env.SEND_USER_CONFIRMATION !== 'false') {
      const userText = `Beste ${body.name},

Bedankt voor je aanvraag bij TrAIveller.ai.

We hebben de volgende gegevens ontvangen:
- Reisvorm: ${body.trip_mode}
- Bestemming / Cruisegebied: ${body.destination || body.cruise_region}
- Periode: ${body.start_date || '?'} t/m ${body.end_date || '?'}
- Aantal volwassenen: ${body.adults || 'nvt'}
- Kinderen: ${body.children || '0'}
- Budget: ${body.budget || body.budget_custom || 'nvt'}

We nemen spoedig contact met je op.

Groet,  
Team TrAIveller.ai`;

      await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: body.email,
        subject: 'Bevestiging – jouw aanvraag bij TrAIveller.ai',
        text: userText,
      });
    }
  } catch (mailErr) {
    return res.status(200).json({ ok: true, saved: data, mailWarning: mailErr.message });
  }

  return res.status(200).json({ ok: true, saved: data });
}
