// api/mail.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// ===== Config =====
const TO_EMAIL   = 'traivellerdev@outlook.com'; // jouw inbox
// TIP: na DKIM live kun je FROM_EMAIL zetten op 'TrAIveller.ai <noreply@traiveller.ai>'
const FROM_EMAIL = 'TrAIveller.ai <onboarding@resend.dev>';

// ===== Helpers =====
const escapeHtml = (s = '') =>
  s.replace(/[<>&"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const nl2br   = (s = '') => s.replace(/\r?\n/g, '<br>');
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isISODate = (s = '') => /^\d{4}-\d{2}-\d{2}$/.test(s); // 2025-10-01

// Simple in-memory rate limit (per serverless instance)
const RATE_LIMIT = { MAX: 3, WINDOW_MS: 5 * 60 * 1000 };
const hitMap = new Map();
function rateLimitAllow(ip) {
  const now = Date.now();
  const arr = (hitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT.WINDOW_MS);
  arr.push(now);
  hitMap.set(ip, arr);
  return arr.length <= RATE_LIMIT.MAX;
}

// ===== Clients =====
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

// Parse body (JSON of x-www-form-urlencoded)
async function parseBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const ct = (req.headers['content-type'] || '').toLowerCase();

  if (ct.includes('application/json')) return raw ? JSON.parse(raw) : {};
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
  // laatste poging
  return raw ? JSON.parse(raw) : {};
}

// ===== Handler =====
export default async function handler(req, res) {
  // CORS + security
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=()');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() || 'unknown';
  if (!rateLimitAllow(ip)) {
    return res.status(429).json({ success: false, error: 'Te veel verzoeken, probeer later opnieuw.' });
  }

  // Body
  let data;
  try {
    data = await parseBody(req);
  } catch {
    return res.status(400).json({ success: false, error: 'Ongeldig verzoekformaat.' });
  }

  // Honeypot (bots stil accepteren)
  if (data.company) return res.status(200).json({ success: true });

  // Velden
  const {
    name = 'Onbekend',
    email = '',
    message = '',
    date = '',
    return: ret = '',
    airport = '',
    destination = '',
    // nieuw
    budget = '',
    adults = '',
    children = '',
    trip_types = '',
    accommodation = '',
    transport_local = '',
  } = data || {};

  // Validatie
  if (!isEmail(email)) return res.status(400).json({ success: false, error: 'Ongeldig e-mailadres.' });
  if (!name || !airport || !destination || !date || !ret)
    return res.status(400).json({ success: false, error: 'Ontbrekende verplichte velden.' });
  if (!isISODate(date) || !isISODate(ret))
    return res.status(400).json({ success: false, error: 'Datums moeten YYYY-MM-DD zijn.' });
  if (!process.env.RESEND_API_KEY)
    return res.status(500).json({ success: false, error: 'Resend is niet geconfigureerd.' });
  if (!supabase) {
    // mail gaat door; DB optioneel
    console.warn('Supabase env ontbreekt (SUPABASE_URL / SUPABASE_SERVICE_ROLE) – oversla DB insert.');
  }

  try {
    // ===== Inhoud: admin mail =====
    const textBody = `Nieuwe intake van TrAIveller.ai

Naam: ${name}
E-mail: ${email}

Vertrekdatum: ${date}
Terugkomstdatum: ${ret}
Vertrekluchthaven: ${airport}
Bestemming/regio: ${destination}

Budget: €${budget}
Volwassenen: ${adults}, Kinderen: ${children}
Type reis: ${trip_types}
Accommodatie: ${accommodation}
Vervoer ter plaatse: ${transport_local}

Extra wensen:
${message}
`;

    const htmlBody = `
      <h2>📩 Nieuwe intake van TrAIveller.ai</h2>
      <p><strong>Naam:</strong> ${escapeHtml(name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Vertrekdatum:</strong> ${escapeHtml(date)}</p>
      <p><strong>Terugkomstdatum:</strong> ${escapeHtml(ret)}</p>
      <p><strong>Vertrekluchthaven:</strong> ${escapeHtml(airport)}</p>
      <p><strong>Bestemming/regio:</strong> ${escapeHtml(destination)}</p>
      <hr/>
      <p><strong>Budget:</strong> €${escapeHtml(String(budget))}</p>
      <p><strong>Volwassenen:</strong> ${escapeHtml(String(adults))}, <strong>Kinderen:</strong> ${escapeHtml(String(children))}</p>
      <p><strong>Type reis:</strong> ${escapeHtml(String(trip_types))}</p>
      <p><strong>Accommodatie:</strong> ${escapeHtml(String(accommodation))}</p>
      <p><strong>Vervoer ter plaatse:</strong> ${escapeHtml(String(transport_local))}</p>
      <hr/>
      <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(message || '—'))}</p>
    `;

    // ===== Inhoud: bevestiging naar klant =====
    const confirmText = `Bedankt ${name}!

We hebben je intake ontvangen en gaan ermee aan de slag.
Samenvatting:
- Vertrek: ${date} • Terug: ${ret}
- Vanaf: ${airport} • Bestemming/regio: ${destination}
- Budget: €${budget} • Reizigers (volw/kind): ${adults}/${children}
- Type reis: ${trip_types}
- Accommodatie: ${accommodation}
- Vervoer: ${transport_local}

Je kunt op deze mail antwoorden als je nog iets wilt aanvullen.
Team TrAIveller.ai
`;

    const confirmHtml = `
      <h2>Bedankt, ${escapeHtml(name)}! ✈️</h2>
      <p>We hebben je intake ontvangen en gaan ermee aan de slag. Hieronder een korte samenvatting.</p>
      <ul>
        <li><strong>Vertrek:</strong> ${escapeHtml(date)} — <strong>Terug:</strong> ${escapeHtml(ret)}</li>
        <li><strong>Vanaf:</strong> ${escapeHtml(airport)} — <strong>Bestemming/regio:</strong> ${escapeHtml(destination)}</li>
        <li><strong>Budget:</strong> €${escapeHtml(String(budget))} — <strong>Reizigers (volw/kind):</strong> ${escapeHtml(String(adults))}/${escapeHtml(String(children))}</li>
        <li><strong>Type reis:</strong> ${escapeHtml(String(trip_types))}</li>
        <li><strong>Accommodatie:</strong> ${escapeHtml(String(accommodation))}</li>
        <li><strong>Vervoer ter plaatse:</strong> ${escapeHtml(String(transport_local))}</li>
      </ul>
      <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(message || '—'))}</p>
      <p>Je kunt op deze mail <em>gewoon beantwoorden</em> als je nog iets wilt toevoegen.</p>
      <p>– Team TrAIveller.ai</p>
    `;

    // ===== Acties parallel: admin mail + klant mail + (optioneel) DB insert =====
    const tasks = [
      // naar jou (admin)
      resend.emails.send({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email || undefined,
        subject: `Nieuwe intake via TrAIveller.ai – ${name}`,
        text: textBody,
        html: htmlBody,
      }),
      // bevestiging naar klant
      resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
        text: confirmText,
        html: confirmHtml,
      }),
    ];

    if (supabase) {
      tasks.push(
        supabase.from('intakes').insert([
          {
            vertrek_datum: date || null,
            terug_datum: ret || null,
            bestemming: destination || null,
            vertrek_vanaf: airport || null,
            email: email || null,
            notes: message || null,
          },
        ])
      );
    }

    const results = await Promise.allSettled(tasks);

    // Controleer mail(s)
    const adminMail = results[0];
    const userMail = results[1];

    if (adminMail.status === 'rejected') {
      console.error('Resend admin mail error:', adminMail.reason);
      return res.status(500).json({ success: false, error: 'Fout bij versturen e-mail' });
    }
    if (userMail.status === 'rejected') {
      // Niet blokkeren voor de gebruiker, maar wel loggen
      console.error('Resend user mail error:', userMail.reason);
    }

    // DB fouten alleen loggen
    const dbResult = results[2];
    if (dbResult && dbResult.status === 'rejected') {
      console.error('Supabase insert error:', dbResult.reason);
    } else if (dbResult && dbResult.status === 'fulfilled' && dbResult.value?.error) {
      console.error('Supabase insert error:', dbResult.value.error);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Onverwachte fout:', err);
    return res.status(500).json({ success: false, error: 'Interne serverfout' });
  }
}






