const FORM_ENDPOINT = 'https://formsubmit.co/ajax/contact.kbdigitalworks@gmail.com';
const form = document.querySelector('#contactForm');

if (form) {
  const submit = form.querySelector('.submit-btn');
  const status = form.querySelector('.form-status');

  const setError = (field, message) => {
    const input = form.elements[field];
    if (!input) return;
    const group = input.closest('.form-group');
    const error = group && group.querySelector('.error-message');
    input.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message || '';
  };

  const validate = () => {
    let valid = true;
    const name = form.elements.name;
    const mail = form.elements.email;
    const service = form.elements.service;
    const details = form.elements.details;
    const consent = form.elements.consent;

    setError('name', name.value.trim() ? '' : 'Enter your name');
    if (!name.value.trim()) valid = false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim());
    setError('email', emailOk ? '' : 'Enter a valid email address');
    if (!emailOk) valid = false;

    setError('service', service.value ? '' : 'Choose a service');
    if (!service.value) valid = false;

    setError('details', details.value.trim() ? '' : 'Describe your project in a few lines');
    if (!details.value.trim()) valid = false;

    const consentError = form.querySelector('.consent-error');
    consentError.textContent = consent.checked ? '' : 'Tick the box so we can reply';
    consent.setAttribute('aria-invalid', String(!consent.checked));
    if (!consent.checked) valid = false;

    return valid;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    if (!validate()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (form.elements.website && form.elements.website.value) return;

    submit.disabled = true;
    submit.innerHTML = 'Sending…';
    status.className = 'form-status';
    status.textContent = 'Sending your enquiry…';

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      });
      if (!response.ok) throw new Error('Submission failed');
      const data = await response.json();
      if (data.success !== true && data.success !== 'true') {
        throw new Error('Submission failed');
      }

      status.className = 'form-status success';
      status.innerHTML = 'Thank you. Your enquiry has been submitted. You can also follow up by email at <a href="mailto:contact.kbdigitalworks@gmail.com">contact.kbdigitalworks@gmail.com</a>.';
      form.reset();
    } catch (error) {
      status.className = 'form-status error';
      status.innerHTML = 'The form could not submit. Please email your enquiry directly to <a href="mailto:contact.kbdigitalworks@gmail.com">contact.kbdigitalworks@gmail.com</a>.';
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send enquiry <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    }
  });
}
