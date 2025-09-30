// FILE: assets/js/intake.js
(() => {
  const form = document.getElementById('intakeForm');
  const msgEl = document.getElementById('formMsg');
  const btn = document.getElementById('submitBtn');
  const surpriseBtn = document.getElementById('surpriseBtn');

  // inputs/blocks
  const tripMode = document.getElementById('tripMode');
  const flightBlock = document.getElementById('flightBlock');
  const cruiseBlock = document.getElementById('cruiseBlock');
  const childrenInput = document.getElementById('childrenCount');
  const childrenAges = document.getElementById('childrenAges');
  const carRental = document.getElementById('carRental');
  const carOptions = document.getElementById('carOptions');
  const budgetSelect = document.getElementById('budgetSelect');
  const budgetCustomWrap = document.getElementById('budgetCustomWrap');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const show = (text, ok = false) => {
    msgEl.textContent = text;
    msgEl.style.color = ok ? '#9CFF9C' : '#FFD2D2';
  };

  const toJSON = (formEl) =>
    Array.from(new FormData(formEl).entries())
      .reduce((acc, [k, v]) => ((acc[k] = typeof v === 'string' ? v.trim() : v), acc), {});

  // --- Event handlers ---

  // Trip mode toggle
  if (tripMode) {
    tripMode.addEventListener('change', (e) => {
      const val = e.target.value;
      flightBlock.classList.toggle('hidden', val !== 'flight');
      cruiseBlock.classList.toggle('hidden', val !== 'cruise');
    });
  }

  // min-datum = vandaag
  const todayISO = new Date().toISOString().slice(0, 10);
  if (startDate) startDate.min = todayISO;
  if (endDate) endDate.min = todayISO;

  // Kinderleeftijden renderen
  if (childrenInput) {
    childrenInput.addEventListener('input', () => {
      childrenAges.innerHTML = '';
      const count = Math.max(0, Math.min(10, parseInt(childrenInput.value || '0', 10)));
      for (let i = 0; i < count; i++) {
        const wrap = document.createElement('label');
        wrap.textContent = `Leeftijd kind ${i + 1}`;
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.name = `child_age_${i + 1}`;
        inp.min = 0; inp.max = 17;
        wrap.appendChild(inp);
        childrenAges.appendChild(wrap);
      }
    });
  }

  // Huurauto toggle
  if (carRental && carOptions) {
    carRental.addEventListener('change', (e) => {
      carOptions.classList.toggle('hidden', e.target.value !== 'Ja');
    });
  }

  // Budget custom toggle
  if (budgetSelect && budgetCustomWrap) {
    budgetSelect.addEventListener('change', (e) => {
      budgetCustomWrap.classList.toggle('hidden', e.target.value !== 'custom');
    });
  }

  // “Verras me” – voorbeelddata (Flight)
  if (surpriseBtn) {
    surpriseBtn.addEventListener('click', () => {
      form.trip_mode.value = 'flight';
      tripMode.dispatchEvent(new Event('change'));
      form.name.value = 'Alex Reiziger';
      form.email.value = 'alex@example.com';
      form.destinations.value = 'Aruba';

      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 14);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 21);
      if (startDate) startDate.value = start.toISOString().slice(0, 10);
      if (endDate) endDate.value = end.toISOString().slice(0, 10);

      form.adults.value = 2;
      form.children.value = 1;
      childrenInput.dispatchEvent(new Event('input'));
      const age1 = form.querySelector('[name="child_age_1"]');
      if (age1) age1.value = 7;

      form.departure.value = 'Amsterdam (AMS)';
      form.flight.value = 'Direct';
      form.class.value = 'Economy';
      form.accommodation.value = 'Hotel';
      budgetSelect.value = '1000';
      budgetSelect.dispatchEvent(new Event('change'));
      form.trip_type.value = 'Citytrip';
      form.notes.value = 'Budget ± €2500 p.p., cultuur & food, 10–12 dagen.';

      show('Voorbeeld ingevuld — je kunt nu verzenden.', true);
    });
  }

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // honeypot
    if (form.website && form.website.value.trim() !== '') {
      show('Spam gedetecteerd. Niet verzonden.');
      return;
    }

    const data = toJSON(form);
    if (!data.name) { show('Vul je naam in.'); return; }
    if (!data.email || !emailRe.test(data.email)) { show('Vul een geldig e-mailadres in.'); return; }
    if (!data.trip_mode) { show('Kies Vlucht of Cruise.'); return; }

    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = 'Verzenden…';
    show('Verzenden…');

    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const r = await res.json();
      if (!res.ok || r.ok === false) throw new Error(r.error || 'Onbekende fout');

      show('Bedankt! Je ontvangt zo een bevestiging per e-mail.', true);
      form.reset();
      childrenAges.innerHTML = '';
      flightBlock.classList.add('hidden');
      cruiseBlock.classList.add('hidden');
      budgetCustomWrap.classList.add('hidden');
    } catch (err) {
      show(`Kon niet verzenden: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
})();


