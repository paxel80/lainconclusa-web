const scoring = {
  weights: {
    demandEvidence: 0.25,
    unitEconomics: 0.20,
    capitalEfficiency: 0.15,
    technicalRisk: 0.15,
    timeToFirstSale: 0.10,
    recurrenceScalability: 0.10,
    synergy: 0.05
  },

  thresholds: { verde: 75, amarillo: 55, naranja: 35, rojo: 0 },

  calculate(idea) {
    const dims = this.calculateDimensions(idea);
    const total = Object.entries(dims).reduce((sum, [key, val]) => sum + val * this.weights[key], 0);
    const rounded = Math.round(total);

    return {
      total: rounded,
      dimensions: dims,
      semaforo: this.getSemaforo(rounded),
      reasons: this.getReasons(idea, dims),
      missingData: this.getMissingData(idea),
      recommendation: this.getRecommendation(rounded, dims, idea),
      nextSteps: this.getNextSteps(idea, dims)
    };
  },

  calculateDimensions(idea) {
    const f = idea.financial || {};
    const c = idea.commercial || {};
    const o = idea.operational || {};
    const s = idea.summary || {};

    return {
      demandEvidence: this.scoreDemandEvidence(c, idea),
      unitEconomics: this.scoreUnitEconomics(f),
      capitalEfficiency: this.scoreCapitalEfficiency(f, s),
      technicalRisk: this.scoreTechnicalRisk(o, idea),
      timeToFirstSale: this.scoreTimeToFirstSale(s),
      recurrenceScalability: this.scoreRecurrenceScalability(c, f, s),
      synergy: this.scoreSynergy(idea)
    };
  },

  scoreDemandEvidence(c, idea) {
    let score = 0;
    const interviews = c.interviewsDone || 0;
    const interested = c.interestedClients || 0;
    const pilots = c.paidPilots || 0;
    const lois = c.loiCount || 0;
    const anchor = c.anchorClient ? 1 : 0;

    score += Math.min(interviews * 3, 30);
    score += Math.min(interested * 5, 25);
    score += pilots * 20;
    score += lois * 10;
    score += anchor * 15;

    return Math.min(score, 100);
  },

  scoreUnitEconomics(f) {
    const margin = f.contributionMarginPct;
    if (margin === undefined || margin === null) return 20;
    if (margin >= 60) return 100;
    if (margin >= 40) return 80;
    if (margin >= 25) return 60;
    if (margin >= 15) return 40;
    if (margin >= 5) return 20;
    return 5;
  },

  scoreCapitalEfficiency(f, s) {
    const capex = s.capexMin || f.capexInitial || 0;
    if (!capex) return 30;
    if (capex <= 20000) return 90;
    if (capex <= 50000) return 70;
    if (capex <= 100000) return 50;
    if (capex <= 250000) return 30;
    return 15;
  },

  scoreTechnicalRisk(o, idea) {
    let score = 70;
    const bottlenecks = o.bottlenecks?.length || 0;
    score -= Math.min(bottlenecks * 8, 24);

    if (idea.category === 'acuicultura') score -= 15;
    if (idea.category === 'manufactura') score += 5;
    if (idea.category === 'software') score += 15;

    const utilities = o.utilities || {};
    if (!utilities.energy) score += 5;
    if (!utilities.water) score += 5;

    return Math.max(Math.min(score, 100), 10);
  },

  scoreTimeToFirstSale(s) {
    const months = s.timeToFirstSaleMonths;
    if (!months) return 30;
    if (months <= 1) return 95;
    if (months <= 2) return 85;
    if (months <= 3) return 70;
    if (months <= 6) return 50;
    if (months <= 12) return 30;
    return 15;
  },

  scoreRecurrenceScalability(c, f, s) {
    let score = 20;
    const freq = c.purchaseFrequency;
    if (freq === 'mensual') score += 40;
    else if (freq === 'trimestral') score += 25;
    else if (freq === 'anual') score += 10;

    const capacity = o.maxMonthlyCapacity || 0;
    if (capacity >= 100) score += 20;
    else if (capacity >= 50) score += 10;

    const margin = f.contributionMarginPct || 0;
    if (margin >= 50) score += 20;
    else if (margin >= 30) score += 10;

    return Math.min(score, 100);
  },

  scoreSynergy(idea) {
    let score = 0;
    if (idea.location === 'paxel80') score += 40;
    if (idea.category === 'manufactura') score += 20;
    if (['software', 'capacitacion'].includes(idea.category)) score += 15;
    if (idea.category === 'logistica' && idea.location === 'cardel') score += 25;
    return Math.min(score, 100);
  },

  getSemaforo(score) {
    if (score >= this.thresholds.verde) return 'verde';
    if (score >= this.thresholds.amarillo) return 'amarillo';
    if (score >= this.thresholds.naranja) return 'naranja';
    return 'rojo';
  },

  getReasons(idea, dims) {
    const reasons = [];
    const c = idea.commercial || {};
    const f = idea.financial || {};

    if (dims.demandEvidence < 40) reasons.push({ dim: 'demandEvidence', text: 'Evidencia comercial insuficiente: pocas entrevistas, sin pilotos ni LOIs', severity: 'high' });
    else if (dims.demandEvidence < 60) reasons.push({ dim: 'demandEvidence', text: 'Evidencia comercial moderada: necesita más validación', severity: 'medium' });

    if (dims.unitEconomics < 40) reasons.push({ dim: 'unitEconomics', text: 'Margen unitario bajo o no definido', severity: 'high' });
    else if (dims.unitEconomics < 60) reasons.push({ dim: 'unitEconomics', text: 'Margen unitario moderado', severity: 'medium' });

    if (dims.capitalEfficiency < 40) reasons.push({ dim: 'capitalEfficiency', text: 'CAPEX alto relativo a capacidad de ejecución', severity: 'high' });

    if (dims.timeToFirstSale < 40) reasons.push({ dim: 'timeToFirstSale', text: 'Tiempo a primera venta largo', severity: 'medium' });

    return reasons;
  },

  getMissingData(idea) {
    const missing = [];
    if (!idea.commercial?.interviewsDone) missing.push('Entrevistas realizadas');
    if (!idea.commercial?.paidPilots) missing.push('Pilotos pagados');
    if (!idea.financial?.contributionMarginPct) missing.push('Margen de contribución');
    if (!idea.summary?.timeToFirstSaleMonths) missing.push('Tiempo a primera venta');
    if (!idea.operational?.maxMonthlyCapacity) missing.push('Capacidad máxima mensual');
    return missing;
  },

  getRecommendation(score, dims, idea) {
    if (score >= 75) return 'Validar';
    if (score >= 55) return 'Pilotear';
    if (score >= 35) return 'Pausar';
    if (score >= 20) return 'Reformular';
    return 'Descartar';
  },

  getNextSteps(idea, dims) {
    const steps = [];
    if (dims.demandEvidence < 50) steps.push('Realizar 10+ entrevistas a clientes objetivo');
    if (dims.unitEconomics < 50) steps.push('Definir costos variables y precio para calcular margen unitario');
    if (dims.capitalEfficiency < 50) steps.push('Reducir CAPEX inicial o buscar financiamiento no dilutivo');
    if (dims.timeToFirstSale < 50) steps.push('Diseñar piloto de bajo costo para validar demanda en 30 días');
    if (dims.recurrenceScalability < 50) steps.push('Identificar modelo de recurrencia o upsell');
    if (dims.synergy < 30) steps.push('Evaluar sinergias con activos Paxel80/Cardel/Campeche');
    return steps.slice(0, 3);
  }
};

window.scoring = scoring;