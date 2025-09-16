// /api/mail.js — compact & robust handler (Vercel/Node ESM)

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

/* ========= ENV & Clients ========= */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Supabase is optioneel: als URL of SERVICE_ROLE ontbreekt, slaan we DB insert over
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

// naar wie stuur je de admin-mail?
const TO_EMAIL = process.env.TO_EMAIL || 'travellerdev@outlook.com';
// vanaf welk adres stuur je mail (moet bij Resend geverifieerd zijn)
const FROM_EMAIL =
  process.env.FROM_EMAIL || 'TrAIveller.ai <noreply@traiveller.ai>';

/* ========= Helpers ========= */
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isISODate = (s = '') => /^\d{4}-\d{2}-\d{2}$/.test(s);
const escapeHtml = (s = '') =>
  String(s).replace(/[<>&"']/g, (m) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[m]));
const nl2br = (s = '') => String(s).replace(/\n/g, '<br/>');
const getIP = (req) =>
  (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  null;

/* ========= Handler ========= */
export default async function handler(req, res) {
  // CORS (veilig voor hetzelfde domein, en handig bij lokale tests)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const mode = resend && (TO_EMAIL || FROM_EMAIL) ? 'LIVE' : 'SAFE';

  try {
    const data = req.body || {};
    const {
      name = '',
      email = '',
      message = '',
      date = '',       // vertrek YYYY-MM-DD
      return: ret = '', // terug YYYY-MM-DD
      airport = '',
      destination = '',
      budget = null,
      adults = 0,
      children = 0,
      trip_types = '',
      accommodation = '',
      transport_local = '',
      children_ages = '', // bv "4,7,12"
    } = data;

    // notes = message + leeftijden
    const combinedNotes = [String(message || '').trim()]
      .concat(children_ages ? [`Leeftijden kinderen: ${String(children_ages).trim()}`] : [])
      .filter(Boolean)
      .join('\n');

    /* ======= Validatie ======= */
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, error: 'Ongeldig e-mailadres.' });
    }
    if (!airport || !destination || !date || !ret) {
      return res.status(400).json({ success: false, error: 'Ontbrekende verplichte velden.' });
    }
    if (!isISODate(date) || !isISODate(ret)) {
      return res.status(400).json({ success: false, error: 'Datums moeten formaat YYYY-MM-DD hebben.' });
    }

    /* ======= Email content ======= */
    const textSummary = [
      `Nieuwe intake van TrAIveller.ai`,
      '',
      `Naam: ${name || '-'}`,
      `E-mail: ${email}`,
      '',
      `Vertrekdatum: ${date}`,
      `Terugkomstdatum: ${ret}`,
      `Vertrekluchthaven: ${airport}`,
      `Bestemming/regio: ${destination}`,
      `Budget (pp): ${budget ?? '-'}`,
      `Reizigers (volw/kind): ${String(adults)}/${String(children)}`,
      `Type reis: ${trip_types || '-'}`,
      `Accommodatie: ${accommodation || '-'}`,
      `Vervoer ter plaatse: ${transport_local || '-'}`,
      '',
      combinedNotes || '—',
    ].join('\n');

    const htmlSummary = `
      <h2>🗺️ Nieuwe intake van TrAIveller.ai</h2>
      <p><strong>Naam:</strong> ${escapeHtml(name || '-')}<br/>
         <strong>E-mail:</strong> ${escapeHtml(email)}</p>
      <p><strong>Vertrek:</strong> ${escapeHtml(date)} &nbsp;&nbsp; <strong>Terug:</strong> ${escapeHtml(ret)}</p>
      <p><strong>Vanaf:</strong> ${escapeHtml(airport)} &nbsp;&nbsp; <strong>Bestemming/regio:</strong> ${escapeHtml(destination)}</p>
      <p><strong>Budget (pp):</strong> ${escapeHtml(String(budget ?? '-'))} &nbsp;&nbsp;
         <strong>Reizigers (volw/kind):</strong> ${escapeHtml(String(adults))}/${escapeHtml(String(children))}</p>
      <p><strong>Type reis:</strong> ${escapeHtml(String(trip_types || '-'))}</p>
      <p><strong>Accommodatie:</strong> ${escapeHtml(String(accommodation || '-'))}</p>
      <p><strong>Vervoer ter plaatse:</strong> ${escapeHtml(String(transport_local || '-'))}</p>
      <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(combinedNotes || '—'))}</p>
    `;

    const confirmText = [
      `Bedankt, ${name || ''}! ✨`,
      ``,
      `We hebben je intake ontvangen en gaan ermee aan de slag. Hieronder een korte samenvatting.`,
      ``,
      `Vertrek: ${date}    Terug: ${ret}`,
      `Vanaf: ${airport}   Bestemming/regio: ${destination}`,
      `Budget (pp): ${budget ?? '-'}`,
      `Reizigers (volw/kind): ${String(adults)}/${String(children)}`,
      `Type reis: ${trip_types || '-'}`,
      `Accommodatie: ${accommodation || '-'}`,
      `Vervoer: ${transport_local || '-'}`,
      ``,
      `Extra wensen:`,
      combinedNotes || '—',
      ``,
      `Je kunt op deze mail antwoorden als je nog iets wilt toevoegen.`,
      `— Team TrAIveller.ai`,
    ].join('\n');

    const confirmHtml = `
      <h2>Bedankt, ${escapeHtml(name || '')}! ✨</h2>
      <p>We hebben je intake ontvangen en gaan ermee aan de slag. Hieronder een korte samenvatting.</p>
      <ul>
        <li><strong>Vertrek:</strong> ${escapeHtml(date)} &nbsp;&nbsp; <strong>Terug:</strong> ${escapeHtml(ret)}</li>
        <li><strong>Vanaf:</strong> ${escapeHtml(airport)} &nbsp;&nbsp; <strong>Bestemming/regio:</strong> ${escapeHtml(destination)}</li>
        <li><strong>Budget (pp):</strong> ${escapeHtml(String(budget ?? '-'))} &nbsp;&nbsp; <strong>Reizigers (volw/kind):</strong> ${escapeHtml(String(adults))}/${escapeHtml(String(children))}</li>
        <li><strong>Type reis:</strong> ${escapeHtml(String(trip_types || '-'))}</li>
        <li><strong>Accommodatie:</strong> ${escapeHtml(String(accommodation || '-'))}</li>
        <li><strong>Vervoer:</strong> ${escapeHtml(String(transport_local || '-'))}</li>
      </ul>
      <p><strong>Extra wensen:</strong><br/>${nl2br(escapeHtml(combinedNotes || '—'))}</p>
      <p>Je kunt op deze mail antwoorden als je nog iets wilt toevoegen.</p>
    `;

    /* ======= Acties parallel ======= */
    const tasks = [];

    // 1) DB insert (alleen VEILIGE kolommen die zeker bestaan in jouw schema)
    if (supabase) {
      const row = {
        // id & created_at worden door DB gezet
        email: email || null,
        vertrek_datum: date || null,
        terug_datum: ret || null,
        vertrek_vanaf: airport || null,
        bestemming: destination || null,
        budget: budget ?? null,
        personen:
          adults || children
            ? Number(adults || 0) + Number(children || 0)
            : null,
        notes: combinedNotes || null, // <<< altijd message + (evt.) leeftijden
        vervoer: transport_local || null,
        ip: getIP(req),
        // laat halal / vlucht_type / dieet_voorkeuren weg tenzij je 100% zeker weet dat die kolommen bestaan
      };
      tasks.push(supabase.from('intakes').insert([row]));
    }

    // 2) Admin-mail
if (resend) {
  tasks.push(
    resend.emails.send({
      from: FROM_EMAIL,                         // bv. 'TrAIveller.ai <noreply@traiveller.ai>'
      to: 'traivellerdev@outlook.com',          // <-- direct adres i.p.v. TO_EMAIL
      reply_to: email || undefined,
      subject: `Nieuwe intake via TrAIveller.ai – ${name || email}`,
      text: textSummary,
      html: htmlSummary,
    })
  );
}

      // 3) Klant-bevestiging
      tasks.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
          text: confirmText,
          html: confirmHtml,
        })
      );
    }

    const results = await Promise.allSettled(tasks);

    // Check op fouten (laatste redelijke feedback naar client)
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length) {
      console.error('❌ One or more tasks failed:', failures);
      return res
        .status(500)
        .json({ success: false, error: 'Een deel van de acties is mislukt.' });
    }

    return res.status(200).json({ success: true, mode });
  } catch (err) {
    console.error('💥 Handler crash:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}









