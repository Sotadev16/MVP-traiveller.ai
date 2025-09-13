import { Resend } from 'resend';

// Kleine helpers voor veilige inhoud
const escapeHtml = (s = '') =>
  s.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m]));
const nl2br = (s = '') => s.replace(/\r?\n/g, '<br>');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const { name = '', email = '', message = '' } = JSON.parse(req.body || '{}');

    const fromAddress = 'TrAIveller.ai <noreply@traiveller.ai>'; // verzenddomein
    const toAddress = 'traivellerdev@outlook.com'; // <-- jouw inbox (pas aan indien nodig)

    await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      reply_to: email ? [email] : undefined, // handig voor direct beantwoorden
      subject: `Nieuwe intake via TrAIveller.ai — ${name || 'Onbekend'}`,

      // Plain-text (belangrijk voor spamfilters)
      text:
`Nieuwe intake bij TrAIveller.ai

Naam: ${name}
E-mail: ${email}

Bericht:
${message}

Verzonden op: ${new Date().toISOString()}
`,

      // Simpele, nette HTML
      html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:560px;margin:0 auto;padding:16px">
      <h1 style="font-size:20px;margin:0 0 12px;">Nieuwe intake bij TrAIveller.ai</h1>
      <p>Er is zojuist een nieuw intakeformulier ingediend.</p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;"><strong>Naam:</strong> ${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px 0;"><strong>E-mail:</strong> ${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px 0;"><strong>Bericht:</strong><br>${nl2br(escapeHtml(message))}</td></tr>
        <tr><td style="padding:8px 0;color:#555;font-size:12px;">Verzonden: ${new Date().toLocaleString('nl-NL')}</td></tr>
      </table>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
      <p style="font-size:12px;color:#555;">
        Antwoorden kan direct via “Beantwoorden”. Deze melding is verzonden door TrAIveller.ai.
      </p>
    </div>
  </body>
</html>`
      // Eventueel extra headers:
      // headers: { 'List-Unsubscribe': '<mailto:noreply@traiveller.ai>' },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fout bij versturen e-mail' });
  }
}

