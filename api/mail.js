// api/mail.js
import { Resend } from 'resend';

// -------- Config --------
const TO_EMAIL = 'traivellerdev@outlook.com'; // ontvanger
const FROM_EMAIL = 'TrAIveller.ai <noreply@traiveller.ai>'; // domein moet bij Resend geverifieerd zijn

// -------- Helpers --------
const escapeHtml = (s = '') =>
  s.replace(/[<>&"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const nl2br = (s = '') => s.replace(/\r?\n/g, '<br>');
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Eenvoudige in-memory rate limit (per serverless instance)
// max 3 verzoeken per 5 minuten per IP
const RATE_LIMIT = { MAX: 3, WINDOW_MS: 5 * 60 * 1000 };
const hitMap = new Map();
function rateLimitAllow(ip) {
  const now = Date.now();
  const arr = (hitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT.WINDOW_MS);
  arr.push(now);
  hitMap.set(ip, arr);
  return arr.length <= RATE_LIMIT.MAX;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // --- Rate limit ---
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || 'unknown';
  if (!rateLimitAllow(ip)) {
    return res.status(429).json({ success: false, error: 'Te veel verzoeken, probeer later opnieuw.' });
  }

  // --- Body parsing (JSON + form) ---
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const rawBody = Buffer.concat(chunks).toString();
  const ct = (req.headers['content-type'] || '').toLowerCase();

  let data = {};
  try {
    if (ct.includes('application/json')) {
      data = rawBody ? JSON.parse(rawBody) : {};
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(rawBody);
      data = Object.fromEntries(params.entries());
    }
  } catch {
    return res.status(400).json({ success: false, error: 'Ongeldig verzoekformaat.' });
  }

  // --- Honeypot: bots stilletjes negeren ---
  if (data.company) {
    return res.status(200).json({ success: true });
  }

  // --- Velden ---
  const {
    name = 'Onbekend',
    email = '',
    message = '',
    date = '',
    return: ret = '',
    airport = '',
    destination = ''
  } = data || {};

  // --- Validatie ---
  if (!isEmail(email)) {
    return res.status(400).json({ success: false, error: 'Ongeldig e-mailadres.' });
  }
  if (!date || !ret || !airport || !destination || !name) {
    return res.status(400).json({ success: false, error: 'Ontbrekende verplichte velden.' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: 'Resend is niet geconfigureerd.' });
  }

  try {
    // --- E-mail verzenden ---
    await resend.emails.send({
      from: FROM_EMAIL,            // domain verified bij Resend
      to: [TO_EMAIL],
      reply_to: email || undefined,
      subject: `Nieuwe intake via TrAIveller.ai – ${name}`,

      // Tekstversie (spamvriendelijk)
      text: `Nieuwe intake bij TrAIveller.ai

Naam: ${name}
E-mail: ${email}

Vertrek: ${date}
Terug: ${ret}
Vanaf: ${airport}
Bestemming: ${destination}

Bericht:
${message}

Verzonden op: ${new Date().toISOString()}
`,

      // HTML-versie (netjes opgemaakt)
      html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6ecf1">
      <div style="padding:20px 24px;border-bottom:1px solid #eef2f6">
        <h1 style="margin:0 0 4px 0;font-size:20px;">
          Nieuwe intake bij <span style="color:#0a66c2;">TrAIveller.ai</span>
        </h1>
        <p style="margin:0;color:#667085;font-size:13px;">Zojuist ontvangen • ${new Date().toLocaleString('nl-NL')}</p>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Naam</td>
            <td style="padding:12px 24px;font-size:14px;"><strong>${escapeHtml(name)}</strong></td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">E-mail</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Vertrek</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(date)}</td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Terug</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(ret)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Vertrek vanaf</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(airport)}</td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Bestemming</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(destination)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;vertical-align:top;">Bericht</td>
            <td style="padding:12px 24px;font-size:14px;line-height:1.5;">${nl2br(escapeHtml(message || '—'))}</td>
          </tr>
        </tbody>
      </table>

      <div style="padding:12px 24px;border-top:1px solid #eef2f6;color:#667085;font-size:12px;">
        Antwoorden kan direct via “Beantwoorden”. Deze melding is verzonden door TrAIveller.ai.
      </div>
    </div>
  </body>
</html>`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ success: false, error: 'Fout bij versturen e-mail' });
  }
}





