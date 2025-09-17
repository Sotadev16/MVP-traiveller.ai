// api/mail.js
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL || 'TrAIveller.ai <no-reply@traiveller.ai>';
const ADMIN = process.env.TO_EMAIL || 'traivellerdev@outlook.com';

// Common CORS helper (if you post from a different origin)
const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      name = 'Onbekend',
      email = '',             // customer email
      budget = '',
      airport = '',
      destination = '',
      departDate = '',
      returnDate = '',
      notes = '',
    } = data || {};

    // Build the HTML safely
    const esc = (s = '') => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    const html = `
      <h2>Nieuwe TrAIveller intake</h2>
      <p><b>Naam:</b> ${esc(name)}</p>
      <p><b>E-mail:</b> ${esc(email)}</p>
      <p><b>Budget:</b> €${esc(budget)}</p>
      <p><b>Vertrek vanaf:</b> ${esc(airport)}</p>
      <p><b>Bestemming:</b> ${esc(destination)}</p>
      <p><b>Vertrek:</b> ${esc(departDate)}</p>
      <p><b>Terug:</b> ${esc(returnDate)}</p>
      <p><b>Notities:</b><br/>${esc(notes).replaceAll('\n','<br/>')}</p>
    `;

    // 1) Send internal copy to Admin
    if (resend) {
      await resend.emails.send({
        from: FROM,
        to: ADMIN,
        subject: `Nieuwe intake – ${name || 'Onbekend'}`,
        html,
        reply_to: email || undefined,
      });
    } else {
      console.warn('RESEND_API_KEY missing. Admin mail skipped.');
    }

    // 2) Send confirmation to Customer (only if they provided an email)
    //    Keep FROM verified; use reply_to for two-way
    if (resend && email) {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: 'Bevestiging – we hebben je intake ontvangen ✅',
        html: `
          <p>Hoi ${esc(name)},</p>
          <p>Bedankt! We hebben je gegevens ontvangen en gaan voor je speuren naar de beste deals.</p>
          <hr/>
          ${html}
          <p>— Team TrAIveller.ai</p>
        `,
        reply_to: ADMIN, // if customer hits reply, it lands at your admin inbox
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ ok: false, error: err?.message || 'Unknown error' });
  }
}














