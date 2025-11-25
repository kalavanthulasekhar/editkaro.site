document.addEventListener('DOMContentLoaded', () => {
  const subscribeForm = document.getElementById('subscribeForm');
  if (subscribeForm){
    subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('subEmail').value;
      const msg = document.getElementById('subMsg');
      try {
        const r = await fetch('/subscribe', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email})
        });
        const data = await r.json();
        if (data.success) msg.textContent = 'Thanks — you are subscribed!';
        else msg.textContent = 'Error, try again';
      } catch (err) {
        msg.textContent = 'Network error';
      }
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const payload = Object.fromEntries(fd.entries());
      const msg = document.getElementById('contactMsg');
      try {
        const r = await fetch('/contact', {
          method:'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await r.json();
        if (data.success) {
          msg.textContent = 'Message sent — thank you!';
          contactForm.reset();
        } else msg.textContent = 'Error sending message.';
      } catch (err) {
        msg.textContent = 'Network error.';
      }
    });
  }
});
