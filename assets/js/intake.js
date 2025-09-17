// FILE: assets/js/intake.js
(() => {
  const form = document.getElementById('intakeForm');
  const msgEl = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');

  const show = (text, ok=false) => { msgEl.textContent = text; msgEl.style.color = ok ? '#9CFF9C' : '#FFD2D2'; };
  const toJSON = (el) => Array.from(new FormData(el).entries()).reduce((a,[k,v]) => ((a[k]=v),a),{});

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); btn.disabled = true; show('Verzenden…');
    const data = toJSON(form);
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { show('Vul een geldig e-mailadres in.'); btn.disabled=false; return; }
    try {
      const res = await fetch('/api/submit-intake', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
      const r = await res.json(); if (!res.ok) throw new Error(r.error || 'Onbekende fout');
      show('Bedankt! Je ontvangt zo een bevestiging per e-mail.', true); form.reset();
    } catch (err) { show(`Kon niet verzenden: ${err.message}`); } finally { btn.disabled=false; }
  });
})();
