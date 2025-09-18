// FILE: assets/js/intake.js
(() => {
  const form = document.getElementById('intakeForm');
  const msgEl = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');
  const surpriseBtn = document.getElementById('surpriseBtn');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const show = (text, ok = false) => {
    msgEl.textContent = text;
    msgEl.style.color = ok ? '#9CFF9C' : '#FFD2D2'; // waarom: snelle visuele feedback
  };

  const toJSON = (formEl) =>
    Array.from(new FormData(formEl).entries())
      .reduce((acc, [k, v]) => ((acc[k] = typeof v === 'string' ? v.trim() : v), acc), {});

  // “Verras me” – voorbeelddata vullen
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', () => {
      form.name.value = 'Alex Reiziger';
      form.email.value = 'alex@example.com';
      form.destinations.value = 'Tokyo, Kyoto';
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20);
      const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 44);
      const iso = (d) => d.toISOString().slice(0, 10);
      form.start_date.value = iso(start);
      form.end_date.value = iso(end);
      form.notes.value = 'Budget ± €2500 p.p., food & cultuur, 10–12 dagen.';
      show('Voorbeeld ingevuld — je kunt nu verzenden.', true);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: indien gevuld, niet verzenden
    if (form.company && form.company.value.trim() !== '') {
      show('Spam gedetecteerd. Niet verzonden.');
      return;
    }

    const data = toJSON(form);
    if (!data.name) { show('Vul je naam in.'); return; }
    if (!data.email || !emailRe.test(data.email)) { show('Vul een geldig e-mailadres in.'); return; }
    if (!data.destinations) { show('Vul minimaal één bestemming in.'); return; }

    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = 'Verzenden…';
    show('Verzenden…');

    try {
      const res = await fetch('/api/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const r = await res.json();
      if (!res.ok || r.ok === false) throw new Error(r.error || 'Onbekende fout');

      show('Bedankt! Je ontvangt zo een bevestiging per e-mail.', true);
      form.reset();
    } catch (err) {
      show(`Kon niet verzenden: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
})();

