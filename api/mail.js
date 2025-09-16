// /api/mail.js  — SAFE MODE diag build
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// ===== Config (env) =====
const TO_EMAIL   = process.env.TO_EMAIL || 'traivellerdev@outlook.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'TrAIveller.ai <onboarding@resend.dev>'; // vervang later door geverifieerde sender

// ===== Helpers =====
const isEmail   = (s='') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isISODate = (s='') => /^\d{4}-\d{2}-\d{2}$/.test(s);

// ===== Clients (alleen aangemaakt, gebruikt zodra SAFE_MODE=false) =====
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
    : null;

// ===== Parse body =====
async function parseBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  const ct  = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) return raw ? JSON.parse(raw) : {};
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

// ======= HANDLER =======
export default async function handler(req, res) {
  // Zorg dat we ALTIJD JSON teruggeven (geen HTML)
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // CORS & methoden
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ success:false, error:'Method not allowed' });

  // ===== SAFE MODE: eerst bewijzen dat de route werkt =====
  // Zet op false zodra dit {success:true} geeft.
  const SAFE_MODE = false;

  try {
    const data = await parseBody(req);
    const {
      name = '', email = '', message = '',
      date = '', return:ret = '', airport = '',
      destination = '', budget = null,
      adults = 0, children = 0,
      trip_types = '', accommodation = '',
      transport_local = '', children_ages = ''
    } = data || {};

    // Combineer notes (zoals we eerder deden)
    const combinedNotes = [
      (message || '').trim(),
      (children_ages && String(children_ages).trim())
        ? `Leeftijden kinderen: ${String(children_ages).trim()}`
        : ''
    ].filter(Boolean).join('\n');

    // Log wat basis info (zie Vercel → Deployments → Functions → /api/mail → Logs)
    console.log('📩 /api/mail SAFE_MODE start', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasSupabase: !!supabase,
      from: FROM_EMAIL, to: TO_EMAIL,
      sample: { email, date, ret, airport, destination, budget }
    });

    // lichte validaties (houden we aan in safe mode)
    if (!isEmail(email)) return res.status(400).json({ success:false, error:'Ongeldig e-mailadres' });
    if (!date || !ret || !airport || !destination) return res.status(400).json({ success:false, error:'Ontbrekende verplichte velden' });
    if (!isISODate(date) || !isISODate(ret))       return res.status(400).json({ success:false, error:'Datums moeten YYYY-MM-DD zijn' });

    if (SAFE_MODE) {
      // Geef direct succes terug — bewijst dat de route en JSON ok zijn
      return res.status(200).json({
        success: true,
        mode: 'SAFE',
        echo: { email, destination, combinedNotes }
      });
    }

    // ====== VANAF HIER pas AAN als SAFE_MODE=false ======

    // 1) Mail versturen (admin + klant)
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        reply_to: email || undefined,
        subject: `Nieuwe intake – ${name || email}`,
        text: `Nieuwe intake\nBestemming: ${destination}\nBudget: ${budget}\nNotes:\n${combinedNotes}`,
        html: `<p><b>Nieuwe intake</b></p><p><b>Bestemming:</b> ${destination}</p><p><b>Budget:</b> ${budget}</p><pre>${combinedNotes}</pre>`
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
        text: `Thanks! We hebben je intake ontvangen.\nBestemming: ${destination}\n`,
        html: `<p>Thanks! We hebben je intake ontvangen.</p><p><b>Bestemming:</b> ${destination}</p>`
      })
    ]);

    // 2) DB insert
    if (supabase) {
      const insertObj = {
        email: email || null,
        vertrek_datum: date || null,
        terug_datum: ret || null,
        vertrek_vanaf: airport || null,
        bestemming: destination || null,
        budget: budget || null,
        personen: (adults || children) ? Number(adults || 0) + Number(children || 0) : null,
        notes: combinedNotes || null,
        vervoer: transport_local || null,
        ip: (req.headers['x-forwarded-for'] || '').toString().split(',')[0]?.trim() || 'unknown',
        // optioneel, alleen als kolommen bestaan:
        // halal: null, vlucht_type: null, // dieet_voorkeuren: null,
      };
      const { error } = await supabase.from('intakes').insert([insertObj]);
      if (error) {
        console.error('❌ Supabase insert failed:', error);
        return res.status(500).json({ success:false, where:'supabase', error:String(error.message || error) });
      }
    }

    return res.status(200).json({ success:true, mode:'LIVE' });

  } catch (err) {
    console.error('❌ MAIL/API FATAL:', err);
    return res.status(500).json({ success:false, where:'handler', error:String(err?.message || err) });
  }
}







