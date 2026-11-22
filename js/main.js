document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const id=link.getAttribute('href');if(id.length>1){const target=document.querySelector(id);if(target){e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}}}));

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});
