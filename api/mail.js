import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    console.log('📩 Incoming data:', data);

    // Notes samenstellen
    const combinedNotes = [
      (data.message || '').trim(),
      data.children_ages ? `Leeftijden kinderen: ${String(data.children_ages).trim()}` : ''
    ].filter(Boolean).join('\n');

    // === Supabase insert ===
    if (supabase) {
      const { data: inserted, error } = await supabase.from('intakes').insert([{
        naam: data.name || null,
        email: data.email || null,
        vertrek_datum: data.date || null,
        terug_datum: data.return || null,
        vertrek_vanaf: data.airport || null,
        bestemming: data.destination || null,
        budget: data.budget || null,
        personen: (data.adults || data.children)
          ? Number(data.adults || 0) + Number(data.children || 0)
          : null,
        notes: combinedNotes || null,
        vervoer: data.transport_local || null,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        halal: null,
        vlucht_type: null,
        dieet_voorkeuren: null
      }]);

      console.log('🟢 Supabase insert result:', inserted);
      console.error('🔴 Supabase insert error:', error);

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
    }

    // === Resend email ===
    const { error: mailError } = await resend.emails.send({
      from: 'TrAIveller.ai <noreply@traiveller.ai>',
      to: data.email,
      subject: 'Intake ontvangen',
      text: `Dank voor je intake, ${data.name}!\n\n${combinedNotes}`
    });

    if (mailError) {
      console.error('🔴 Resend error:', mailError);
      return res.status(500).json({ success: false, error: mailError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 Handler crash:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}








