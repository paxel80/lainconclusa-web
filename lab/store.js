const store = {
  state: {
    ideas: [],
    config: {},
    currentIdeaId: null,
    view: 'grid',
    filters: {
      search: '',
      location: '',
      category: '',
      state: '',
      risk: '',
      minCapex: null,
      maxCapex: null,
      minPriority: 1,
      maxPriority: 5
    },
    compareIds: [],
    currentUser: 'u1',
    sidebarOpen: true
  },

  listeners: new Set(),

  init() {
    this.loadFromStorage();
    if (this.state.ideas.length === 0) {
      this.loadSeedData();
    }
  },

  loadSeedData() {
    fetch('data/seed.json')
      .then(r => r.json())
      .then(data => {
        this.state.ideas = data.ideas;
        this.state.config = data.config;
        this.saveToStorage();
        this.emit();
      })
      .catch(() => {
        this.state.ideas = [];
        this.state.config = {};
        this.emit();
      });
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('lab-decisions');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.ideas = parsed.ideas || [];
        this.state.config = parsed.config || {};
        this.state.filters = parsed.filters || this.state.filters;
        this.state.compareIds = parsed.compareIds || [];
        this.state.currentUser = parsed.currentUser || 'u1';
      }
    } catch (e) {
      console.warn('Error loading from localStorage', e);
    }
  },

  saveToStorage() {
    try {
      const toSave = {
        ideas: this.state.ideas,
        config: this.state.config,
        filters: this.state.filters,
        compareIds: this.state.compareIds,
        currentUser: this.state.currentUser
      };
      localStorage.setItem('lab-decisions', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
  },

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  emit() {
    this.listeners.forEach(fn => fn(this.state));
  },

  getState() {
    return this.state;
  },

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.saveToStorage();
    this.emit();
  },

  getIdeas() {
    return this.state.ideas;
  },

  getIdea(id) {
    return this.state.ideas.find(i => i.id === id);
  },

  addIdea(idea) {
    const newIdea = {
      ...idea,
      id: idea.id || 'idea-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.state.ideas.unshift(newIdea);
    this.saveToStorage();
    this.emit();
    return newIdea;
  },

  updateIdea(id, updates) {
    const idx = this.state.ideas.findIndex(i => i.id === id);
    if (idx >= 0) {
      this.state.ideas[idx] = { ...this.state.ideas[idx], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
      this.saveToStorage();
      this.emit();
      return this.state.ideas[idx];
    }
    return null;
  },

  deleteIdea(id) {
    this.state.ideas = this.state.ideas.filter(i => i.id !== id);
    if (this.state.currentIdeaId === id) this.state.currentIdeaId = null;
    this.state.compareIds = this.state.compareIds.filter(c => c !== id);
    this.saveToStorage();
    this.emit();
  },

  duplicateIdea(id) {
    const idea = this.getIdea(id);
    if (idea) {
      const copy = { ...idea, id: 'idea-' + Date.now(), name: idea.name + ' (copia)', state: 'borrador', createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
      this.state.ideas.unshift(copy);
      this.saveToStorage();
      this.emit();
      return copy;
    }
    return null;
  },

  getFilteredIdeas() {
    const { ideas, filters } = this.state;
    return ideas.filter(idea => {
      if (filters.search && !idea.name.toLowerCase().includes(filters.search.toLowerCase()) && !idea.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.location && idea.location !== filters.location) return false;
      if (filters.category && idea.category !== filters.category) return false;
      if (filters.state && idea.state !== filters.state) return false;
      if (filters.risk && idea.riskGlobal !== filters.risk) return false;
      const capex = idea.summary?.capexMin || idea.financial?.capexInitial || 0;
      if (filters.minCapex !== null && capex < filters.minCapex) return false;
      if (filters.maxCapex !== null && capex > filters.maxCapex) return false;
      if (idea.priority < filters.minPriority || idea.priority > filters.maxPriority) return false;
      return true;
    });
  },

  setFilters(filters) {
    this.state.filters = { ...this.state.filters, ...filters };
    this.saveToStorage();
    this.emit();
  },

  clearFilters() {
    this.state.filters = { search: '', location: '', category: '', state: '', risk: '', minCapex: null, maxCapex: null, minPriority: 1, maxPriority: 5 };
    this.saveToStorage();
    this.emit();
  },

  setCurrentIdea(id) {
    this.state.currentIdeaId = id;
    this.emit();
  },

  getCurrentIdea() {
    return this.getIdea(this.state.currentIdeaId);
  },

  toggleCompare(id) {
    const idx = this.state.compareIds.indexOf(id);
    if (idx >= 0) this.state.compareIds.splice(idx, 1);
    else if (this.state.compareIds.length < 5) this.state.compareIds.push(id);
    this.saveToStorage();
    this.emit();
  },

  clearCompare() {
    this.state.compareIds = [];
    this.saveToStorage();
    this.emit();
  },

  getCompareIdeas() {
    return this.state.compareIds.map(id => this.getIdea(id)).filter(Boolean);
  },

  updateConfig(config) {
    this.state.config = { ...this.state.config, ...config };
    this.saveToStorage();
    this.emit();
  },

  setView(view) {
    this.state.view = view;
    this.emit();
  },

  toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    this.emit();
  }
};

window.store = store;