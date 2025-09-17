// FILE: api/submit-intake.js
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const bad = (res, code, error) => res.status(code).json({ ok: false, error });

export default async function handler(req, res) {
  if (req.method !== 'POST') return bad(res, 405, 'Method not allowed');

  const { name = '', email = '', destinations = '', start_date = null, end_date = null, notes = '' } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 400, 'Ongeldig e-mailadres');
  if (!destinations) return bad(res, 400, 'Bestemming(en) verplicht');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !supabaseKey) return bad(res, 500, 'Supabase niet geconfigureerd');

  const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const insertPayload = { name, email, destinations, start_date, end_date, notes, created_at: new Date().toISOString() };
  const { data, error } = await sb.from('intakes').insert(insertPayload).select().single();
  if (error) return bad(res, 500, `DB insert faalde: ${error.message}`);

  const from = process.env.RESEND_FROM;
  const admin = process.env.ADMIN_EMAIL;
  if (!process.env.RESEND_API_KEY || !from || !admin) return bad(res, 500, 'Resend niet geconfigureerd');

  try {
    await resend.emails.send({
      from, to: admin,
      subject: `Nieuwe intake: ${name || email}`,
      text: [
        `Naam: ${name || '—'}`,
        `E-mail: ${email}`,
        `Bestemming(en): ${destinations}`,
        `Periode: ${start_date || 'n.t.b.'} t/m ${end_date || 'n.t.b.'}`,
        `Notities: ${notes || '—'}`,
        `Ingediend: ${new Date().toLocaleString('nl-NL')}`
      ].join('\n')
    });

    await resend.emails.send({
      from, to: email,
      subject: 'Bevestiging – we plannen jouw slimme reis',
      text: [
        `Hi ${name || 'reiziger'},`,
        '',
        'Bedankt voor je aanvraag bij TrAVeller.ai. We gaan voor je aan de slag!',
        '',
        `Ontvangen:`,
        `• Bestemming(en): ${destinations}`,
        `• Periode: ${start_date || 'n.t.b.'} t/m ${end_date || 'n.t.b.'}`,
        '',
        'We nemen spoedig contact met je op.',
        '',
        'Groet,',
        'Team TrAVeller.ai'
      ].join('\n')
    });
  } catch (mailErr) {
    return res.status(200).json({ ok: true, saved: data, mailWarning: mailErr.message });
  }

  res.status(200).json({ ok: true, saved: data });
}
