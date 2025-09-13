import { Resend } from "resend";

// Kleine helpers voor veilige inhoud
const escapeHtml = (s = "") =>
  s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const nl2br = (s = "") => s.replace(/\r?\n/g, "<br>");

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name = "Onbekend", email = "", message = "" } = req.body || {};

    const fromAddress = "TrAIveller.ai <noreply@traiveller.ai>";
    const toAddress = "traivellerdev@outlook.com"; // <- hier komt jouw mailbox

    await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      reply_to: email || undefined, // handig voor direct antwoorden
      subject: `Nieuwe intake via TrAIveller.ai - ${name}`,

      // Plain-text fallback (spamfilters)
      text: `
Nieuwe intake bij TrAIveller.ai

Naam: ${name}
E-mail: ${email}

Bericht:
${message}

Verzonden op: ${new Date().toISOString()}
      `,

      // Mooie HTML versie
      html: `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial, sans-serif;color:#111;">
    <div style="max-width:560px;margin:20px auto;padding:16px;">
      <h1 style="font-size:20px;margin:0 0 12px;">Nieuwe intake bij TrAIveller.ai</h1>
      <p>Er is zojuist een nieuw intakeformulier ingediend:</p>
      <table role="presentation" width="100%" cellpadding="6" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr><td><strong>Naam:</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>E-mail:</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Bericht:</strong></td><td>${nl2br(escapeHtml(message))}</td></tr>
        <tr><td><strong>Verzonden:</strong></td><td>${new Date().toLocaleString("nl-NL")}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
      <p style="font-size:12px;color:#555;">
        Antwoorden kan direct via <em>Beantwoorden</em>.  
        Deze melding is verzonden door TrAIveller.ai.
      </p>
    </div>
  </body>
</html>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ error: "Fout bij versturen e-mail" });
  }
}



