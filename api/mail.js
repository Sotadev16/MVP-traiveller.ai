// api/mail.js — compact & correct

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

/* ---------- Clients ---------- */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

/* ---------- Config ---------- */
// Altijd 1 duidelijke afzender (domein geverifieerd bij Resend)
const FROM_EMAIL = 'TrAIveller.ai <noreply@traiveller.ai>';
// Admin-inbox voor nieuwe intakes
const ADMIN_EMAIL = 'traivellerdev@outlook.com';

/* ---------- Helpers ---------- */
const isEmail = (s = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
const escapeHtml = (s = '') => String(s).replace(/[<>&'"]/g, m => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&#39;','"':'&quot;'}[m]));
const getIP = (req) => (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!resend) {
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY missing' });
    }

    const data = req.body || {};
    const {
      name = '', email = '', message = '',
      date = '', return: ret = '',
      airport = '', destination = '',
      budget = null, adults = '', children = '',
      transport_local = '', children_ages = ''
    } = data;

    // Alleen vrije notitie, geen leeftijden (voorkomt dubbele regels in mail)
    const combinedNotes = (message || '').trim();

    /* ---------- DB insert (best-effort) ---------- */
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
        personen: (adults || children) ? Number(adults || 0) + Number(children || 0) : null,
        notes: combinedNotes || null,
        vervoer: transport_local || null,
        ip: getIP(req) || null,
      };
      const { error } = await supabase.from('intakes').insert([row]);
      if (error) dbError = error.message;
    }

    /* ---------- Mail inhoud ---------- */
    const textSummary = [
      `Naam: ${name || '-'}`,
      `E-mail: ${email || '-'}`,
      `Vertrek: ${date || '-'}  Terug: ${ret || '-'}`,
      `Vanaf: ${airport || '-'}  Bestemming: ${destination || '-'}`,
      `Budget: €${budget ?? '-'}`,
      `Reizigers (volw/kind): ${adults || 0}/${children || 0}`,
      `Vervoer ter plaatse: ${transport_local || '-'}`,
      ``,
      `Notes:`,
      combinedNotes || '-',
    ].join('\n');

    const htmlSummary = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2>Nieuwe intake via TrAIveller.ai</h2>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><b>Naam</b></td><td>${escapeHtml(name || '-')}</td></tr>
          <tr><td><b>E-mail</b></td><td>${escapeHtml(email || '-')}</td></tr>
          <tr><td><b>Vertrek</b></td><td>${escapeHtml(date || '-')}</td></tr>
          <tr><td><b>Terug</b></td><td>${escapeHtml(ret || '-')}</td></tr>
          <tr><td><b>Vanaf</b></td><td>${escapeHtml(airport || '-')}</td></tr>
          <tr><td><b>Bestemming</b></td><td>${escapeHtml(destination || '-')}</td></tr>
          <tr><td><b>Budget</b></td><td>€${escapeHtml(String(budget ?? '-'))}</td></tr>
          <tr><td><b>Reizigers (volw/kind)</b></td><td>${escapeHtml(String(adults || 0))}/${escapeHtml(String(children || 0))}</td></tr>
          <tr><td><b>Vervoer lokaal</b></td><td>${escapeHtml(transport_local || '-')}</td></tr>
        </table>
        <p><b>Notes</b><br>${escapeHtml(combinedNotes || '-').replace(/\n/g,'<br>')}</p>
      </div>
    `;

    const confirmText =
      `Bedankt, ${name || 'reiziger'}!\n\n` +
      `We hebben je intake ontvangen en nemen snel contact met je op.\n\n` +
      (combinedNotes ? `Je opmerking:\n${combinedNotes}\n\n` : '') +
      `Groeten,\nTrAIveller.ai`;

    const confirmHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <p>Bedankt, <b>${escapeHtml(name || 'reiziger')}</b>! We hebben je intake ontvangen en nemen snel contact met je op.</p>
        ${combinedNotes ? `<p><b>Je opmerking</b><br>${escapeHtml(combinedNotes).replace(/\n/g,'<br>')}</p>` : ''}
        <p>Groeten,<br>TrAIveller.ai</p>
      </div>
    `;

    /* ---------- Mails versturen ---------- */
    const tasks = [];

    // 1) Admin (altijd)
    tasks.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        reply_to: isEmail(email) ? email : undefined,
        subject: `Nieuwe intake via TrAIveller.ai – ${name || email || 'onbekend'}`,
        text: textSummary,
        html: htmlSummary,
      })
    );

    // 2) Klantbevestiging (alleen als klantmail OK)
    if (isEmail(email)) {
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
    const failures = results.filter(r => r.status === 'rejected');

    if (failures.length) {
      // Minstens één mail faalde → 500 terug met details
      return res.status(500).json({
        success: false,
        error: 'Mail sending failed',
        details: failures.map(f => String(f.reason)),
        dbError: dbError || null,
      });
    }

    return res.status(200).json({ success: true, mode: 'LIVE', dbError: dbError || null });
  } catch (err) {
    console.error('Handler crash:', err);
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
}










