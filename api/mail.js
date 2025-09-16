// /api/mail.js – compact & robuust (Vercel/Node ESM)

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

/* ========== ENV & Clients ========== */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

/* ========== Config (mail) ========== */
/** Gebruik onboarding@resend.dev zolang je eigen domein/sender nog niet 100% verified is */
const FROM =
  process.env.FROM_EMAIL || 'TrAIveller.ai <noreply@traiveller.ai>';
/** Admin-inbox waar nieuwe intakes landen */
const ADMIN =
  process.env.TO_EMAIL || 'traivellerdev@outlook.com';

/* ========== Helpers ========== */
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
const looksLikeEmail = (s = '') => /^\S+@\S+\.\S+$/.test(String(s)); // mildere check (alleen voor klant)
const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\n/g, '<br>');

const getIP = (req) =>
  (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  'unknown';

/* ========== Handler ========== */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!resend) {
      // voorkom vage 500s als key ontbreekt
      return res
        .status(500)
        .json({ success: false, error: 'RESEND_API_KEY missing' });
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
      children_ages = '', // alleen tonen in admin-mail
    } = data;

    // Alleen vrije notitie (zonder leeftijden) om doublures te voorkomen
    const combinedNotes = (message || '').trim();

    /* ===== Supabase insert (mag falen zonder request te breken) ===== */
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

    /* ===== Mail content ===== */
    const textSummary = [
      `Naam: ${name || '-'}`,
      `E-mail: ${email || '-'}`,
      `Vertrek: ${date || '-'}   Terug: ${ret || '-'}`,
      `Vanaf: ${airport || '-'}   Bestemming: ${destination || '-'}`,
      `Budget: €${budget ?? '-'}`,
      `Reizigers (volw/kind): ${adults || 0}/${children || 0}`,
      `Vervoer ter plaatse: ${transport_local || '-'}`,
      children_ages
        ? `Leeftijden kinderen: ${String(children_ages).trim()}`
        : '',
      '',
      'Notes:',
      combinedNotes || '-',
    ]
      .filter(Boolean)
      .join('\n');

    const htmlSummary = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2>Nieuwe intake via TrAIveller.ai</h2>
        <p><strong>Naam:</strong> ${escapeHtml(name || '-')}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email || '-')}</p>
        <p><strong>Vertrek:</strong> ${escapeHtml(date || '-')} &nbsp;&nbsp; <strong>Terug:</strong> ${escapeHtml(ret || '-')}</p>
        <p><strong>Vanaf:</strong> ${escapeHtml(airport || '-')} &nbsp;&nbsp; <strong>Bestemming:</strong> ${escapeHtml(destination || '-')}</p>
        <p><strong>Budget:</strong> €${escapeHtml(budget ?? '-')}</p>
        <p><strong>Reizigers (volw/kind):</strong> ${escapeHtml(adults || 0)}/${escapeHtml(children || 0)}</p>
        <p><strong>Vervoer ter plaatse:</strong> ${escapeHtml(transport_local || '-')}</p>
        ${children_ages ? `<p><strong>Leeftijden kinderen:</strong> ${escapeHtml(String(children_ages).trim())}</p>` : ''}
        <p><strong>Notes:</strong><br>${escapeHtml(combinedNotes || '-')}</p>
      </div>`.trim();

    const confirmText =
      `Bedankt, ${name || ''}!\n\n` +
      `We hebben je intake ontvangen en nemen snel contact op.\n\n` +
      (combinedNotes ? `Je notitie:\n${combinedNotes}\n\n` : '') +
      `Groeten,\nTrAIveller.ai`;

    const confirmHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <p>Bedankt, ${escapeHtml(name || '')}!</p>
        <p>We hebben je intake ontvangen en nemen snel contact op.</p>
        ${
          combinedNotes
            ? `<p><strong>Je notitie:</strong><br>${escapeHtml(combinedNotes)}</p>`
            : ''
        }
        <p>Groeten,<br>TrAIveller.ai</p>
      </div>`.trim();

    /* ===== VERSTUREN (robuust met logging) ===== */
    console.log('Mail FROM:', FROM, ' TO(admin):', ADMIN, ' reply_to raw:', email);

    const cleanEmail = String(email || '').trim();
    const sendResults = { admin: null, customer: null };

    // 1) Admin → altijd sturen
    try {
      const r1 = await resend.emails.send({
        from: FROM,
        to: ADMIN,
        reply_to: looksLikeEmail(cleanEmail) ? cleanEmail : undefined,
        subject: `Nieuwe intake via TrAIveller.ai – ${name || cleanEmail || 'onbekend'}`,
        text: textSummary,
        html: htmlSummary,
      });
      console.log('ADMIN sent OK:', r1?.id || r1);
      sendResults.admin = r1?.id || null;
    } catch (e) {
      console.error('ADMIN send ERROR:', e?.message || e);
      return res
        .status(500)
        .json({ success: false, error: `ADMIN mail failed: ${e?.message || e}`, dbError });
    }

    // 2) Klantbevestiging → alleen als adres valide lijkt
    if (looksLikeEmail(cleanEmail)) {
      try {
        const r2 = await resend.emails.send({
          from: FROM, // na volledige domain-verify mag dit 'TrAIveller.ai <noreply@traiveller.ai>' worden
          to: cleanEmail,
          subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
          text: confirmText,
          html: confirmHtml,
        });
        console.log('CUSTOMER sent OK:', r2?.id || r2);
        sendResults.customer = r2?.id || null;
      } catch (e) {
        console.warn('CUSTOMER send WARN:', e?.message || e); // klantmail mag falen zonder 500
      }
    } else {
      console.log('CUSTOMER skipped: invalid email →', cleanEmail);
    }

    // Succes + Resend-id’s terug voor debuggen
    return res
      .status(200)
      .json({ success: true, mode: 'LIVE', sendResults, dbError: dbError || null });
  } catch (err) {
    console.error('Handler crash:', err);
    return res
      .status(500)
      .json({ success: false, error: err?.message || String(err) });
  }
}












