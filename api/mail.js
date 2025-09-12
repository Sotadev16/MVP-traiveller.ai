import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, message } = JSON.parse(req.body);


      await resend.emails.send({
        from: 'TrAIveller.ai <no-reply@traiveller.ai>',
        to: 'traivellerdev@outlook.com',   // <-- hier jouw eigen e-mailadres
        subject: 'Nieuwe intake via TrAIveller.ai',
        html: `
          <h2>Nieuwe intake</h2>
          <p><strong>Naam:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Bericht:</strong> ${message}</p>
        `,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Fout bij versturen e-mail' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
