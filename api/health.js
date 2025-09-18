// FILE: api/health.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // waarom: preflight niet laten falen
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.status(200).json({ ok: true, time: new Date().toISOString() });
}

// FILE: api/health-ext.js
// Waarom: uitgebreide healthcheck met Supabase ping en optionele Resend testmail.
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function j(res, code, payload) { return res.status(code).json(payload); }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'GET') return j(res, 405, { ok: false, error: 'Method not allowed' });

  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_FROM: !!process.env.RESEND_FROM,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL
  };

  // Supabase check
  let supabase = { ok: false };
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) throw new Error('Missing Supabase env');
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });
    const { data, error } = await sb.from('intakes').select('id').limit(1);
    if (error) throw error;
    supabase = { ok: true, sampleCount: Array.isArray(data) ? data.length : 0 };
  } catch (e) {
    supabase = { ok: false, error: e.message };
  }

  // Mail check (alleen op aanroep) ?sendMail=1
  const wantMail = String(req.query.sendMail || '0') === '1';
  let mail = { ok: !wantMail, skipped: !wantMail };
  if (wantMail) {
    try {
      if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.ADMIN_EMAIL) throw new Error('Missing Resend env');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: 'Health check • Traveller.ai',
        text: `Health check OK\nTime: ${new Date().toISOString()}\nSupabase: ${supabase.ok ? 'OK' : 'FAIL'}`
      });
      mail = { ok: true };
    } catch (e) {
      mail = { ok: false, error: e.message };
    }
  }

  return j(res, 200, {
    ok: env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE && supabase.ok && (!wantMail || mail.ok),
    time: new Date().toISOString(),
    status: { env, supabase, mail }
  });
}

