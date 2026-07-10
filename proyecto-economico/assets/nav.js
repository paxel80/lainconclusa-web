// Panorama Económico Pax — Sidebar Navigation (Paxel80 OS Style)
(function() {
  'use strict';

  // Page sections config: { id: { label, icon, hash } }
  const sections = [
    { id: 'inicio', label: 'Inicio', icon: '🏠', hash: 'inicio' },
    { id: 'mercado', label: 'Mercado', icon: '📊', hash: 'mercado' },
    { id: 'variantes', label: 'Variantes', icon: '📈', hash: 'variantes' },
    { id: 'catalogo', label: 'Catálogo', icon: '📦', hash: 'catalogo' },
    { id: 'agro-pesca', label: 'Agro · Pesca', icon: '🌱', hash: 'agro-pesca' },
    { id: 'gobierno', label: 'Gobierno', icon: '🏛️', hash: 'gobierno' },
    { id: 'financiamiento', label: 'Financiamiento', icon: '💰', hash: 'financiamiento' },
    { id: 'proyecciones', label: 'Proyecciones', icon: '📉', hash: 'proyecciones' },
    { id: 'plan', label: 'Plan', icon: '🗓️', hash: 'plan' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️', hash: 'roadmap' },
    { id: 'jrycachetes', label: 'JRyCachetes', icon: '🤝', hash: 'jrycachetes' },
  ];

  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const navLinks = document.querySelector('.nav-links');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  // Build sidebar navigation
  function buildSidebar() {
    if (!navLinks) return;
    navLinks.innerHTML = sections.map(s => `
      <button class="nav-item" data-target="${s.id}" aria-label="${s.label}">
        <span>${s.icon}</span> ${s.label}
      </button>
    `).join('');
  }

  // Show section by ID
  function showSection(targetId) {
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });

    // Update URL hash
    const sectionConfig = sections.find(s => s.id === targetId);
    if (sectionConfig) {
      history.replaceState(null, '', '#' + sectionConfig.hash);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile sidebar
    closeMobileSidebar();
  }

  // Mobile sidebar
  function openMobileSidebar() {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileSidebar() {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Hash routing
  function handleHashChange() {
    const hash = location.hash.slice(1);
    if (!hash) { showSection('inicio'); return; }
    const sectionConfig = sections.find(s => s.hash === hash);
    if (sectionConfig) { showSection(sectionConfig.id); }
    else { showSection('inicio'); }
  }

  // Event delegation for nav items
  function initNav() {
    if (!navLinks) return;
    navLinks.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-item');
      if (!btn) return;
      const targetId = btn.dataset.target;
      if (targetId) showSection(targetId);
    });
  }

  // Mobile toggle
  function initMobileToggle() {
    if (!mobileToggle) return;
    mobileToggle.addEventListener('click', openMobileSidebar);
    sidebarOverlay?.addEventListener('click', closeMobileSidebar);
  }

  // Keyboard navigation
  function initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileSidebar();
    });
  }

  // Initialize
  function init() {
    buildSidebar();
    initNav();
    initMobileToggle();
    initKeyboard();
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();