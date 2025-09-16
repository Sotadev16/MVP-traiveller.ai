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

   // Alleen vrije notitie (zonder leeftijden) om doublures te voorkomen
const combinedNotes = (message || '').trim();

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

   /* ==== vaste afzender & admin ====
   Zorg dat je domein/sender in Resend geverifieerd is.
*/
const FROM_EMAIL  = 'TrAIveller.ai <noreply@traiveller.ai>';   // altijd vanuit je domein
const ADMIN_EMAIL = 'traivellerdev@outlook.com';               // waar de intake heen moet

// 2) Admin-mail (komt in jouw inbox)
if (resend) {
  tasks.push(
    resend.emails.send({
      from: FROM_EMAIL,                // <-- nooit meer onboarding@resend.dev
      to: ADMIN_EMAIL,                 // direct adres (ipv TO_EMAIL env kan ook)
      reply_to: isEmail(email) ? email : undefined, // zodat je direct kunt antwoorden
      subject: `Nieuwe intake via TrAIveller.ai – ${name || email}`,
      text: textSummary,
      html: htmlSummary,
    })
  );
}

// 3) Klant-bevestiging (alleen sturen als klantmail geldig is)
if (resend && isEmail(email)) {
  tasks.push(
    resend.emails.send({
      from: FROM_EMAIL,                // ook de bevestiging altijd vanaf je domein
      to: email,
      subject: 'Bevestiging: we hebben je intake ontvangen (TrAIveller.ai)',
      text: confirmText,
      html: confirmHtml,
    })
  );
}

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









