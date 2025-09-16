// ===== bovenin: ENV & clients =====
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
  : null;

// Admin + From (VEILIG FROM)
const TO_EMAIL = process.env.TO_EMAIL || 'traivellerdev@outlook.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'TrAIveller.ai <onboarding@resend.dev>';

function getIP(req) {
  const xf = (req.headers['x-forwarded-for'] || '').toString();
  return xf.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

// ===== handler (alleen belangrijkste delen hieronder) =====
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};
    const {
      name = '', email = '', message = '',
      date = '', return: ret = '',
      airport = '', destination = '',
      budget = null, adults = '', children = '',
      transport_local = '', children_ages = ''
    } = data;

    const combinedNotes = [
      (message || '').trim(),
      children_ages ? `Leeftijden kinderen: ${String(children_ages).trim()}` : ''
    ].filter(Boolean).join('\n');

    // ---- Supabase insert (mag falen zonder de request te killen) ----
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

    // ---- Resend e-mails ----
    if (!resend) {
      // Geen key → geef nette fout terug (dit veroorzaakt vaak 500's)
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY missing' });
    }

    // Log waarmee we sturen (geen secrets)
    console.log('Mail FROM:', FROM_EMAIL, ' TO(admin):', TO_EMAIL, ' reply_to:', email);

    // 1) Admin-mail
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,                         // direct naar Outlook
        reply_to: email || undefined,         // ok
        subject: `Nieuwe intake via TrAIveller.ai – ${name || email}`,
        text: [
          `Naam: ${name || '-'}`,
          `E-mail: ${email || '-'}`,
          `Vertrek: ${date}  Terug: ${ret}`,
          `Vanaf: ${airport}  Bestemming: ${destination}`,
          `Budget: €${budget ?? '-'}`,
          `Reizigers (volw/kind): ${adults || 0}/${children || 0}`,
          `Vervoer ter plaatse: ${transport_local || '-'}`,
          ``,
          `Notes:`,
          combinedNotes || '-'
        ].join('\n'),
      });
    } catch (e) {
      console.error('Resend admin send FAILED:', e?.message || e);
      return res.status(500).json({ success: false, error: `Resend admin failed: ${e?.message || e}` });
    }

    // 2) Klant-bevestiging (mag falen zonder 500 te geven)
    try {
      if (email) {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
          text: `Bedankt, ${name || ''}!\n\nWe hebben je intake ontvangen.\n\n${combinedNotes || ''}\n`,
        });
      }
    } catch (e) {
      console.warn('Resend customer send WARN (skipped):', e?.message || e);
      // Niet falen op klantmail
    }

    return res.status(200).json({
      success: true,
      mode: 'LIVE',
      dbError: dbError || null
    });
  } catch (err) {
    console.error('💥 Handler crash:', err);
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
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









