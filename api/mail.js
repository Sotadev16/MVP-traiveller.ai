// api/mail.js
import { Resend } from 'resend';

// Kleine helpers voor veilige inhoud
const escapeHtml = (s = '') =>
  s.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const nl2br = (s = '') => s.replace(/\r?\n/g, '<br>');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Payload uit intake.html (fetch met JSON)
    const {
      name = 'Onbekend',
      email = '',
      message = '',
      date = '',
      return: ret = '',
      airport = '',
      destination = '',
    } = req.body || {};

    // Aanpassen naar jouw eigen inbox indien nodig
    const toAddress = 'traivellerdev@outlook.com';

    // Verzenden
    await resend.emails.send({
      from: 'TrAIveller.ai <noreply@traiveller.ai>', // let op: domein moet bij Resend geverifieerd zijn
      to: [toAddress],
      reply_to: email || undefined, // handig voor direct beantwoorden
      subject: `Nieuwe intake via TrAIveller.ai – ${name}`,

      // Plain-text fallback (goed voor spamfilters)
      text:
`Nieuwe intake bij TrAIveller.ai

Naam: ${name}
E-mail: ${email}

Vertrek: ${date}
Terug: ${ret}
Vanaf: ${airport}
Bestemming: ${destination}

Bericht:
${message}

Verzonden op: ${new Date().toISOString()}
`,

      // Nette, responsieve HTML
      html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6ecf1">
      <div style="padding:20px 24px;border-bottom:1px solid #eef2f6">
        <h1 style="margin:0 0 4px 0;font-size:20px;">Nieuwe intake bij <span style="color:#0a66c2;">TrAIveller.ai</span></h1>
        <p style="margin:0;color:#667085;font-size:13px;">Zojuist ontvangen • ${new Date().toLocaleString('nl-NL')}</p>
      </div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tbody>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Naam</td>
            <td style="padding:12px 24px;font-size:14px;"><strong>${escapeHtml(name)}</strong></td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">E-mail</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Vertrek</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(date)}</td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Terug</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(ret)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Vertrek vanaf</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(airport)}</td>
          </tr>
          <tr style="background:#fafbfc;">
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;">Bestemming</td>
            <td style="padding:12px 24px;font-size:14px;">${escapeHtml(destination)}</td>
          </tr>
          <tr>
            <td style="padding:12px 24px;width:160px;color:#667085;font-size:14px;vertical-align:top;">Bericht</td>
            <td style="padding:12px 24px;font-size:14px;line-height:1.5;">${nl2br(escapeHtml(message || '—'))}</td>
          </tr>
        </tbody>
      </table>

      <div style="padding:12px 24px;border-top:1px solid #eef2f6;color:#667085;font-size:12px;">
        Antwoorden kan direct via “Beantwoorden”. Deze melding is verzonden door TrAIveller.ai.
      </div>
    </div>
  </body>
</html>`,
      // Eventueel extra headers:
      // headers: { 'List-Unsubscribe': '<mailto:noreply@traiveller.ai>' },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Fout bij versturen e-mail' });
  }
}




