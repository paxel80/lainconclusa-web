const router = {
  routes: {
    'inicio':    { title: 'Resumen Ejecutivo', nav: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    'portfolio': { title: 'Portafolio de Ideas', nav: 'Portafolio', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    'analyzer':  { title: 'Analizador de Idea', nav: 'Analizador', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    'compare':   { title: 'Comparador', nav: 'Comparar', icon: 'M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z' },
    'financials':{ title: 'Escenarios Financieros', nav: 'Finanzas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    'risks':     { title: 'Riesgos y Cumplimiento', nav: 'Riesgos', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    'evidence':  { title: 'Evidencia y Validación', nav: 'Evidencia', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    'roadmap':   { title: 'Hoja de Ruta', nav: 'Roadmap', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    'executive': { title: 'Presentación Ejecutiva', nav: 'Ejecutiva', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
    'settings':  { title: 'Configuración', nav: 'Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  },

  currentPage: 'inicio',

  async init() {
    await store.init();
    this.buildNav();
    window.addEventListener('hashchange', () => this.navigate());
    const hash = window.location.hash.slice(1) || 'inicio';
    this.navigateTo(hash);
  },

  buildNav() {
    const sidebar = document.getElementById('sidebar-nav');
    const bottom = document.getElementById('bottom-nav');
    sidebar.innerHTML = '';
    bottom.innerHTML = '';

    Object.entries(this.routes).forEach(([key, r]) => {
      const item = document.createElement('a');
      item.href = `#${key}`;
      item.dataset.page = key;
      item.className = 'nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-gray-400 hover:text-white hover:bg-navy-700/50';

      const icon = `<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${r.icon}"/></svg>`;
      item.innerHTML = `${icon}<span>${r.nav}</span>`;

      sidebar.appendChild(item.cloneNode(true));
      bottom.appendChild(item);
    });
  },

  navigate() {
    const hash = window.location.hash.slice(1) || 'inicio';
    this.navigateTo(hash);
  },

  navigateTo(path) {
    const [page, query] = path.split('?');
    if (!this.routes[page]) page = 'inicio';
    this.currentPage = page;

    document.querySelectorAll('.nav-item').forEach(el => {
      const active = el.dataset.page === page;
      el.classList.toggle('bg-gold/10', active);
      el.classList.toggle('text-gold-400', active);
      el.classList.toggle('text-gray-400', !active);
    });

    const header = document.getElementById('page-header');
    const route = this.routes[page];
    header.innerHTML = `
      <div class="px-4 lg:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-base font-semibold text-white">${route.title}</h1>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="router.navigateTo('inicio')" class="btn btn-ghost btn-sm" title="Ir a inicio">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span class="hidden sm:inline">Inicio</span>
          </button>
        </div>
      </div>`;

    this.loadPage(page, query);
  },

  async loadPage(page, query) {
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="flex items-center justify-center h-32"><div class="spinner"></div></div>';
    try {
      const mod = pages[page];
      if (mod && mod.render) {
        const url = new URLSearchParams(query);
        content.innerHTML = mod.render();
        if (mod.init) mod.init();
      } else {
        content.innerHTML = `<div class="empty-state"><svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><p>Página en desarrollo</p></div>`;
      }
    } catch(e) {
      content.innerHTML = `<div class="alert alert-danger"><svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><strong>Error cargando página</strong><br><code class="text-xs text-red-300">${e.message}</code></div></div>`;
    }
  }
};

window.router = router;