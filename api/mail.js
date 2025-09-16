// /api/mail.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// ===== Config =====
const TO_EMAIL   = process.env.TO_EMAIL || 'traivellerdev@outlook.com';  // admin inbox
const FROM_EMAIL = process.env.FROM_EMAIL || 'TrAIveller.ai <onboarding@resend.dev>'; // zet hier je geverifieerde domein-sender

// ===== Helpers =====
const escapeHtml = (s = '') =>
  s.replace(/[<>&"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

const nl2br = (s = '') => s.replace(/\n?/g, '').replace(/\n/g, '<br/>');

const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

const isISODate = (s = '') => /^\d{4}-\d{2}-\d{2}$/.test(s);

// ===== Very light IP rate-limit (in-memory; per serverless instance) =====
const RATE_LIMIT = { MAX: 3, WINDOW_MS: 5 * 60 * 1000 }; // 3 requests per 5 min
const hitMap = new Map();
function rateLimitAllow(ip) {
  const now = Date.now();
  const arr = (hitMap.get(ip) || []).filter((t) => now - t < RATE_LIMIT.WINDOW_MS);
  arr.push(now);
  hitMap.set(ip, arr);
  return arr.length <= RATE_LIMIT.MAX;
}

function getIP(req) {
  const xf = (req.headers['x-forwarded-for'] || '').toString();
  return (xf.split(',')[0] || '').trim() || req.socket?.remoteAddress || 'unknown';
}

// Robust body parser: JSON or form-urlencoded
async function parseBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const ct = (req.headers['content-type'] || '').toLowerCase();

  if (ct.includes('application/json')) {
    return raw ? JSON.parse(raw) : {};
  }
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
  // laatste poging
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ===== Clients =====
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Rate limit
  const ip = getIP(req);
  if (!rateLimitAllow(ip)) {
    return res.status(429).json({ success: false, error: 'Te veel verzoeken, probeer later opnieuw.' });
  }

  // Parse body
  let data;
  try {
    data = await parseBody(req);
  } catch {
    return res.status(400).json({ success: false, error: 'Ongeldig verzoekformaat.' });
  }

  // Honeypot (optioneel veld "company"): als ingevuld, doe alsof OK om bots te laten wegvallen
  if (data.company) {
    return res.status(200).json({ success: true });
  }

  // ===== Velden =====
 // ===== Velden =====
const {
  name = '',
  email = '',
  message = '',
  date = '',
  return: ret = '',
  airport = '',
  destination = '',
  budget = '',
  adults = '',
  children = '',
  trip_types = '',
  accommodation = '',
  transport_local = '',
  children_ages = ''    // 👈 NIEUW: CSV "4,7,12" vanuit het formulier
} = data || {};

  // ===== Validatie =====
  // ==== Combineer notes: message + leeftijden ====
const combinedNotes = [
  (message || '').trim(),
  (children_ages && String(children_ages).trim())
    ? `Leeftijden kinderen: ${String(children_ages).trim()}`
    : ''
].filter(Boolean).join('\n');

  if (!isEmail(email)) return res.status(400).json({ success: false, error: 'Ongeldig e-mailadres.' });
  if (!name || !airport || !destination || !date || !ret) {
    return res.status(400).json({ success: false, error: 'Ontbrekende verplichte velden.' });
  }
  if (!isISODate(date) || !isISODate(ret)) {
    return res.status(400).json({ success: false, error: 'Datums moeten formaat YYYY-MM-DD hebben.' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: 'Resend is niet geconfigureerd.' });
  }
  if (!supabase) {
    console.warn('Supabase ENV mist (SUPABASE_URL / SUPABASE_SERVICE_ROLE) — DB insert wordt overgeslagen.');
  }
  // ===== Combineer notes: message + leeftijden kinderen =====
const combinedNotes = [
  (message || '').trim(),
  (children_ages && String(children_ages).trim())
    ? `Leeftijden kinderen: ${String(children_ages).trim()}`
    : ''
].filter(Boolean).join('\n');

  // ===== Email content =====
  const textBody =
`Nieuwe intake van TrAIveller.ai

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
    <h2>✈️ Nieuwe intake van TrAIveller.ai</h2>
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
    <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(message || '--'))}</p>
  `;

  // Bevestiging naar klant
  const confirmText =
`Bedankt, ${name}!

We hebben je intake ontvangen en gaan ermee aan de slag. Hieronder een korte samenvatting.

Vertrek: ${date}  •  Terug: ${ret}
Vanaf: ${airport}  •  Bestemming/regio: ${destination}
Budget: €${budget}  •  Reizigers (volw/kind): ${adults}/${children}
Type reis: ${trip_types}
Accommodatie: ${accommodation}
Vervoer: ${transport_local}

Je kunt op deze mail antwoorden als je nog iets wilt toevoegen.

— Team TrAIveller.ai`;

  const confirmHtml = `
    <h2>Bedankt, ${escapeHtml(name)}! ✨</h2>
    <p>We hebben je intake ontvangen en gaan ermee aan de slag. Hieronder een korte samenvatting.</p>
    <ul>
      <li><strong>Vertrek:</strong> ${escapeHtml(date)} &nbsp;•&nbsp; <strong>Terug:</strong> ${escapeHtml(ret)}</li>
      <li><strong>Vanaf:</strong> ${escapeHtml(airport)} &nbsp;•&nbsp; <strong>Bestemming/regio:</strong> ${escapeHtml(destination)}</li>
      <li><strong>Budget:</strong> €${escapeHtml(String(budget))} &nbsp;•&nbsp; <strong>Reizigers (volw/kind):</strong> ${escapeHtml(String(adults))}/${escapeHtml(String(children))}</li>
      <li><strong>Type reis:</strong> ${escapeHtml(String(trip_types))}</li>
      <li><strong>Accommodatie:</strong> ${escapeHtml(String(accommodation))}</li>
      <li><strong>Vervoer:</strong> ${escapeHtml(String(transport_local))}</li>
    </ul>
    <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(message || '--'))}</p>
    <p>Je kunt op deze mail antwoorden als je nog iets wilt toevoegen.</p>
    <p>— Team TrAIveller.ai</p>
  `;

  try {
    // ===== Acties parallel: admin-mail + klant-mail + (optioneel) DB insert =====
    const tasks = [
      // Admin
      resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        reply_to: email || undefined,
        subject: `Nieuwe intake via TrAIveller.ai – ${name}`,
        text: textBody,
        html: htmlBody,
      }),
      // Klant
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
        text: confirmText,
        html: confirmHtml,
      }),
    ];

    if (supabase) {
  tasks.push(
    supabase.from('intakes').insert([{
      // id en created_at worden automatisch gezet door Supabase
      email: email || null,
      vertrek_datum: date || null,
      terug_datum: ret || null,
      vertrek_vanaf: airport || null,
      bestemming: destination || null,
      budget: budget || null,
      personen: (adults || children)
        ? Number(adults || 0) + Number(children || 0)
        : null,
      notes: combinedNotes || null,   // 👈 altijd message + evt. leeftijden
      vervoer: transport_local || null,
      ip: ip || null,

      // optioneel — alleen laten staan als deze kolommen in je DB bestaan
      halal: null,
      vlucht_type: null,
      dieet_voorkeuren: null,
    }])
  );
}

    await Promise.all(tasks);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('MAIL/API ERROR:', err);
    // Toon nette fout, log detail in console
    return res.status(500).json({ success: false, error: 'Er ging iets mis bij verzenden of opslaan.' });
  }
}







