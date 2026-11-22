const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.nav-links');
if(toggle&&menu){
  toggle.addEventListener('click',()=>{
    const open=menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.innerHTML=open?'<i class="fa-solid fa-xmark"></i>':'<i class="fa-solid fa-bars"></i>';
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<i class="fa-solid fa-bars"></i>';
  }));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.classList.contains('open')){
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      toggle.innerHTML='<i class="fa-solid fa-bars"></i>';
      toggle.focus();
    }
  });
}
const header=document.querySelector('.header');
window.addEventListener('scroll',()=>header&&header.classList.toggle('scrolled',window.scrollY>20),{passive:true});
document.querySelectorAll('.year').forAll(el=>el.textContent=new Date().getFullYear());