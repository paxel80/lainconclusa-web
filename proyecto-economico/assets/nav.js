// Menu hamburguesa — Panorama Economico Pax
(function(){
  var t = document.querySelector('.nav-toggle');
  var n = document.querySelector('.topbar nav');
  if(!t || !n) return;
  t.addEventListener('click', function(){
    var open = n.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Cerrar al hacer clic en un enlace
  n.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ n.classList.remove('open'); t.setAttribute('aria-expanded','false'); });
  });
  // Cerrar al escapar
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && n.classList.contains('open')){
      n.classList.remove('open'); t.setAttribute('aria-expanded','false'); t.focus();
    }
  });
})();
