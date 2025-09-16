// /api/mail.js – compact & robuust

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

/* ========== ENV & Clients ========== */
const resend =
  process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

/* ========== Config (mail) ========== */
// Altijd zelfde, geverifieerde afzender via Resend
const FROM = process.env.FROM_EMAIL || 'TrAIveller.ai <noreply@traiveller.ai>';
// Jouw inbox voor intakes
const ADMIN = process.env.TO_EMAIL || 'traivellerdev@outlook.com';

/* ========== Helpers ========== */
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
const getIP = (req) =>
  (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  'unknown';

/* ========== Handler ========== */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!resend) {
      // voorkom vage 500s als key ontbreekt
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY missing' });
    }

    const data = req.body || {};
    const {
      name = '',
      email = '',
      message = '',
      date = '',
      return: ret = '',
      airport = '',
      destination = '',
      budget = null,
      adults = '',
      children = '',
      transport_local = '',
      children_ages = '', // komt nog wel apart in de admin-mail, maar niet dubbel in notes
    } = data;

    // Alleen vrije notitie (zonder leeftijden) om doublures te voorkomen
    const combinedNotes = (message || '').trim();

    // ===== Supabase insert (mag falen zonder request te breken)
    let dbError = null;
    if (supabase) {
      const row = {
        naam: name || null,
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
        notes: combinedNotes || null,
        vervoer: transport_local || null,
        ip: getIP(req),
      };

      const { error } = await supabase.from('intakes').insert([row]);
      if (error) dbError = error.message;
    }

    // ===== Mail content
    const textSummary = [
      `Naam: ${name || '-'}`,
      `E-mail: ${email || '-'}`,
      `Vertrek: ${date || '-'}   Terug: ${ret || '-'}`,
      `Vanaf: ${airport || '-'}   Bestemming: ${destination || '-'}`,
      `Budget: €${budget ?? '-'}`,
      `Reizigers (volw/kind): ${adults || 0}/${children || 0}`,
      `Vervoer ter plaatse: ${transport_local || '-'}`,
      children_ages ? `Leeftijden kinderen: ${String(children_ages).trim()}` : '',
      '',
      'Notes:',
      combinedNotes || '-',
    ]
      .filter(Boolean)
      .join('\n');

    const htmlSummary = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2>Nieuwe intake via TrAIveller.ai</h2>
        <p><strong>Naam:</strong> ${name || '-'}</p>
        <p><strong>E-mail:</strong> ${email || '-'}</p>
        <p><strong>Vertrek:</strong> ${date || '-'} &nbsp;&nbsp; <strong>Terug:</strong> ${ret || '-'}</p>
        <p><strong>Vanaf:</strong> ${airport || '-'} &nbsp;&nbsp; <strong>Bestemming:</strong> ${destination || '-'}</p>
        <p><strong>Budget:</strong> €${budget ?? '-'}</p>
        <p><strong>Reizigers (volw/kind):</strong> ${adults || 0}/${children || 0}</p>
        <p><strong>Vervoer ter plaatse:</strong> ${transport_local || '-'}</p>
        ${children_ages ? `<p><strong>Leeftijden kinderen:</strong> ${String(children_ages).trim()}</p>` : ''}
        <p><strong>Notes:</strong><br>${(combinedNotes || '-')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/\n/g, '<br>')}</p>
      </div>`.trim();

    const confirmText =
      `Bedankt, ${name || ''}!\n\n` +
      `We hebben je intake ontvangen en nemen snel contact op.\n\n` +
      (combinedNotes ? `Je notitie:\n${combinedNotes}\n\n` : '') +
      `Groeten,\nTrAIveller.ai`;

    const confirmHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <p>Bedankt, ${name || ''}!</p>
        <p>We hebben je intake ontvangen en nemen snel contact op.</p>
        ${combinedNotes ? `<p><strong>Je notitie:</strong><br>${combinedNotes
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/\n/g, '<br>')}</p>` : ''}
        <p>Groeten,<br>TrAIveller.ai</p>
      </div>`.trim();

    // ===== Versturen
    console.log('Mail FROM:', FROM, ' TO(admin):', ADMIN, ' reply_to:', email);

    // 1) Admin (altijd)
    try {
      const adminResp = await resend.emails.send({
        from: FROM,
        to: ADMIN,
        reply_to: isEmail(email) ? email : undefined,
        subject: `Nieuwe intake via TrAIveller.ai – ${name || email || 'onbekend'}`,
        text: textSummary,
        html: htmlSummary,
      });
      console.log('ADMIN sent OK:', adminResp?.id || adminResp);
    } catch (e) {
      console.error('ADMIN send ERROR:', e?.message || e);
      return res.status(500).json({
        success: false,
        error: 'Admin mail failed',
        dbError,
      });
    }

    // 2) Klant (alleen als e-mail valide is)
    if (isEmail(email)) {
      try {
        const custResp = await resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
          text: confirmText,
          html: confirmHtml,
        });
        console.log('CUSTOMER sent OK:', custResp?.id || custResp);
      } catch (e) {
        console.warn('CUSTOMER send WARN:', e?.message || e);
        // klantmail mag falen zonder 500
      }
    }

    return res.status(200).json({ success: true, mode: 'LIVE', dbError });
  } catch (err) {
    console.error('Handler crash:', err);
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
}











