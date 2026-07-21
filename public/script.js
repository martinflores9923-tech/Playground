const form = document.querySelector('#contactForm');
const formStatus = document.querySelector('#formStatus');
const year = document.querySelector('#year');
const contactEndpoint = '/api/contact';
const menuToggle = document.querySelector('#menuToggle');
const siteNav = document.querySelector('#siteNav');

year.textContent = new Date().getFullYear();

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    formStatus.textContent = 'Sending your message...';
    formStatus.style.color = '#176b87';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const rawBody = await response.text();
      let result = null;

      try {
        result = rawBody ? JSON.parse(rawBody) : null;
      } catch (_error) {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          (result && result.message) ||
            'Unable to send message. Confirm SMTP settings are configured correctly.'
        );
      }

      form.reset();
      formStatus.textContent = (result && result.message) || 'Thanks! Your message has been sent.';
      formStatus.style.color = '#1f9d7a';
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.style.color = '#b72a2a';
    }
  });
}
