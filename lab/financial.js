const financial = {
  calculateScenario(params, overrides = {}) {
    const p = { ...params, ...overrides };
    const {
      monthlySales = 0,
      salePrice = 0,
      variableCostPerUnit = 0,
      fixedCostsMonthly = 0,
      capacityUsed = 100,
      wastagePct = 0,
      reworkPct = 0,
      collectionDays = 30,
      advancePct = 0,
      taxRatePct = 30,
      capex = 0,
      depreciationMonthly = 0,
      debtMonthly = 0,
      minCashReserveMonths = 3
    } = p;

    const effectiveSales = monthlySales * (capacityUsed / 100);
    const effectiveVariableCost = variableCostPerUnit * (1 + wastagePct / 100 + reworkPct / 100);
    const totalVariableCost = effectiveSales * effectiveVariableCost;
    const revenue = effectiveSales * salePrice;
    const contributionMargin = revenue - totalVariableCost;
    const contributionMarginPct = revenue > 0 ? (contributionMargin / revenue) * 100 : 0;
    const ebitda = contributionMargin - fixedCostsMonthly;
    const estimatedTax = ebitda > 0 ? ebitda * (taxRatePct / 100) : 0;
    const netIncome = ebitda - estimatedTax;
    const capexMonthly = depreciationMonthly;
    const workingCapital = (revenue * collectionDays / 30) * (1 - advancePct / 100);
    const freeCashFlow = netIncome + capexMonthly - workingCapital;

    const cumulativeMonths = 24;
    const cashFlowSeries = [];
    let cumulative = -capex;
    for (let m = 1; m <= cumulativeMonths; m++) {
      cumulative += freeCashFlow;
      cashFlowSeries.push({ month: m, cashFlow: freeCashFlow, cumulative });
    }

    const breakevenUnits = contributionMarginPct > 0 ? Math.ceil(fixedCostsMonthly / (salePrice * contributionMarginPct / 100)) : null;
    const breakevenMonths = freeCashFlow > 0 ? Math.ceil(capex / freeCashFlow) : null;
    const paybackMonth = breakevenMonths;

    const minCashReserve = fixedCostsMonthly * minCashReserveMonths;
    const debtCoverage = debtMonthly > 0 ? (ebitda / debtMonthly) : null;

    const alerts = [];
    if (cumulative < 0) alerts.push({ type: 'danger', text: 'Flujo acumulado negativo en 24 meses' });
    if (collectionDays > 45) alerts.push({ type: 'warning', text: `Cobranza alta: ${collectionDays} días (objetivo ≤ 45)` });
    if (contributionMarginPct < 30) alerts.push({ type: 'danger', text: `Margen contribución bajo: ${contributionMarginPct.toFixed(1)}% (mín 30%)` });
    if (debtCoverage !== null && debtCoverage < 1.5) alerts.push({ type: 'danger', text: `Cobertura deuda: ${debtCoverage.toFixed(2)}x (mín 1.5x)` });
    if (minCashReserve > 0 && freeCashFlow < fixedCostsMonthly) alerts.push({ type: 'warning', text: 'Caja menor a 1 mes de gastos fijos' });
    if (capex > 0 && (c.interviewsDone || 0) < 5) alerts.push({ type: 'info', text: 'CAPEX antes de evidencia suficiente (≥5 entrevistas)' });

    return {
      monthlyRevenue: revenue,
      monthlyVariableCosts: totalVariableCost,
      monthlyFixedCosts: fixedCostsMonthly,
      contributionMargin,
      contributionMarginPct: Math.round(contributionMarginPct * 10) / 10,
      grossMarginPct: Math.round(contributionMarginPct * 10) / 10,
      ebitda: Math.round(ebitda),
      capex,
      depreciation: depreciationMonthly,
      estimatedTax: Math.round(estimatedTax),
      workingCapital: Math.round(workingCapital),
      freeCashFlow: Math.round(freeCashFlow),
      cashFlowSeries,
      cumulativeCashFlow: cumulative,
      breakevenUnits,
      breakevenMonths,
      paybackMonth,
      minCashReserve,
      debtCoverage: debtCoverage ? Math.round(debtCoverage * 100) / 100 : null,
      alerts
    };
  },

  getDefaultParams(idea) {
    const f = idea.financial || {};
    const s = idea.summary || {};

    return {
      monthlySales: s.monthlyRevenueTarget / (f.salePrice || 1) || 10,
      salePrice: f.salePrice || 1000,
      variableCostPerUnit: f.variableCostPerUnit || 500,
      fixedCostsMonthly: f.fixedCostsMonthly || 5000,
      capacityUsed: 50,
      wastagePct: 5,
      reworkPct: 2,
      collectionDays: f.collectionDays || 30,
      advancePct: f.expectedAdvance || 0,
      taxRatePct: 30,
      capex: f.capexInitial || s.capexMin || 0,
      depreciationMonthly: (f.capexInitial || s.capexMin || 0) / 36,
      debtMonthly: f.debtMonthlyPayment || 0,
      minCashReserveMonths: 3
    };
  },

  generateScenarios(idea) {
    const base = this.getDefaultParams(idea);
    const scenarios = {
      pessimistic: { capacityUsed: 30, salePrice: base.salePrice * 0.9, variableCostPerUnit: base.variableCostPerUnit * 1.15, fixedCostsMonthly: base.fixedCostsMonthly * 1.1, collectionDays: base.collectionDays + 15, advancePct: 0 },
      realistic: { capacityUsed: 50 },
      normal: { capacityUsed: 75, salePrice: base.salePrice * 1.05, variableCostPerUnit: base.variableCostPerUnit * 0.95 },
      ideal: { capacityUsed: 90, salePrice: base.salePrice * 1.15, variableCostPerUnit: base.variableCostPerUnit * 0.9, fixedCostsMonthly: base.fixedCostsMonthly * 0.95 }
    };

    const result = {};
    for (const [key, overrides] of Object.entries(scenarios)) {
      result[key] = this.calculateScenario(base, overrides);
    }
    return result;
  },

  formatCurrency(val) {
    if (val === null || val === undefined) return '—';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  },

  formatNumber(val, decimals = 1) {
    if (val === null || val === undefined) return '—';
    return val.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
};

window.financial = financial;