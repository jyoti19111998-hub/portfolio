/* Contact terminal: mailto submission with a success animation */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const d = window.PORTFOLIO_DATA;
  const successBox = document.getElementById('contact-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const interest = form.querySelector('[name="interest"]').value;
    const message = form.querySelector('[name="message"]').value.trim();

    const subject = encodeURIComponent(`Portfolio enquiry: ${interest}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`);
    window.location.href = `mailto:${d.person.email}?subject=${subject}&body=${body}`;

    form.style.display = 'none';
    successBox.classList.add('show');
    if (window.gsap) {
      gsap.fromTo(successBox, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
    setTimeout(() => {
      successBox.classList.remove('show');
      form.style.display = '';
      form.reset();
    }, 4500);
  });
})();
