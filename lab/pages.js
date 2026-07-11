const pages = {};

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.id) el.id = props.id;
  if (props.style) el.style.cssText = props.style;
  if (props.href) el.href = props.href;
  if (props.onclick) el.onclick = props.onclick;
  if (props.type) el.type = props.type;
  if (props.value !== undefined) el.value = props.value;
  if (props.placeholder) el.placeholder = props.placeholder;
  if (props.disabled) el.disabled = true;
  if (props.checked) el.checked = true;
  if (props.innerHTML) el.innerHTML = props.innerHTML;
  if (props.textContent) el.textContent = props.textContent;
  children.forEach(c => {
    if (c === null || c === undefined) return;
    if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(c));
    else if (Array.isArray(c)) c.forEach(child => el.appendChild(child));
    else el.appendChild(c);
  });
  return el;
}

function badge(text, type = 'neutral') {
  return h('span', { class: `badge badge-${type}` }, text);
}

function card(content, className = '') {
  return h('div', { class: `card ${className}` }, content);
}

function sectionTitle(title, subtitle = '') {
  return h('div', { class: 'mb-6' }, [
    h('h2', { class: 'section-title' }, title),
    subtitle && h('p', { class: 'section-sub' }, subtitle)
  ]);
}

function statCard(label, value, sub = '', className = '') {
  return h('div', { class: `stat-card ${className}` }, [
    h('div', { class: 'stat-label' }, label),
    h('div', { class: 'stat-value text-mono' }, value),
    sub && h('div', { class: 'stat-sub' }, sub)
  ]);
}

function input(label, name, type = 'text', value = '', placeholder = '', required = false) {
  return h('div', { class: 'mb-4' }, [
    h('label', { class: 'input-label', for: name }, label),
    h('input', { class: 'input', id: name, name, type, value, placeholder, required })
  ]);
}

function select(label, name, options, value = '') {
  return h('div', { class: 'mb-4' }, [
    h('label', { class: 'input-label', for: name }, label),
    h('select', { class: 'input select', id: name, name, value }, options.map(o => h('option', { value: o.value }, o.label)))
  ]);
}

function textarea(label, name, value = '', rows = 4) {
  return h('div', { class: 'mb-4' }, [
    h('label', { class: 'input-label', for: name }, label),
    h('textarea', { class: 'input textarea', id: name, name, rows, value })
  ]);
}

function riskBadge(risk) {
  const map = { verde: 'green', amarillo: 'yellow', naranja: 'orange', rojo: 'red' };
  return badge(risk.charAt(0).toUpperCase() + risk.slice(1), map[risk] || 'neutral');
}

function formatMXN(val) {
  if (val === null || val === undefined) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(val);
}

function formatNum(val, d = 1) {
  if (val === null || val === undefined) return '—';
  return val.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function pill(text, variant = '') {
  return h('span', { class: `pill ${variant}` }, text);
}

const LOCATION_LABELS = { paxel80: 'Paxel80', cardel: 'Cardel', campeche: 'Campeche' };
const CATEGORY_LABELS = { manufactura: 'Manufactura', acuicultura: 'Acuicultura', agricultura: 'Agricultura', logistica: 'Logística', capacitacion: 'Capacitación', software: 'Software', energia: 'Energía', comercio: 'Comercio' };
const STATE_LABELS = { borrador: 'Borrador', investigacion: 'Investigación', piloto: 'Piloto', validada: 'Validada', escalando: 'Escalando', pausada: 'Pausada', descartada: 'Descartada' };
const RISK_LABELS = { verde: 'Verde', amarillo: 'Amarillo', naranja: 'Naranja', rojo: 'Rojo' };

function renderIdeaCard(idea, isCompare = false) {
  const s = idea.summary || {};
  const inCompare = store.state.compareIds.includes(idea.id);
  return h('article', { class: `card card-clickable card-accent ${inCompare ? 'ring-2 ring-gold-400' : ''}`, onclick: () => router.navigateTo(`analyzer?id=${idea.id}`) }, [
    h('div', { class: 'flex items-start justify-between gap-2 mb-3' }, [
      h('div', { class: 'flex-1 min-w-0' }, [
        h('h3', { class: 'font-semibold text-base truncate' }, idea.name),
        h('div', { class: 'text-xs text-gray-400 mt-0.5' }, `${LOCATION_LABELS[idea.location] || idea.location} · ${CATEGORY_LABELS[idea.category] || idea.category}`)
      ]),
      h('div', { class: 'flex items-center gap-1' }, [
        riskBadge(idea.riskGlobal),
        pill(STATE_LABELS[idea.state] || idea.state, 'teal')
      ])
    ]),
    h('div', { class: 'grid grid-cols-2 gap-3 text-sm mb-3' }, [
      h('div', {}, [h('span', { class: 'text-gray-400' }, 'CAPEX'), h('div', { class: 'text-mono font-medium' }, formatMXN(s.capexMin))]),
      h('div', {}, [h('span', { class: 'text-gray-400' }, '1ª venta'), h('div', { class: 'text-mono font-medium' }, s.timeToFirstSaleMonths ? `${s.timeToFirstSaleMonths} mes` : '—')]),
      h('div', {}, [h('span', { class: 'text-gray-400' }, 'Ingreso/mes'), h('div', { class: 'text-mono font-medium' }, formatMXN(s.monthlyRevenueTarget))]),
      h('div', {}, [h('span', { class: 'text-gray-400' }, 'Margen'), h('div', { class: 'text-mono font-medium' }, s.grossMarginPct ? `${s.grossMarginPct}%` : '—')])
    ]),
    h('div', { class: 'flex items-center justify-between text-xs text-gray-400' }, [
      h('span', {}, `Evidencia: ${s.evidenceLevel || 0}/5`),
      h('div', { class: 'flex gap-1' }, [
        h('button', { class: 'btn btn-ghost btn-sm', onclick: (e) => { e.stopPropagation(); store.toggleCompare(idea.id); } }, inCompare ? '✓ Comparar' : '+ Comparar'),
        h('button', { class: 'btn btn-ghost btn-sm', onclick: (e) => { e.stopPropagation(); store.duplicateIdea(idea.id); } }, 'Duplicar')
      ])
    ])
  ]);
}

function renderIdeaRow(idea) {
  const s = idea.summary || {};
  return h('tr', {}, [
    h('td', { class: 'font-medium' }, idea.name),
    h('td', {}, LOCATION_LABELS[idea.location] || idea.location),
    h('td', {}, CATEGORY_LABELS[idea.category] || idea.category),
    h('td', {}, [pill(STATE_LABELS[idea.state] || idea.state, 'teal')]),
    h('td', { class: 'text-mono' }, formatMXN(s.capexMin)),
    h('td', {}, s.timeToFirstSaleMonths ? `${s.timeToFirstSaleMonths} mes` : '—'),
    h('td', { class: 'text-mono' }, formatMXN(s.monthlyRevenueTarget)),
    h('td', {}, s.grossMarginPct ? `${s.grossMarginPct}%` : '—'),
    h('td', {}, [riskBadge(idea.riskGlobal)]),
    h('td', {}, [h('span', { class: 'text-mono' }, `${s.evidenceLevel || 0}/5`)]),
    h('td', { class: 'text-center' }, h('span', { class: 'text-mono' }, idea.priority)),
    h('td', { class: 'text-xs text-gray-400' }, idea.updatedAt),
    h('td', {}, [
      h('button', { class: 'btn btn-ghost btn-icon', onclick: (e) => { e.stopPropagation(); router.navigateTo(`analyzer?id=${idea.id}`); } }, h('svg', { class: 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }))),
      h('button', { class: 'btn btn-ghost btn-icon', onclick: (e) => { e.stopPropagation(); store.toggleCompare(idea.id); } }, store.state.compareIds.includes(idea.id) ? '✓' : '+')
    ])
  ]);
}

function emptyState(icon, text) {
  return h('div', { class: 'empty-state' }, [
    h('svg', { class: 'w-16 h-16', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1', d: icon })),
    h('p', {}, text)
  ]);
}

pages.inicio = {
  render() {
    const ideas = store.getFilteredIdeas();
    const active = ideas.filter(i => !['pausada', 'descartada'].includes(i.state));
    const totalCapex = active.reduce((sum, i) => sum + (i.summary?.capexMin || i.financial?.capexInitial || 0), 0);
    const byState = {};
    ideas.forEach(i => byState[i.state] = (byState[i.state] || 0) + 1);
    const byRisk = {};
    ideas.forEach(i => byRisk[i.riskGlobal] = (byRisk[i.riskGlobal] || 0) + 1);

    const alerts = [];
    if (ideas.some(i => (i.summary?.evidenceLevel || 0) < 2)) alerts.push({ type: 'warning', text: 'Algunas ideas tienen evidencia insuficiente (< 2/5)' });
    if (active.some(i => (i.financial?.creditRequired || 0) > 0 && !(i.financial?.debtMonthlyPayment || 0))) alerts.push({ type: 'danger', text: 'Hay ideas con crédito requerido pero sin plan de pago definido' });
    const expiringPermits = ideas.filter(i => i.risks?.some(r => r.category === 'legal' && new Date(r.nextReview) < new Date(Date.now() + 30*86400000))).length;
    if (expiringPermits) alerts.push({ type: 'warning', text: `${expiringPermits} permisos por vencer en 30 días` });
    const concentration = active.length > 0 && active.filter(i => i.location === 'campeche').length / active.length > 0.6;
    if (concentration) alerts.push({ type: 'info', text: 'Concentración de riesgo: >60% ideas en Campeche' });

    return h('div', { class: 'space-y-6' }, [
      // KPIs
      h('div', { class: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4' }, [
        statCard('Capital Requerido (Activas)', formatMXN(totalCapex)),
        statCard('Ideas Activas', active.length, `de ${ideas.length} totales`),
        statCard('Semáforo Global', '', [
          h('div', { class: 'flex items-center gap-2' },
            Object.entries({ verde: byRisk.verde || 0, amarillo: byRisk.amarillo || 0, naranja: byRisk.naranja || 0, rojo: byRisk.rojo || 0 }).map(([k, v]) =>
              h('span', { class: `badge badge-${k} flex-1 text-center` }, `${k.charAt(0).toUpperCase()}: ${v}`)
            )
          )
        ]),
        statCard('Próximos Hitos', '5', 'Ver roadmap')
      ]),

      // Alerts
      alerts.length > 0 && h('div', { class: 'space-y-2' }, alerts.map(a => h('div', { class: `alert alert-${a.type}` }, [
        h('svg', { class: 'w-5 h-5 flex-shrink-0 mt-0.5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: a.type === 'danger' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }))),
        h('div', {}, a.text)
      ]))),

      // Charts placeholders + Portfolio grid
      h('div', { class: 'grid lg:grid-cols-2 gap-6' }, [
        card([
          sectionTitle('Portafolio: Impacto vs Riesgo', 'Burbuja = evidencia. Color = riesgo'),
          h('div', { class: 'h-64 flex items-center justify-center text-gray-400', id: 'chart-portfolio' }, 'Gráfica Recharts pendiente')
        ]),
        card([
          sectionTitle('Capital vs Retorno Esperado', 'Eje X: CAPEX. Eje Y: Ingreso mensual objetivo. Tamaño: Margen'),
          h('div', { class: 'h-64 flex items-center justify-center text-gray-400', id: 'chart-capital-return' }, 'Gráfica Recharts pendiente')
        ])
      ]),

      // Decisions pending
      h('div', { class: 'grid lg:grid-cols-2 gap-6' }, [
        card([
          sectionTitle('Decisiones Pendientes', 'Ideas en Investigación o Piloto sin siguiente paso claro'),
          ideas.filter(i => ['investigacion', 'piloto'].includes(i.state) && (!i.summary?.nextStep || i.summary.nextStep.length < 10)).length > 0 ?
            h('ul', { class: 'space-y-2' }, ideas.filter(i => ['investigacion', 'piloto'].includes(i.state) && (!i.summary?.nextStep || i.summary.nextStep.length < 10)).slice(0, 5).map(i =>
              h('li', { class: 'flex items-center justify-between py-2 border-b border-navy-700' }, [
                h('span', { class: 'text-sm' }, i.name),
                badge(STATE_LABELS[i.state], 'teal')
              ])
            )) :
            h('p', { class: 'text-gray-400 text-center py-4' }, 'Sin decisiones pendientes críticas')
        ]),
        card([
          sectionTitle('Evidencia por Iniciativa', 'Nivel 0-5'),
          h('div', { class: 'space-y-2' }, active.slice(0, 6).map(i => h('div', { class: 'flex items-center gap-3' }, [
            h('div', { class: 'w-40 truncate text-sm' }, i.name),
            h('div', { class: 'flex-1 h-2 bg-navy-700 rounded overflow-hidden' }, h('div', { class: 'h-full bg-teal-500', style: `width: ${((i.summary?.evidenceLevel || 0) / 5) * 100}%` })),
            h('span', { class: 'text-mono text-sm text-gold-400 w-10 text-right' }, `${i.summary?.evidenceLevel || 0}/5`)
          ])))
        ])
      ])
    ]);
  },

  init() {
    // Recharts charts would be initialized here
  }
};

pages.portfolio = {
  render() {
    const ideas = store.getFilteredIdeas();
    const config = store.getState().config;
    const locations = config.locations || ['paxel80', 'cardel', 'campeche'];
    const categories = config.categories || ['manufactura', 'acuicultura', 'agricultura', 'logistica', 'capacitacion', 'software', 'energia', 'comercio'];
    const states = config.ideaStates || ['borrador', 'investigacion', 'piloto', 'validada', 'escalando', 'pausada', 'descartada'];
    const risks = ['verde', 'amarillo', 'naranja', 'rojo'];

    const renderFilters = () => h('div', { class: 'flex flex-wrap gap-3 mb-4' }, [
      h('input', { class: 'input flex-1 min-w-[200px]', placeholder: 'Buscar...', value: store.state.filters.search, oninput: (e) => store.setFilters({ search: e.target.value }) }),
      h('select', { class: 'input w-40', value: store.state.filters.location, onchange: (e) => store.setFilters({ location: e.target.value }) }, [h('option', { value: '' }, 'Ubicación'), ...locations.map(l => h('option', { value: l }, LOCATION_LABELS[l]))]),
      h('select', { class: 'input w-44', value: store.state.filters.category, onchange: (e) => store.setFilters({ category: e.target.value }) }, [h('option', { value: '' }, 'Categoría'), ...categories.map(c => h('option', { value: c }, CATEGORY_LABELS[c]))]),
      h('select', { class: 'input w-36', value: store.state.filters.state, onchange: (e) => store.setFilters({ state: e.target.value }) }, [h('option', { value: '' }, 'Estado'), ...states.map(s => h('option', { value: s }, STATE_LABELS[s]))]),
      h('select', { class: 'input w-32', value: store.state.filters.risk, onchange: (e) => store.setFilters({ risk: e.target.value }) }, [h('option', { value: '' }, 'Riesgo'), ...risks.map(r => h('option', { value: r }, RISK_LABELS[r])))],
      h('button', { class: 'btn btn-ghost', onclick: () => store.clearFilters() }, 'Limpiar')
    ]);

    return h('div', { class: 'space-y-4' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [
          h('h1', { class: 'section-title' }, 'Portafolio de Ideas'),
          h('p', { class: 'section-sub' }, `${ideas.length} ideas${store.state.filters.search ? ` (filtradas)` : ''}`)
        ]),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('analyzer') }, '+ Nueva Idea')
      ]),
      renderFilters(),
      store.state.view === 'grid' ?
        h('div', { class: 'grid gap-4', style: 'grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));' }, ideas.map(renderIdeaCard)) :
        h('div', { class: 'overflow-x-auto' }, h('table', { class: 'table-w' }, [
          h('thead', {}, h('tr', {}, ['Nombre', 'Ubicación', 'Categoría', 'Estado', 'CAPEX', '1ª Venta', 'Ingreso/mes', 'Margen', 'Riesgo', 'Evidencia', 'Prioridad', 'Actualizado', ''].map(t => h('th', {}, t)))),
          h('tbody', {}, ideas.map(renderIdeaRow))
        ]))
    ]);
  },

  init() {
    const viewBtn = document.getElementById('view-toggle');
    if (viewBtn) viewBtn.onclick = () => store.setView(store.state.view === 'grid' ? 'table' : 'grid');
  }
};

pages.analyzer = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;
    const isNew = !idea;
    const currentStep = this.currentStep || 1;

    if (isNew) {
      return this.renderWizard(1, null, true);
    }

    const score = scoring.calculate(idea);
    const steps = ['General', 'Comercial', 'Operativo', 'Financiero', 'Riesgo'];

    return h('div', { class: 'max-w-4xl mx-auto space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [
          h('h1', { class: 'section-title' }, `Analizador: ${idea.name}`),
          h('p', { class: 'section-sub' }, idea.description)
        ]),
        h('div', { class: 'flex gap-2' }, [
          h('button', { class: 'btn btn-gold', onclick: () => this.exportIdea(idea) }, 'Exportar JSON'),
          h('button', { class: 'btn btn-teal', onclick: () => this.saveDraft(idea) }, 'Guardar Borrador')
        ])
      ]),

      h('div', { class: 'wizard-steps', role: 'tablist' }, steps.map((s, i) => h('button', {
        class: `wizard-step ${i < currentStep ? 'done' : ''} ${i + 1 === currentStep ? 'active' : ''}`,
        role: 'tab',
        'aria-selected': i + 1 === currentStep,
        onclick: () => this.goToStep(i + 1, idea)
      }))),

      h('div', { class: 'wizard-step-numbers' }, steps.map((s, i) => h('div', { class: `wizard-step-num ${i < currentStep ? 'done' : ''} ${i + 1 === currentStep ? 'active' : ''}` }, i + 1))),

      this.renderStep(currentStep, idea, score),

      h('div', { class: 'flex justify-between pt-4 border-t border-navy-700' }, [
        currentStep > 1 && h('button', { class: 'btn btn-ghost', onclick: () => this.goToStep(currentStep - 1, idea) }, '← Anterior'),
        currentStep < 5 && h('button', { class: 'btn btn-gold', onclick: () => this.goToStep(currentStep + 1, idea) }, `Siguiente →`),
        currentStep === 5 && h('button', { class: 'btn btn-teal', onclick: () => this.finishAnalysis(idea, score) }, 'Finalizar')
      ])
    ]);
  },

  currentStep: 1,

  goToStep(step, idea) {
    this.currentStep = step;
    this.refresh();
  },

  refresh() {
    const content = document.getElementById('page-content');
    content.innerHTML = this.render();
    this.init();
  },

  renderWizard(step, idea, isNew) {
    const steps = ['General', 'Comercial', 'Operativo', 'Financiero', 'Riesgo'];
    const content = this.renderStepContent(step, idea || this.draftIdea || {}, isNew);
    return h('div', { class: 'max-w-3xl mx-auto space-y-6' }, [
      h('div', { class: 'wizard-steps' }, steps.map((s, i) => h('div', { class: `wizard-step ${i < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}` }))),
      h('div', { class: 'wizard-step-numbers' }, steps.map((s, i) => h('div', { class: `wizard-step-num ${i < step ? 'done' : ''} ${i + 1 === step ? 'active' : ''}` }, i + 1))),
      content,
      h('div', { class: 'flex justify-between pt-4 border-t border-navy-700' }, [
        step > 1 && h('button', { class: 'btn btn-ghost', onclick: () => this.goToStep(step - 1, idea) }, '← Anterior'),
        step < 5 && h('button', { class: 'btn btn-gold', onclick: () => { this.saveStep(step); this.goToStep(step + 1, idea); } }, 'Siguiente →'),
        step === 5 && h('button', { class: 'btn btn-teal', onclick: () => { this.saveStep(step); this.createNewIdea(); } }, 'Crear Idea')
      ])
    ]);
  },

  renderStep(step, idea, score) {
    const wrapper = h('div', {});
    wrapper.appendChild(this.renderStepContent(step, idea, false, score));
    return wrapper;
  },

  renderStepContent(step, idea, isNew, score) {
    const c = idea.commercial || {};
    const o = idea.operational || {};
    const f = idea.financial || {};
    const s = idea.summary || {};
    const config = store.getState().config;

    switch (step) {
      case 1:
        return h('div', { class: 'space-y-6' }, [
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Datos Generales'),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
              input('Nombre', 'name', 'text', idea.name || '', 'Ej: Hub Paxel80 Cardel', true),
              select('Ubicación', 'location', store.getState().config.locations?.map(l => ({ value: l, label: LOCATION_LABELS[l] })) || [], idea.location || '')
            ]),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
              select('Categoría', 'category', store.getState().config.categories?.map(c => ({ value: c, label: CATEGORY_LABELS[c] })) || [], idea.category || ''),
              select('Estado', 'state', store.getState().config.ideaStates?.map(s => ({ value: s, label: STATE_LABELS[s] })) || [], idea.state || 'borrador')
            ]),
            textarea('Problema que resuelve', 'problem', idea.problem || '', 3),
            textarea('Propuesta de valor', 'valueProposition', idea.valueProposition || '', 3),
            textarea('Cliente objetivo', 'targetClient', idea.targetClient || '', 2),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Responsable', 'responsible', 'text', idea.responsible || ''),
              input('Horizonte (meses)', 'horizon', 'number', idea.horizon || 12, '12'),
              select('Prioridad', 'priority', [{ value: 1, label: '1 - Crítica' }, { value: 2, label: '2 - Alta' }, { value: 3, label: '3 - Media' }, { value: 4, label: '4 - Baja' }, { value: 5, label: '5 - Opcional' }], idea.priority || 3)
            ])
          ]),
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Supuestos Principales'),
            h('div', { id: 'assumptions-list' }, (idea.assumptions || []).map((a, i) => h('div', { class: 'flex gap-2 mb-2' }, [
              h('input', { class: 'input flex-1', value: a, onchange: (e) => { idea.assumptions[i] = e.target.value; } }),
              h('button', { class: 'btn btn-danger btn-sm', onclick: () => { idea.assumptions.splice(i, 1); this.refresh(); } }, '×')
            ])),
            h('button', { class: 'btn btn-ghost btn-sm', onclick: () => { idea.assumptions = idea.assumptions || []; idea.assumptions.push(''); this.refresh(); } }, '+ Agregar supuesto')
          ]),
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Dependencias'),
            h('div', { id: 'deps-list' }, (idea.dependencies || []).map((d, i) => h('div', { class: 'flex gap-2 mb-2' }, [
              h('input', { class: 'input flex-1', value: d, onchange: (e) => { idea.dependencies[i] = e.target.value; } }),
              h('button', { class: 'btn btn-danger btn-sm', onclick: () => { idea.dependencies.splice(i, 1); this.refresh(); } }, '×')
            ])),
            h('button', { class: 'btn btn-ghost btn-sm', onclick: () => { idea.dependencies = idea.dependencies || []; idea.dependencies.push(''); this.refresh(); } }, '+ Agregar dependencia')
          ])
        ]);

      case 2:
        return h('div', { class: 'space-y-6' }, [
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Análisis Comercial'),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('TAM (MXN)', 'tam', 'number', c.marketSizeTAM || '', 'Total Addressable Market'),
              input('SAM (MXN)', 'sam', 'number', c.marketSizeSAM || '', 'Serviceable Available Market'),
              input('SOM (MXN)', 'som', 'number', c.marketSizeSOM || '', 'Serviceable Obtainable Market')
            ]),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Entrevistas realizadas', 'interviews', 'number', c.interviewsDone || 0),
              input('Clientes interesados', 'interested', 'number', c.interestedClients || 0),
              input('Pilotos pagados', 'pilots', 'number', c.paidPilots || 0)
            ]),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Cartas de intención', 'loi', 'number', c.loiCount || 0),
              input('Ticket promedio (MXN)', 'ticket', 'number', c.avgTicket || ''),
              select('Frecuencia', 'frequency', [{ value: 'unica', label: 'Única' }, { value: 'mensual', label: 'Mensual' }, { value: 'trimestral', label: 'Trimestral' }, { value: 'anual', label: 'Anual' }], c.purchaseFrequency || 'unica')
            ]),
            input('Cliente ancla', 'anchor', 'text', c.anchorClient || '', 'Nombre de empresa/cliente'),
            input('Canal de venta', 'channel', 'text', c.salesChannel || '', 'Ej: WhatsApp + visita directa'),
            textarea('Competidores y diferenciación', 'differentiation', c.differentiation || '', 3)
          ])
        ]);

      case 3:
        return h('div', { class: 'space-y-6' }, [
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Análisis Operativo'),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
              input('Equipo requerido', 'team', 'text', o.teamRequired?.join(', ') || '', 'Roles separados por coma'),
              input('Espacio requerido', 'space', 'text', o.spaceRequired || '', 'Ej: 4 m² con ventilación')
            ]),
            h('div', { class: 'grid grid-cols-4 gap-2 mb-4' }, [
              h('label', { class: 'checkbox-wrap' }, [h('input', { type: 'checkbox', checked: o.utilities?.water, onchange: (e) => { o.utilities = o.utilities || {}; o.utilities.water = e.target.checked; } }), 'Agua']),
              h('label', { class: 'checkbox-wrap' }, [h('input', { type: 'checkbox', checked: o.utilities?.energy, onchange: (e) => { o.utilities = o.utilities || {}; o.utilities.energy = e.target.checked; } }), 'Energía']),
              h('label', { class: 'checkbox-wrap' }, [h('input', { type: 'checkbox', checked: o.utilities?.internet, onchange: (e) => { o.utilities = o.utilities || {}; o.utilities.internet = e.target.checked; } }), 'Internet']),
              h('label', { class: 'checkbox-wrap' }, [h('input', { type: 'checkbox', checked: o.utilities?.logistics, onchange: (e) => { o.utilities = o.utilities || {}; o.utilities.logistics = e.target.checked; } }), 'Logística'])
            ]),
            input('Proveedores críticos', 'suppliers', 'text', o.criticalSuppliers?.join(', ') || '', 'Separados por coma'),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Personal requerido', 'headcount', 'number', o.headcount || 1),
              input('Capacidad máx/mes', 'capacity', 'number', o.maxMonthlyCapacity || 0),
              select('Cuellos de botella', 'bottlenecks', [], '') // Would be multi-select
            ]),
            textarea('Plan de respaldo si falla equipo/proveedor', 'backupPlan', o.backupPlan || '', 2)
          ])
        ]);

      case 4:
        return h('div', { class: 'space-y-6' }, [
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Análisis Financiero'),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('CAPEX Inicial (MXN)', 'capex', 'number', f.capexInitial || s.capexMin || ''),
              input('Costos fijos/mes (MXN)', 'fixedCosts', 'number', f.fixedCostsMonthly || ''),
              input('Costo variable/unidad (MXN)', 'varCost', 'number', f.variableCostPerUnit || '')
            ]),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Precio venta (MXN)', 'price', 'number', f.salePrice || ''),
              input('Anticipo esperado (%)', 'advance', 'number', f.expectedAdvance || 0, '0-100'),
              input('Días de cobro', 'collection', 'number', f.collectionDays || 30)
            ]),
            h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
              input('Crédito requerido (MXN)', 'credit', 'number', f.creditRequired || 0),
              input('Pago mensual deuda (MXN)', 'debtPayment', 'number', f.debtMonthlyPayment || 0),
              input('Reserva de caja (MXN)', 'reserve', 'number', f.cashReserve || '')
            ]),
            h('details', { class: 'mt-4' }, [
              h('summary', { class: 'cursor-pointer text-gold-400' }, 'Supuestos editables (fecha de revisión obligatoria)'),
              h('div', { class: 'mt-2 space-y-2' }, (f.assumptions || []).map((a, i) => h('div', { class: 'flex gap-2' }, [
                h('input', { class: 'input flex-1', placeholder: 'Clave (ej: precio_promedio)', value: a.key || '', onchange: (e) => { f.assumptions[i].key = e.target.value; } }),
                h('input', { class: 'input flex-1', placeholder: 'Etiqueta', value: a.label || '', onchange: (e) => { f.assumptions[i].label = e.target.value; } }),
                h('input', { class: 'input w-24', type: 'number', step: '0.01', placeholder: 'Valor', value: a.value || '', onchange: (e) => { f.assumptions[i].value = parseFloat(e.target.value) || e.target.value; } }),
                h('input', { class: 'input w-24', placeholder: 'Unidad', value: a.unit || '', onchange: (e) => { f.assumptions[i].unit = e.target.value; } }),
                h('select', { class: 'input w-24', value: a.confidence || 'media', onchange: (e) => { f.assumptions[i].confidence = e.target.value; } }, [h('option', { value: 'baja' }, 'Baja'), h('option', { value: 'media' }, 'Media'), h('option', { value: 'alta' }, 'Alta')]),
                h('input', { class: 'input w-28', type: 'date', value: a.lastReviewed || '', onchange: (e) => { f.assumptions[i].lastReviewed = e.target.value; } }),
                h('button', { class: 'btn btn-danger btn-sm', onclick: () => { f.assumptions.splice(i, 1); this.refresh(); } }, '×')
              ]))),
              h('button', { class: 'btn btn-ghost btn-sm mt-2', onclick: () => { f.assumptions = f.assumptions || []; f.assumptions.push({ key: '', label: '', value: '', unit: '', confidence: 'media', lastReviewed: new Date().toISOString().split('T')[0] }); this.refresh(); } }, '+ Agregar supuesto')
            ])
          ]),
          score && h('div', { class: 'card card-accent p-6 text-center' }, [
            h('div', { class: 'text-sm text-gray-400 mb-2' }, 'Puntaje Preliminar (se actualiza en paso 5)'),
            h('div', { class: 'text-4xl font-bold text-mono text-gold-400' }, score?.total || '—'),
            h('div', { class: 'flex justify-center gap-2 mt-2' }, Object.entries(score?.dimensions || {}).map(([k, v]) => h('span', { class: 'badge badge-' + (v >= 60 ? 'green' : v >= 40 ? 'yellow' : 'red') }, `${k}: ${Math.round(v)}`)))
          ])
        ]);

      case 5:
        return h('div', { class: 'space-y-6' }, [
          h('fieldset', { class: 'fieldset' }, [
            h('legend', { class: 'fieldset-legend' }, 'Análisis de Riesgo'),
            h('div', { class: 'space-y-3' }, [
              ...['financiero', 'comercial', 'tecnico', 'operativo', 'legal', 'fiscal', 'ambiental', 'sanitario', 'seguridad', 'logistico', 'ciberseguridad', 'reputacion'].map(cat => h('details', { class: 'group' }, [
                h('summary', { class: 'flex items-center gap-2 cursor-pointer font-medium' }, [h('span', { class: 'text-gold-400' }, '▸'), cat.charAt(0).toUpperCase() + cat.slice(1)]),
                h('div', { class: 'ml-6 mt-2 space-y-2' }, (idea.risks?.filter(r => r.category === cat) || []).map((r, i) => h('div', { class: 'flex flex-wrap gap-2' }, [
                  h('input', { class: 'input w-48', value: r.title || '', placeholder: 'Título', onchange: (e) => { r.title = e.target.value; } }),
                  select('Prob.', 'prob', [{ value: 'baja', label: 'Baja' }, { value: 'media', label: 'Media' }, { value: 'alta', label: 'Alta' }], r.probability || 'media'),
                  select('Impacto', 'impact', [{ value: 'bajo', label: 'Bajo' }, { value: 'medio', label: 'Medio' }, { value: 'alto', label: 'Alto' }], r.impact || 'medio'),
                  h('input', { class: 'input flex-1 min-w-[200px]', value: r.mitigation || '', placeholder: 'Mitigación', onchange: (e) => { r.mitigation = e.target.value; } }),
                  h('input', { class: 'input w-32', type: 'date', value: r.nextReview || '', onchange: (e) => { r.nextReview = e.target.value; } }),
                  h('button', { class: 'btn btn-danger btn-sm', onclick: () => { idea.risks = idea.risks.filter(x => x !== r); this.refresh(); } }, '×')
                ]))),
                h('button', { class: 'btn btn-ghost btn-sm mt-1', onclick: () => { idea.risks = idea.risks || []; idea.risks.push({ category: cat, title: '', probability: 'media', impact: 'medio', mitigation: '', nextReview: new Date(Date.now() + 30*86400000).toISOString().split('T')[0] }); this.refresh(); } }, '+ Agregar riesgo')
              ]))
            ])
          ]),
          score && h('div', { class: 'card card-accent' }, [
            h('h3', { class: 'font-semibold mb-4' }, 'Resultado del Scoring'),
            h('div', { class: 'grid md:grid-cols-3 gap-4' }, [
              h('div', { class: 'text-center' }, [
                h('div', { class: 'text-5xl font-bold text-mono', style: `color: var(--risk-${score.semaforo})` }, score.total),
                h('div', { class: `badge badge-${score.semaforo} mt-2` }, score.semaforo.toUpperCase())
              ]),
              h('div', {}, [
                h('h4', { class: 'font-medium mb-2' }, 'Dimensiones'),
                ...Object.entries(score.dimensions).map(([k, v]) => h('div', { class: 'flex justify-between py-1' }, [h('span', { class: 'text-sm' }, k), h('span', { class: 'text-mono font-bold' }, Math.round(v))]))
              ]),
              h('div', {}, [
                h('h4', { class: 'font-medium mb-2' }, 'Recomendación'),
                h('p', { class: 'mb-2' }, score.recommendation),
                h('h4', { class: 'font-medium mt-4 mb-2' }, 'Pasos siguientes (menor costo)'),
                h('ol', { class: 'list-decimal list-inside space-y-1 text-sm' }, score.nextSteps.map(s => h('li', {}, s)))
              ])
            ])
          ])
        ]);

      default:
        return h('div', { class: 'text-center py-12 text-gray-400' }, 'Paso no válido');
    }
  },

  saveStep(step) {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = store.getIdea(ideaId);
    if (!idea) return;

    const form = document.getElementById('page-content');
    // Save form data to idea object
    // (In real implementation, would read form values)
  },

  createNewIdea() {
    // Build idea from draft and save
    router.navigateTo('portfolio');
  },

  saveDraft(idea) {
    store.updateIdea(idea.id, idea);
    alert('Borrador guardado');
  },

  exportIdea(idea) {
    const blob = new Blob([JSON.stringify(idea, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${idea.slug || idea.id}.json`;
    a.click();
  },

  finishAnalysis(idea, score) {
    const updates = {
      ...idea,
      riskGlobal: score.semaforo,
      summary: {
        ...idea.summary,
        evidenceLevel: Math.min(5, Math.round((idea.commercial?.interviewsDone || 0) / 6 + (idea.commercial?.paidPilots || 0) * 1.5))
      }
    };
    store.updateIdea(idea.id, updates);
    router.navigateTo('portfolio');
  },

  init() {}
};

pages.compare = {
  render() {
    const compareIds = store.getCompareIds();
    if (compareIds.length < 2) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('svg', { class: 'w-16 h-16 mx-auto text-gray-500 mb-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }))),
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona 2–5 ideas para comparar'),
        h('p', { class: 'text-gray-400 mb-6' }, 'Marca ideas desde el Portafolio usando el botón "Comparar"'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const ideas = compareIds.map(id => store.getIdea(id)).filter(Boolean);
    const dims = ['demandEvidence', 'unitEconomics', 'capitalEfficiency', 'technicalRisk', 'timeToFirstSale', 'recurrenceScalability', 'synergy'];

    const tableHeaders = ['Métrica', ...ideas.map(i => i.name)];
    const rows = [
      { key: 'capex', label: 'CAPEX Inicial', fn: i => formatMXN(i.summary?.capexMin || i.financial?.capexInitial) },
      { key: 'fixedCosts', label: 'Costos Fijos/Mes', fn: i => formatMXN(i.financial?.fixedCostsMonthly) },
      { key: 'timeToSale', label: 'Tiempo 1ª Venta', fn: i => (i.summary?.timeToFirstSaleMonths || '—') + ' mes' },
      { key: 'margin', label: 'Margen Bruto', fn: i => (i.summary?.grossMarginPct || i.financial?.grossMargin || '—') + '%' },
      { key: 'breakeven', label: 'Punto Equilibrio', fn: i => (i.financial?.breakevenMonths || '—') + ' meses' },
      { key: 'risk', label: 'Riesgo Global', fn: i => riskBadge(i.riskGlobal).outerHTML },
      { key: 'deps', label: 'Dependencias', fn: i => (i.dependencies?.length || 0) },
      { key: 'evidence', label: 'Evidencia', fn: i => `${i.summary?.evidenceLevel || 0}/5` },
      { key: 'complexity', label: 'Complejidad', fn: i => (i.operational?.bottlenecks?.length || 0) + ' cuellos' },
      { key: 'credit', label: 'Crédito Requerido', fn: i => formatMXN(i.financial?.creditRequired) },
      { key: 'synergy', label: 'Sinergia Paxel80/Cardel/Campeche', fn: i => scoring.calculate(i).dimensions.synergy.toFixed(0) + '/100' },
      { key: 'score', label: 'Puntaje Total', fn: i => scoring.calculate(i).total },
      { key: 'reco', label: 'Recomendación', fn: i => scoring.calculate(i).recommendation }
    ];

    return h('div', { class: 'space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('h1', { class: 'section-title' }, 'Comparador'),
        h('button', { class: 'btn btn-ghost', onclick: () => store.clearCompare() }, 'Limpiar selección')
      ]),
      h('div', { class: 'overflow-x-auto' }, h('table', { class: 'table-w' }, [
        h('thead', {}, h('tr', {}, tableHeaders.map(t => h('th', {}, t)))),
        h('tbody', {}, rows.map(r => h('tr', {}, [
          h('td', { class: 'font-medium' }, r.label),
          ...ideas.map(i => h('td', { class: 'text-center' }, r.fn(i)))
        ])))
      ))),
      h('div', { class: 'grid lg:grid-cols-2 gap-6' }, [
        card([sectionTitle('Gráfico Radar', 'Dimensiones de decisión (0-100)'), h('div', { class: 'h-80', id: 'chart-radar' }, 'Recharts pendiente')]),
        card([sectionTitle('Dispersión Capital vs Retorno', 'Burbuja = evidencia. Color = riesgo'), h('div', { class: 'h-80', id: 'chart-scatter' }, 'Recharts pendiente')])
      ])
    ]);
  }
};

pages.financials = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;

    if (!idea) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona una idea'),
        h('p', { class: 'text-gray-400 mb-4' }, 'Ve al Portafolio o Analizador y elige una idea'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const scenarios = financial.generateScenarios(idea);
    const alerts = this.getAlerts(idea, scenarios);

    return h('div', { class: 'max-w-5xl mx-auto space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [h('h1', { class: 'section-title' }, `Escenarios: ${idea.name}`), h('p', { class: 'section-sub' }, 'Calculadora financiera con 4 escenarios')]),
        h('button', { class: 'btn btn-gold', onclick: () => this.exportFinancials(idea, scenarios) }, 'Exportar')
      ]),

      alerts.length > 0 && h('div', { class: 'space-y-2' }, alerts.map(a => h('div', { class: `alert alert-${a.type}` }, a.text))),

      h('div', { class: 'grid lg:grid-cols-2 gap-6' }, [
        card([
          sectionTitle('Parámetros Base (Escenario Realista)'),
          this.renderInputs(idea)
        ]),
        card([
          sectionTitle('Resultados por Escenario'),
          this.renderScenarioTable(scenarios)
        ])
      ]),

      h('div', { class: 'grid lg:grid-cols-3 gap-6' }, [
        card([sectionTitle('Flujo de Caja Acumulado'), h('div', { class: 'h-64', id: 'chart-cashflow' }, 'Recharts pendiente')]),
        card([sectionTitle('Punto de Equilibrio'), h('div', { class: 'h-64', id: 'chart-breakeven' }, 'Recharts pendiente')]),
        card([sectionTitle('Cobertura de Deuda'), h('div', { class: 'h-64', id: 'chart-debt' }, 'Recharts pendiente')])
      ])
    ]);
  },

  getAlerts(idea, scenarios) {
    const alerts = [];
    const r = scenarios.realistic;
    if (r.cumulativeCashFlow < 0) alerts.push({ type: 'danger', text: `Flujo acumulado negativo en mes 12: ${formatMXN(r.cumulativeCashFlow)}` });
    if (r.minCashReserve < (idea.financial?.fixedCostsMonthly || 0)) alerts.push({ type: 'warning', text: 'Reserva de caja menor a 1 mes de costos fijos' });
    if (r.debtCoverage < 1.5 && (idea.financial?.creditRequired || 0) > 0) alerts.push({ type: 'danger', text: `Cobertura de deuda ${r.debtCoverage.toFixed(1)}x < 1.5x mínimo` });
    if ((idea.financial?.contributionMarginPct || 0) < 20) alerts.push({ type: 'warning', text: 'Margen de contribución < 20%' });
    if ((idea.financial?.capexInitial || 0) > 0 && (idea.summary?.evidenceLevel || 0) < 2) alerts.push({ type: 'warning', text: 'CAPEX > 0 pero evidencia < 2/5' });
    return alerts;
  },

  renderInputs(idea) {
    const f = idea.financial || {};
    const params = financial.getDefaultParams(idea);
    const html = h('div', { class: 'space-y-3' }, [
      h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, [
        this.sliderInput('Capacidad usada (%)', 'capacityUsed', params.capacityUsed || 50, 0, 100, 5),
        this.sliderInput('Precio venta (MXN)', 'salePrice', params.salePrice || f.salePrice || 0, 0, 100000, 500)
      ]),
      h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, [
        this.sliderInput('Costo variable/unidad', 'varCost', params.variableCostPerUnit || f.variableCostPerUnit || 0, 0, 50000, 100),
        this.sliderInput('Costos fijos/mes', 'fixedCosts', params.fixedCostsMonthly || f.fixedCostsMonthly || 0, 0, 200000, 500)
      ]),
      h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, [
        this.sliderInput('Días de cobro', 'collectionDays', params.collectionDays || f.collectionDays || 30, 0, 120, 5),
        this.sliderInput('Anticipo (%)', 'advancePct', params.advancePct || f.expectedAdvance || 0, 0, 100, 5)
      ]),
      h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-3' }, [
        this.sliderInput('Tasa/Costo crédito (%)', 'creditRate', params.creditRate || 0, 0, 50, 0.5),
        this.sliderInput('Merma/Reimpresión (%)', 'waste', params.waste || 0, 0, 30, 1)
      ]),
      h('button', { class: 'btn btn-gold w-full mt-4', onclick: () => this.recalculate() }, 'Recalcular')
    ]);
    return html;
  },

  sliderInput(label, key, value, min, max, step) {
    return h('div', { class: 'slider-row' }, [
      h('label', { class: 'text-sm text-gray-300' }, label),
      h('input', { type: 'range', min, max, step, value, class: 'flex-1', id: `fin-${key}`, oninput: (e) => { document.getElementById(`fin-${key}-val`).textContent = formatMXN(e.target.value) || e.target.value + (key.includes('Pct') || key.includes('Days') || key.includes('Rate') || key.includes('waste') ? '%' : '') } }),
      h('span', { class: 'slider-val', id: `fin-${key}-val` }, formatMXN(value) || value + (key.includes('Pct') || key.includes('Days') || key.includes('Rate') || key.includes('waste') ? '%' : ''))
    ]);
  },

  renderScenarioTable(scenarios) {
    const keys = [
      { k: 'monthlyRevenue', l: 'Ingresos/mes', f: formatMXN },
      { k: 'monthlyVariableCosts', l: 'Costos variables/mes', f: formatMXN },
      { k: 'monthlyFixedCosts', l: 'Costos fijos/mes', f: formatMXN },
      { k: 'ebitda', l: 'EBITDA', f: formatMXN },
      { k: 'freeCashFlow', l: 'Flujo caja libre', f: formatMXN },
      { k: 'cumulativeCashFlow', l: 'Flujo acumulado (12m)', f: formatMXN },
      { k: 'paybackMonth', l: 'Recuperación inversión', f: v => v + ' meses' },
      { k: 'debtCoverage', l: 'Cobertura deuda', f: v => v.toFixed(1) + 'x' }
    ];

    return h('div', { class: 'overflow-x-auto' }, h('table', { class: 'table-w' }, [
      h('thead', {}, h('tr', {}, [h('th', {}), ...Object.keys(scenarios).map(k => h('th', { class: 'text-center capitalize' }, k))])),
      h('tbody', {}, keys.map(({ k, l, f }) => h('tr', {}, [
        h('td', { class: 'font-medium' }, l),
        ...Object.values(scenarios).map(s => h('td', { class: 'text-center' }, f(s[k])))
      ])))
    ]));
  },

  recalculate() {
    // Would read sliders and update scenarios
    this.refresh();
  },

  refresh() {
    const content = document.getElementById('page-content');
    content.innerHTML = this.render();
    this.init();
  },

  exportFinancials(idea, scenarios) {
    const data = { idea: idea.name, generatedAt: new Date().toISOString(), scenarios };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `financieros-${idea.slug || idea.id}.json`;
    a.click();
  },

  init() {
    // Initialize sliders
  }
};

pages.risks = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;

    if (!idea) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona una idea'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const risks = idea.risks || [];
    const categories = ['financiero', 'comercial', 'tecnico', 'operativo', 'legal', 'fiscal', 'ambiental', 'sanitario', 'seguridad', 'logistico', 'ciberseguridad', 'reputacion'];

    return h('div', { class: 'max-w-5xl mx-auto space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [h('h1', { class: 'section-title' }, `Riesgos: ${idea.name}`), h('p', { class: 'section-sub' }, 'Matriz Probabilidad × Impacto')]),
        h('button', { class: 'btn btn-gold', onclick: () => this.addRisk(idea) }, '+ Agregar Riesgo')
      ]),

      card([
        sectionTitle('Matriz de Riesgo'),
        h('div', { class: 'overflow-x-auto' }, h('table', { class: 'table-w' }, [
          h('thead', {}, h('tr', {}, ['Categoría', 'Riesgo', 'Prob.', 'Impacto', 'Nivel', 'Mitigación', 'Responsable', 'Próx. Revisión', ''].map(t => h('th', {}, t)))),
          h('tbody', {}, risks.map((r, i) => h('tr', {}, [
            h('td', {}, r.category),
            h('td', {}, r.title),
            h('td', { class: 'text-center' }, r.probability),
            h('td', { class: 'text-center' }, r.impact),
            h('td', { class: 'text-center' }, [riskBadge(r.level)]),
            h('td', {}, r.mitigation),
            h('td', {}, r.responsible),
            h('td', { class: 'text-center' }, r.nextReview),
            h('td', { class: 'text-center' }, h('button', { class: 'btn btn-danger btn-icon', onclick: () => this.removeRisk(idea, i) }, '×'))
          ])))
        ]))
      ]),

      card([
        sectionTitle('Política de Criticidad Paxel80'),
        h('p', { class: 'text-sm text-gray-400 mb-4' }, 'Clasificación de piezas según criticidad de seguridad/regulación'),
        h('div', { class: 'grid gap-2' }, [
          h('div', { class: 'flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded' }, [h('span', { class: 'w-8 h-2 bg-green-500 rounded' }), h('div', { class: 'text-sm' }, [h('span', { class: 'font-medium text-green-400' }, 'VERDE — Permitido: '), 'jigs, fixtures ligeros, guías, protectores, organizadores, piezas auxiliares no críticas.'])]),
          h('div', { class: 'flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded' }, [h('span', { class: 'w-8 h-2 bg-yellow-500 rounded' }), h('div', { class: 'text-sm' }, [h('span', { class: 'font-medium text-yellow-400' }, 'AMARILLO — Con validación: '), 'piezas de desgaste moderado, exposición moderada, solo con prueba y aprobación.'])]),
          h('div', { class: 'flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded' }, [h('span', { class: 'w-8 h-2 bg-orange-500 rounded' }), h('div', { class: 'text-sm' }, [h('span', { class: 'font-medium text-orange-400' }, 'NARANJA — Revisión externa: '), 'carga relevante, químicos, tolerancias estrictas, ambientes severos. Requiere revisión externa.']) ]),
          h('div', { class: 'flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded' }, [h('span', { class: 'w-8 h-2 bg-red-500 rounded' }), h('div', { class: 'text-sm' }, [h('span', { class: 'font-medium text-red-400' }, 'ROJO — PROHIBIDO: '), 'frenos, dirección, estructuras críticas, presión, combustible, gas, implantes, dispositivos regulados, navegación, salvamento.']) ])
        ])
      ])
    ]);
  },

  addRisk(idea) {
    idea.risks = idea.risks || [];
    idea.risks.push({ category: 'financiero', title: '', probability: 'media', impact: 'medio', level: 'amarillo', mitigation: '', responsible: store.state.currentUser, nextReview: new Date(Date.now() + 30*86400000).toISOString().split('T')[0] });
    store.updateIdea(idea.id, idea);
    this.refresh();
  },

  removeRisk(idea, index) {
    idea.risks.splice(index, 1);
    store.updateIdea(idea.id, idea);
    this.refresh();
  },

  refresh() {
    const content = document.getElementById('page-content');
    content.innerHTML = this.render();
    this.init();
  },

  init() {}
};

pages.evidence = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;

    if (!idea) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona una idea'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const evidence = idea.evidence || [];
    const maturity = evidence.length > 0 ? Math.min(5, Math.floor(evidence.length / 2) + (evidence.some(e => e.type === 'piloto') ? 1 : 0) + (evidence.some(e => e.type === 'contrato') ? 1 : 0)) : 0;

    return h('div', { class: 'max-w-4xl mx-auto space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [h('h1', { class: 'section-title' }, `Evidencia: ${idea.name}`), h('p', { class: 'section-sub' }, 'Repositorio de validación')]),
        h('button', { class: 'btn btn-gold', onclick: () => this.addEvidence(idea) }, '+ Agregar Evidencia')
      ]),

      card([
        sectionTitle('Madurez de Validación', `Nivel ${maturity}/5`),
        h('div', { class: 'maturity-bar' }, [...Array(5)].map((_, i) => h('div', { class: `maturity-step ${i < maturity ? 'filled' : ''}` }))),
        h('div', { class: 'flex justify-between text-xs text-gray-400 mt-1' }, ['Hipótesis', 'Investigación', 'Entrevistas', 'Piloto', 'Ventas/Contrato'].map((l, i) => h('span', { class: i < maturity ? 'text-teal-400' : '' }, l)))
      ]),

      h('div', { class: 'space-y-3' }, evidence.length > 0 ?
        evidence.map((e, i) => card([
          h('div', { class: 'flex items-start justify-between gap-4' }, [
            h('div', { class: 'flex-1' }, [
              h('div', { class: 'flex items-center gap-2 mb-1' }, [
                h('span', { class: 'font-medium' }, e.type.charAt(0).toUpperCase() + e.type.slice(1)),
                pill(e.reliability, e.reliability === 'alta' ? 'green' : e.reliability === 'media' ? 'yellow' : 'red'),
                h('span', { class: 'text-xs text-gray-400' }, e.date)
              ]),
              h('p', { class: 'text-sm text-gray-300' }, e.finding),
              h('p', { class: 'text-xs text-gray-500 mt-1' }, `Fuente: ${e.source}`),
              e.decisionAffected && h('p', { class: 'text-xs text-gold-400 mt-1' }, `Decisión afectada: ${e.decisionAffected}`)
            ]),
            h('button', { class: 'btn btn-danger btn-icon', onclick: () => this.removeEvidence(idea, i) }, '×')
          ])
        ])) :
        [emptyState('M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'Sin evidencia registrada. Agrega entrevistas, cotizaciones, pilotos, etc.')]
      )
    ]);
  },

  addEvidence(idea) {
    idea.evidence = idea.evidence || [];
    idea.evidence.push({ type: 'entrevista', date: new Date().toISOString().split('T')[0], source: '', reliability: 'media', finding: '', decisionAffected: '' });
    store.updateIdea(idea.id, idea);
    this.refresh();
  },

  removeEvidence(idea, index) {
    idea.evidence.splice(index, 1);
    store.updateIdea(idea.id, idea);
    this.refresh();
  },

  refresh() {
    const content = document.getElementById('page-content');
    content.innerHTML = this.render();
    this.init();
  },

  init() {}
};

pages.roadmap = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;

    if (!idea) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona una idea'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const milestones = idea.milestones || [];
    const phases = ['descubrir', 'validar', 'pilotear', 'operar', 'escalar', 'pausar', 'descartar'];

    return h('div', { class: 'max-w-5xl mx-auto space-y-6' }, [
      h('div', { class: 'flex items-center justify-between' }, [
        h('div', {}, [h('h1', { class: 'section-title' }, `Hoja de Ruta: ${idea.name}`), h('p', { class: 'section-sub' }, 'Timeline + Kanban + Gates de decisión')]),
        h('button', { class: 'btn btn-gold', onclick: () => this.addMilestone(idea) }, '+ Hito')
      ]),

      card([
        sectionTitle('Timeline'),
        h('div', { class: 'space-y-4' }, milestones.length > 0 ?
          milestones.map((m, i) => h('div', { class: 'timeline-item' }, [
            h('div', { class: `timeline-dot ${m.status === 'completado' ? 'done' : m.status === 'en_progreso' ? 'active' : ''}` }),
            h('div', { class: 'flex items-start justify-between gap-4' }, [
              h('div', { class: 'flex-1' }, [
                h('div', { class: 'flex items-center gap-2' }, [
                  h('span', { class: `phase-badge phase-${m.phase}` }, m.phase.toUpperCase()),
                  h('span', { class: 'font-medium' }, m.title),
                  h('span', { class: 'text-xs text-gray-400' }, m.targetDate)
                ]),
                h('p', { class: 'text-sm text-gray-400 mt-1' }, m.description),
                h('div', { class: 'flex flex-wrap gap-2 mt-2 text-xs' }, [
                  h('span', { class: 'pill' }, `Presupuesto: ${formatMXN(m.budgetMax)}`),
                  h('span', { class: 'pill' }, `Salida: ${m.exitCondition}`),
                  m.evidenceRequired?.length && h('span', { class: 'pill' }, `Evidencia: ${m.evidenceRequired.join(', ')}`)
                ])
              ]),
              h('button', { class: 'btn btn-ghost btn-sm', onclick: () => this.editMilestone(idea, i) }, 'Editar')
            ])
          ])) :
          emptyState('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', 'Sin hitos definidos')
        )
      ]),

      card([
        sectionTitle('Kanban por Fase'),
        h('div', { class: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3' }, phases.map(p => h('div', { class: 'bg-navy-800/50 rounded-lg p-3 min-h-[200px]' }, [
          h('h4', { class: `font-medium text-xs mb-2 ${this.phaseColor(p)}` }, p.toUpperCase()),
          h('div', { class: 'space-y-2 min-h-[150px]' }, milestones.filter(m => m.phase === p).map(m => h('div', { class: 'bg-navy-700 p-2 rounded text-xs' }, m.title)))
        ])))
      ]),

      card([
        sectionTitle('Gates de Decisión (Reglas por defecto)'),
        h('div', { class: 'space-y-2' }, [
          this.renderGate(1, 'No comprar activo sin demanda validada', idea),
          this.renderGate(2, 'No usar deuda sin fuente de repago identificada', idea),
          this.renderGate(3, 'No escalar capacidad sin utilización o backlog', idea),
          this.renderGate(4, 'No abrir nuevo vertical sin proceso y responsable', idea),
          this.renderGate(5, 'No pasar a siguiente fase si reserva de caja bajo mínimo', idea)
        ])
      ])
    ]);
  },

  phaseColor(p) {
    const c = { descubrir: 'text-gray-400', validar: 'text-blue-400', pilotear: 'text-yellow-400', operar: 'text-teal-400', escalar: 'text-green-400', pausar: 'text-yellow-400', descartar: 'text-red-400' };
    return c[p] || '';
  },

  renderGate(num, text, idea) {
    const passed = this.checkGate(num, idea);
    return h('div', { class: `gate-card ${!passed ? 'blocked' : ''}` }, [
      h('div', { class: 'flex items-center gap-3' }, [
        h('span', { class: `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${passed ? 'bg-teal-500 text-navy-900' : 'bg-red-500 text-white'}` }, passed ? '✓' : `${num}`),
        h('span', { class: 'flex-1 text-sm' }, text)
      ])
    ]);
  },

  checkGate(num, idea) {
    switch(num) {
      case 1: return (idea.commercial?.paidPilots || 0) > 0 || (idea.commercial?.loiCount || 0) > 0;
      case 2: return (idea.financial?.debtMonthlyPayment || 0) === 0 || (idea.financial?.expectedAdvance || 0) > 0;
      case 3: return (idea.operational?.maxMonthlyCapacity || 0) * 0.7 <= (idea.summary?.monthlyRevenueTarget / (idea.financial?.salePrice || 1)) || 0;
      case 4: return idea.responsible && idea.milestones?.some(m => m.phase === 'operar');
      case 5: return (idea.financial?.cashReserve || 0) >= (idea.financial?.fixedCostsMonthly || 0) * 3;
      default: return false;
    }
  },

  addMilestone(idea) {
    idea.milestones = idea.milestones || [];
    idea.milestones.push({ id: 'm' + Date.now(), phase: 'validar', title: 'Nuevo hito', description: '', budgetMax: 0, responsible: store.state.currentUser, targetDate: new Date(Date.now() + 30*86400000).toISOString().split('T')[0], exitCondition: '', evidenceRequired: [], dependencies: [], mainRisk: '', status: 'pendiente' });
    store.updateIdea(idea.id, idea);
    this.refresh();
  },

  editMilestone(idea, index) {
    // Would open modal
  },

  refresh() {
    const content = document.getElementById('page-content');
    content.innerHTML = this.render();
    this.init();
  },

  init() {}
};

pages.executive = {
  render() {
    const url = new URLSearchParams(window.location.search);
    const ideaId = url.get('id');
    const idea = ideaId ? store.getIdea(ideaId) : null;

    if (!idea) {
      return h('div', { class: 'max-w-2xl mx-auto text-center py-16' }, [
        h('h2', { class: 'text-xl font-semibold mb-2' }, 'Selecciona una idea'),
        h('button', { class: 'btn btn-gold', onclick: () => router.navigateTo('portfolio') }, 'Ir al Portafolio')
      ]);
    }

    const score = scoring.calculate(idea);
    const scenarios = financial.generateScenarios(idea);
    const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    return h('div', { class: 'max-w-3xl mx-auto space-y-8 p-6 bg-white text-navy-900 print:max-w-none', id: 'executive-doc' }, [
      h('header', { class: 'border-b-2 border-gold-500 pb-6' }, [
        h('div', { class: 'flex items-center justify-between' }, [
          h('div', {}, [
            h('h1', { class: 'text-3xl font-bold text-navy-900' }, idea.name),
            h('p', { class: 'text-gold-600 font-medium' }, `Presentación Ejecutiva · ${today}`)
          ]),
          h('div', { class: 'text-right text-sm text-gray-500' }, [
            h('div', {}, `Puntaje: ${score.total}/100`),
            h('div', { class: `inline-block px-2 py-1 rounded text-xs font-bold ${this.semaforoColor(score.semaforo)}` }, score.semaforo.toUpperCase())
          ])
        ]),
        h('p', { class: 'mt-2 text-gray-600' }, idea.description)
      ]),

      this.renderSection('1. Resumen de la Iniciativa', [
        h('p', {}, `Ubicación: ${LOCATION_LABELS[idea.location]} | Categoría: ${CATEGORY_LABELS[idea.category]} | Estado: ${STATE_LABELS[idea.state]}`),
        h('p', {}, `Capital mínimo: ${formatMXN(idea.summary?.capexMin)} | Tiempo a 1ª venta: ${idea.summary?.timeToFirstSaleMonths || '—'} mes | Ingreso objetivo: ${formatMXN(idea.summary?.monthlyRevenueTarget)}/mes`)
      ]),

      this.renderSection('2. Problema', [h('p', {}, idea.problem || 'No definido')]),
      this.renderSection('3. Solución', [h('p', {}, idea.valueProposition || 'No definido')]),
      this.renderSection('4. Activos Disponibles', [
        h('ul', { class: 'list-disc list-inside space-y-1' }, [
          h('li', {}, `Ubicación: ${LOCATION_LABELS[idea.location]}`),
          h('li', {}, `Categoría: ${CATEGORY_LABELS[idea.category]}`),
          idea.operational?.spaceRequired && h('li', {}, `Espacio: ${idea.operational.spaceRequired}`),
          idea.operational?.utilities?.energy && h('li', {}, 'Energía disponible'),
          idea.operational?.utilities?.water && h('li', {}, 'Agua disponible'),
          idea.operational?.utilities?.internet && h('li', {}, 'Internet disponible')
        ].filter(Boolean))
      ]),

      this.renderSection('5. Mercado Objetivo', [
        h('p', {}, `TAM: ${formatMXN(idea.commercial?.marketSizeTAM)} | SAM: ${formatMXN(idea.commercial?.marketSizeSAM)} | SOM: ${formatMXN(idea.commercial?.marketSizeSOM)}`),
        h('p', {}, `Cliente objetivo: ${idea.targetClient || 'Por definir'}`),
        h('p', {}, `Canal: ${idea.commercial?.salesChannel || 'Por definir'}`),
        h('p', {}, `Ticket promedio: ${formatMXN(idea.commercial?.avgTicket)} | Frecuencia: ${idea.commercial?.purchaseFrequency || '—'}`)
      ]),

      this.renderSection('6. Evidencia', [
        h('p', {}, `Nivel de evidencia: ${idea.summary?.evidenceLevel || 0}/5`),
        h('p', {}, `Entrevistas: ${idea.commercial?.interviewsDone || 0} | Interesados: ${idea.commercial?.interestedClients || 0} | Pilotos: ${idea.commercial?.paidPilots || 0} | LOIs: ${idea.commercial?.loiCount || 0}`),
        h('p', {}, idea.commercial?.anchorClient ? `Cliente ancla: ${idea.commercial.anchorClient}` : 'Sin cliente ancla')
      ]),

      this.renderSection('7. Modelo de Ingresos', [
        h('p', {}, `Precio: ${formatMXN(idea.financial?.salePrice)} | Costo variable: ${formatMXN(idea.financial?.variableCostPerUnit)} | Margen contribución: ${idea.financial?.contributionMarginPct || '—'}%`),
        h('p', {}, `Costos fijos/mes: ${formatMXN(idea.financial?.fixedCostsMonthly)} | Punto equilibrio: ${idea.financial?.breakevenUnits || '—'} uds / ${idea.financial?.breakevenMonths || '—'} meses`),
        h('p', {}, `Anticipo esperado: ${idea.financial?.expectedAdvance || 0}% | Días cobro: ${idea.financial?.collectionDays || 30}`)
      ]),

      this.renderSection('8. Escenarios Financieros (12 meses)', [
        h('div', { class: 'overflow-x-auto' }, h('table', { class: 'w-full border-collapse text-sm' }, [
          h('thead', {}, h('tr', { class: 'border-b border-gray-300' }, ['Métrica', 'Pesimista', 'Realista', 'Normal', 'Ideal'].map(t => h('th', { class: 'p-2 text-left' }, t)))),
          h('tbody', {}, [
            { k: 'monthlyRevenue', l: 'Ingresos/mes', f: formatMXN },
            { k: 'monthlyVariableCosts', l: 'Costos var./mes', f: formatMXN },
            { k: 'monthlyFixedCosts', l: 'Costos fijos/mes', f: formatMXN },
            { k: 'ebitda', l: 'EBITDA', f: formatMXN },
            { k: 'freeCashFlow', l: 'Flujo libre', f: formatMXN },
            { k: 'cumulativeCashFlow', l: 'Flujo acumulado', f: formatMXN },
            { k: 'paybackMonth', l: 'Recuperación (meses)', f: v => v + ' m' },
            { k: 'debtCoverage', l: 'Cobertura deuda', f: v => v.toFixed(1) + 'x' }
          ].map(({k,l,f}) => h('tr', { class: 'border-b border-gray-200' }, [h('td', { class: 'p-2 font-medium' }, l), ...Object.values(scenarios).map(s => h('td', { class: 'p-2 text-right' }, f(s[k]))) ])))
        ]))
      ]),

      this.renderSection('9. Uso de Fondos', [
        h('p', {}, `CAPEX total: ${formatMXN(idea.financial?.capexInitial)}`),
        h('p', {}, `Capital de trabajo: ${formatMXN(idea.financial?.workingCapital)}`),
        h('p', {}, `Reserva de caja: ${formatMXN(idea.financial?.cashReserve)}`)
      ]),

      this.renderSection('10. Riesgos y Mitigaciones', [
        h('ul', { class: 'list-disc list-inside space-y-1' }, (idea.risks || []).filter(r => r.level === 'rojo' || r.level === 'naranja').map(r => h('li', {}, [h('strong', {}, `${r.title} (${r.category})`), h('span', { class: 'ml-2 text-gray-600' }, r.mitigation)])))
      ]),

      this.renderSection('11. Hoja de Ruta', [
        h('ul', { class: 'list-disc list-inside space-y-1' }, (idea.milestones || []).slice(0, 5).map(m => h('li', {}, `${m.phase.toUpperCase()}: ${m.title} — ${m.targetDate} (${formatMXN(m.budgetMax)})`)))
      ]),

      this.renderSection('12. Solicitud Concreta', [
        h('p', {}, idea.summary?.nextStep || 'Por definir')
      ]),

      this.renderSection('13. Próximo Hito Verificable', [
        h('p', {}, idea.milestones?.[0]?.title || 'Por definir'),
        h('p', { class: 'text-sm text-gray-500' }, `Fecha objetivo: ${idea.milestones?.[0]?.targetDate || '—'} | Condición de salida: ${idea.milestones?.[0]?.exitCondition || '—'}`)
      ]),

      h('footer', { class: 'border-t-2 border-gray-300 pt-4 text-xs text-gray-500 space-y-1 no-print' }, [
        h('p', {}, '⚠️ Las proyecciones no son garantía de resultados. Basadas en supuestos editables con fecha de revisión.'),
        h('p', {}, '⚠️ Este documento no constituye asesoría legal, fiscal, sanitaria ni financiera definitiva. Requiere validación profesional.'),
        h('p', {}, `Datos faltantes/pendientes: ${score.missingData.join(', ') || 'Ninguno crítico'}`),
        h('button', { class: 'btn btn-gold mt-4', onclick: () => window.print() }, 'Imprimir / Guardar como PDF')
      ])
    ]);
  },

  semaforoColor(s) {
    return { verde: 'bg-green-100 text-green-800', amarillo: 'bg-yellow-100 text-yellow-800', naranja: 'bg-orange-100 text-orange-800', rojo: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-800';
  },

  renderSection(title, children) {
    return h('section', { class: 'space-y-2' }, [
      h('h2', { class: 'text-lg font-bold text-navy-900 border-b border-gray-200 pb-1' }, title),
      ...children
    ]);
  },

  init() {}
};

pages.settings = {
  render() {
    const config = store.getState().config;
    const weights = config.scoring?.weights || scoring.weights;
    const thresholds = config.scoring?.thresholds || scoring.thresholds;

    return h('div', { class: 'max-w-3xl mx-auto space-y-6' }, [
      h('h1', { class: 'section-title' }, 'Configuración y Supuestos'),

      card([
        sectionTitle('Moneda y Fiscales'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
          input('Moneda', 'currency', 'text', config.currency || 'MXN', 'MXN'),
          input('Tasa impuestos (supuesto, %)', 'taxRate', 'number', config.taxRatePct || 30)
        ])
      ]),

      card([
        sectionTitle('Ponderaciones del Scoring (suma = 1.0)'),
        h('div', { class: 'space-y-3' }, Object.entries(weights).map(([key, val]) => h('div', { class: 'slider-row' }, [
          h('label', { class: 'text-sm text-gray-300' }, key.replace(/([A-Z])/g, ' $1').trim()),
          h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: val, class: 'flex-1', oninput: (e) => { weights[key] = parseFloat(e.target.value); this.updateWeightDisplay(key, e.target.value); } }),
          h('span', { class: 'slider-val text-mono', id: `w-${key}` }, (val * 100).toFixed(0) + '%')
        ]))),
        h('p', { class: 'text-xs text-gray-400 mt-2' }, `Suma actual: ${Object.values(weights).reduce((a,b)=>a+b,0).toFixed(2)}`)
      ]),

      card([
        sectionTitle('Umbrales de Semáforo'),
        h('div', { class: 'grid grid-cols-4 gap-3' }, [
          input('Verde ≥', 'verde', 'number', thresholds.verde || 75),
          input('Amarillo ≥', 'amarillo', 'number', thresholds.amarillo || 55),
          input('Naranja ≥', 'naranja', 'number', thresholds.naranja || 35),
          input('Rojo <', 'rojo', 'number', thresholds.rojo || 0)
        ])
      ]),

      card([
        sectionTitle('Políticas Financieras'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
          input('Reserva de caja (meses)', 'cashReserveMonths', 'number', config.cashReserveMonths || 3),
          select('Política anticipo', 'advancePolicy', [{ value: 'requerido', label: 'Requerido' }, { value: 'recomendado', label: 'Recomendado' }, { value: 'opcional', label: 'Opcional' }], config.advancePolicy || 'requerido'),
          input('Límite crédito (MXN)', 'creditLimit', 'number', config.creditLimit || 50000),
          input('Cobertura deuda mínima (x)', 'minDebtCoverage', 'number', config.minDebtCoverage || 1.5)
        ])
      ]),

      card([
        sectionTitle('Catálogos'),
        h('button', { class: 'btn btn-ghost', onclick: () => this.editCatalog('locations') }, 'Editar Ubicaciones'),
        h('button', { class: 'btn btn-ghost', onclick: () => this.editCatalog('categories') }, 'Editar Categorías'),
        h('button', { class: 'btn btn-ghost', onclick: () => this.editCatalog('ideaStates') }, 'Editar Estados')
      ]),

      card([
        sectionTitle('Usuarios y Roles'),
        h('div', { class: 'space-y-2' }, (config.users || []).map((u, i) => h('div', { class: 'flex items-center gap-2' }, [
          h('input', { class: 'input w-48', value: u.name, onchange: (e) => { config.users[i].name = e.target.value; store.updateConfig(config); } }),
          h('input', { class: 'input w-48', value: u.email, onchange: (e) => { config.users[i].email = e.target.value; store.updateConfig(config); } }),
          h('select', { class: 'input w-32', value: u.role, onchange: (e) => { config.users[i].role = e.target.value; store.updateConfig(config); } }, [h('option', { value: 'admin' }, 'Admin'), h('option', { value: 'investor' }, 'Inversor'), h('option', { value: 'advisor' }, 'Asesor')])
        ])))
      ]),

      h('div', { class: 'flex justify-end gap-3' }, [
        h('button', { class: 'btn btn-gold', onclick: () => this.saveAll() }, 'Guardar Todo'),
        h('button', { class: 'btn btn-danger', onclick: () => this.resetDefaults() }, 'Restablecer Defecto')
      ])
    ]);
  },

  updateWeightDisplay(key, value) {
    const el = document.getElementById(`w-${key}`);
    if (el) el.textContent = (parseFloat(value) * 100).toFixed(0) + '%';
  },

  editCatalog(key) {
    alert(`Editar ${key} - pendiente modal`);
  },

  saveAll() {
    const config = store.getState().config;
    store.updateConfig(config);
    alert('Configuración guardada');
  },

  resetDefaults() {
    if (confirm('Restablecer a valores por defecto?')) {
      store.state.config = {};
      store.saveToStorage();
      location.reload();
    }
  },

  init() {}
};

window.pages = pages;