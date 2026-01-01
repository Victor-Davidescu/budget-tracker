import { parseNumber, roundToNextHundred, formatCurrency } from '../utils/formatters.js';

export const calculateTotalAnnual = (expense) => {
  const monthly = expense.monthly_cost || 0;
  const annual = expense.annual_cost || 0;
  return (monthly * 12) + annual;
};

export const calculateTotals = (expenses, income, monthlySavings, savingsGoals = [], loans = [], investments = [], pensions = []) => {
  // Filter out ignored expenses and income
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  const activeIncome = income.filter(i => !i.is_ignored);
  
  const totalMonthlyIncome = activeIncome.reduce((sum, i) => sum + i.monthly_pay, 0);
  const totalAnnualIncome = activeIncome.reduce((sum, i) => sum + i.annual_pay, 0);
  const totalMonthlyExpenses = activeExpenses.reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const totalMonthlyLoans = calculateTotalMonthlyLoans(loans);
  const totalAnnualExpenses = activeExpenses.reduce((sum, e) => sum + calculateTotalAnnual(e), 0);
  const essentialExpenses = activeExpenses.filter(e => e.is_essential).reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const nonEssentialExpenses = activeExpenses.filter(e => !e.is_essential).reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  
  // Calculate surplus before any allocations
  const monthlySurplusRaw = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyLoans;
  
  // Calculate available funds and scale emergency fund savings if needed
  const maxSavings = Math.max(0, monthlySurplusRaw);
  const adjustedMonthlySavings = monthlySurplusRaw <= 0 ? 0 : Math.min(monthlySavings, maxSavings);
  const emergencyFundScaling = {
    original: monthlySavings,
    adjusted: adjustedMonthlySavings,
    isScaled: adjustedMonthlySavings < monthlySavings,
    scalingFactor: monthlySavings > 0 ? adjustedMonthlySavings / monthlySavings : 1
  };
  
  const availableForGoals = Math.max(0, monthlySurplusRaw - adjustedMonthlySavings);
  
  // Apply proportional scaling to savings goals
  const goalScaling = calculateScaledGoals(savingsGoals, availableForGoals);
  const totalScaledGoalContributions = goalScaling.totalScaledContributions;
  
  const totalSavingsAllocated = adjustedMonthlySavings + totalScaledGoalContributions;
  
  // Calculate available funds for investments after savings allocation
  const availableForInvestments = Math.max(0, monthlySurplusRaw - totalSavingsAllocated);
  
  // Apply proportional scaling to investments
  const investmentScaling = calculateScaledInvestments(investments, pensions, availableForInvestments);
  const totalScaledInvestmentContributions = investmentScaling.totalScaledContributions;
  
  const pocketMoney = Math.max(0, monthlySurplusRaw - totalSavingsAllocated - totalScaledInvestmentContributions);
  
  return {
    totalMonthlyIncome,
    totalAnnualIncome,
    totalMonthlyExpenses,
    totalMonthlyLoans,
    totalAnnualExpenses,
    essentialExpenses,
    nonEssentialExpenses,
    monthlySurplus: monthlySurplusRaw,
    monthlySavings: adjustedMonthlySavings,
    totalGoalContributions: totalScaledGoalContributions,
    totalMonthlyInvestmentContributions: totalScaledInvestmentContributions,
    totalMonthlyPensionContributions: investmentScaling.scaledPensions.reduce((sum, p) => sum + p.monthly_contribution_adjusted, 0),
    totalSavingsAllocated,
    pocketMoney,
    annualSurplus: totalAnnualIncome - totalAnnualExpenses,
    savingsRate: totalMonthlyIncome > 0 ? ((totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyLoans) / totalMonthlyIncome * 100) : 0,
    // Goal scaling information
    goalScaling: goalScaling,
    // Investment scaling information  
    investmentScaling: investmentScaling,
    // Emergency fund scaling information
    emergencyFundScaling: emergencyFundScaling,
    availableForGoals: availableForGoals
  };
};

export const calculateMonthlyEssentialExpenses = (expenses, loans = []) => {
  // Filter out ignored expenses
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  
  const monthlyTotal = activeExpenses
    .filter(e => e.is_essential)
    .reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
    
  const annualTotal = activeExpenses
    .filter(e => e.is_essential)
    .reduce((sum, e) => sum + (e.annual_cost || 0), 0);
  
  const loanTotal = calculateTotalMonthlyLoans(loans);
  
  return {
    monthly: monthlyTotal + loanTotal,
    annual: annualTotal
  };
};

export const getCategoryBreakdown = (expenses) => {
  // Filter out ignored expenses
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  
  const categories = {};
  activeExpenses.forEach(e => {
    const cat = e.expense_category || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + (e.monthly_cost || 0);
  });
  return Object.entries(categories).sort((a, b) => b[1] - a[1]);
};

export const getEmergencyFundStatus = (expenses, currentEmergencyFunds, loans = []) => {
  // Calculate breakdown: essentials only, loans only, and total
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  const monthlyEssentialsOnly = activeExpenses
    .filter(e => e.is_essential)
    .reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const annualEssentialsOnly = activeExpenses
    .filter(e => e.is_essential)
    .reduce((sum, e) => sum + (e.annual_cost || 0), 0);
  const monthlyLoans = calculateTotalMonthlyLoans(loans);
  const totalMonthly = monthlyEssentialsOnly + monthlyLoans;
  
  const minimumRaw = (totalMonthly * 3) + annualEssentialsOnly;
  const recommendedRaw = (totalMonthly * 6) + annualEssentialsOnly;
  
  const minimum = roundToNextHundred(minimumRaw);
  const recommended = roundToNextHundred(recommendedRaw);
  const current = currentEmergencyFunds;
  
  let status = 'below';
  let color = 'red';
  let percentage = 0;
  let message = '';
  
  if (current >= recommended) {
    status = 'good';
    color = 'green';
    percentage = 100;
    message = 'Excellent! You have met your recommended emergency fund target.';
  } else if (current >= minimum) {
    status = 'warning';
    color = 'orange';
    percentage = ((current - minimum) / (recommended - minimum)) * 100;
    const shortfall = recommended - current;
    message = `Good progress! You need £${formatCurrency(shortfall)} more to reach your recommended target.`;
  } else {
    status = 'danger';
    color = 'red';
    percentage = (current / minimum) * 100;
    const shortfall = minimum - current;
    message = `You need £${formatCurrency(shortfall)} more to reach your minimum target.`;
  }
  
  return {
    monthlyEssentialsOnly,
    monthlyLoans,
    monthlyTotal: totalMonthly,
    annualEssential: annualEssentialsOnly,
    minimum,
    recommended,
    current,
    status,
    color,
    percentage,
    message
  };
};

// Savings Goals Calculations
export const calculateGoalProgress = (goal) => {
  if (!goal.target_amount || goal.target_amount === 0) return 0;
  return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
};

export const calculateMonthsToGoal = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(0, diffMonths);
};

export const calculateRequiredContribution = (targetAmount, currentAmount, monthsRemaining) => {
  if (monthsRemaining <= 0) return 0;
  const remaining = targetAmount - currentAmount;
  return Math.max(0, remaining / monthsRemaining);
};

export const calculateTotalGoalContributions = (goals) => {
  return goals
    .filter(goal => !goal.is_ignored)
    .reduce((total, goal) => total + (goal.monthly_contribution || 0), 0);
};

export const calculateScaledInvestments = (investments, pensions, availableForInvestments) => {
  const totalInvestmentContributions = calculateTotalInvestmentContributions(investments);
  const pensionContributions = calculateTotalPensionContributions(pensions);
  const totalPensionContributions = pensionContributions.employee;
  const totalOriginalContributions = totalInvestmentContributions + totalPensionContributions;

  if (!investments || investments.length === 0 && (!pensions || pensions.length === 0)) {
    return {
      scaledInvestments: [],
      scaledPensions: [],
      totalOriginalContributions: 0,
      totalScaledContributions: 0,
      scalingFactor: 1,
      isScaled: false
    };
  }

  // If we have enough funds, no scaling needed
  if (availableForInvestments >= totalOriginalContributions || totalOriginalContributions === 0) {
    return {
      scaledInvestments: investments.map(investment => ({
        ...investment,
        monthly_contribution_original: investment.monthly_contribution,
        monthly_contribution_adjusted: investment.is_ignored ? 0 : investment.monthly_contribution,
        scaling_factor: 1,
        is_scaled: false
      })),
      scaledPensions: pensions.map(pension => ({
        ...pension,
        monthly_contribution_original: pension.monthly_contribution,
        monthly_contribution_adjusted: pension.is_ignored ? 0 : pension.monthly_contribution,
        scaling_factor: 1,
        is_scaled: false
      })),
      totalOriginalContributions,
      totalScaledContributions: totalOriginalContributions,
      scalingFactor: 1,
      isScaled: false
    };
  }

  // Calculate scaling factor
  const scalingFactor = availableForInvestments > 0 ? availableForInvestments / totalOriginalContributions : 0;

  // Apply proportional scaling to each investment and pension
  const scaledInvestments = investments.map(investment => {
    if (investment.is_ignored) {
      return {
        ...investment,
        monthly_contribution_original: investment.monthly_contribution,
        monthly_contribution_adjusted: 0, // Don't contribute to budget calculations
        scaling_factor: 1,
        is_scaled: false
      };
    }
    return {
      ...investment,
      monthly_contribution_original: investment.monthly_contribution,
      monthly_contribution_adjusted: (investment.monthly_contribution || 0) * scalingFactor,
      scaling_factor: scalingFactor,
      is_scaled: scalingFactor < 1
    };
  });

  const scaledPensions = pensions.map(pension => {
    if (pension.is_ignored) {
      return {
        ...pension,
        monthly_contribution_original: pension.monthly_contribution,
        monthly_contribution_adjusted: 0, // Don't contribute to budget calculations
        scaling_factor: 1,
        is_scaled: false
      };
    }
    return {
      ...pension,
      monthly_contribution_original: pension.monthly_contribution,
      monthly_contribution_adjusted: (pension.monthly_contribution || 0) * scalingFactor,
      scaling_factor: scalingFactor,
      is_scaled: scalingFactor < 1
    };
  });

  const totalScaledContributions = scaledInvestments.filter(inv => !inv.is_ignored).reduce((sum, investment) => sum + investment.monthly_contribution_adjusted, 0) +
                                  scaledPensions.filter(pen => !pen.is_ignored).reduce((sum, pension) => sum + pension.monthly_contribution_adjusted, 0);

  return {
    scaledInvestments,
    scaledPensions,
    totalOriginalContributions,
    totalScaledContributions,
    scalingFactor,
    isScaled: scalingFactor < 1
  };
};

export const calculateScaledGoals = (goals, availableForGoals) => {
  if (!goals || goals.length === 0) {
    return {
      scaledGoals: [],
      totalOriginalContributions: 0,
      totalScaledContributions: 0,
      scalingFactor: 1,
      isScaled: false
    };
  }

  const totalOriginalContributions = calculateTotalGoalContributions(goals);
  
  // If we have enough funds, no scaling needed
  if (availableForGoals >= totalOriginalContributions || totalOriginalContributions === 0) {
    return {
      scaledGoals: goals.map(goal => ({
        ...goal,
        monthly_contribution_original: goal.monthly_contribution,
        monthly_contribution_adjusted: goal.is_ignored ? 0 : goal.monthly_contribution,
        scaling_factor: 1,
        is_scaled: false
      })),
      totalOriginalContributions,
      totalScaledContributions: totalOriginalContributions,
      scalingFactor: 1,
      isScaled: false
    };
  }

  // Calculate scaling factor
  const scalingFactor = availableForGoals > 0 ? availableForGoals / totalOriginalContributions : 0;
  
  // Apply proportional scaling to each goal
  const scaledGoals = goals.map(goal => {
    if (goal.is_ignored) {
      // Ignored goals are not scaled and don't contribute to calculations
      return {
        ...goal,
        monthly_contribution_original: goal.monthly_contribution,
        monthly_contribution_adjusted: 0, // Don't contribute to budget calculations
        scaling_factor: 1,
        is_scaled: false
      };
    }
    
    return {
      ...goal,
      monthly_contribution_original: goal.monthly_contribution,
      monthly_contribution_adjusted: (goal.monthly_contribution || 0) * scalingFactor,
      scaling_factor: scalingFactor,
      is_scaled: scalingFactor < 1
    };
  });

  const totalScaledContributions = scaledGoals
    .filter(goal => !goal.is_ignored)
    .reduce((sum, goal) => sum + goal.monthly_contribution_adjusted, 0);

  return {
    scaledGoals,
    totalOriginalContributions,
    totalScaledContributions,
    scalingFactor,
    isScaled: scalingFactor < 1
  };
};

// Loan Calculations
export const calculateTotalMonthlyLoans = (loans) => {
  return loans
    .filter(loan => !loan.is_completed && !loan.is_ignored)
    .reduce((total, loan) => total + (loan.monthly_payment || 0), 0);
};

export const calculateLoanProgress = (loan) => {
  const today = new Date();
  const startDate = new Date(loan.start_date);
  const endDate = new Date(loan.end_date);
  
  const totalDuration = endDate - startDate;
  const elapsed = today - startDate;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  return progress;
};

export const getMonthsRemainingForLoan = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(0, diffMonths);
};

export const checkLoanCompletion = (loan) => {
  const today = new Date();
  const endDate = new Date(loan.end_date);
  return today >= endDate;
};

// Investment Calculations
export const calculateInvestmentGainLoss = (currentValue, initialInvestment) => {
  if (!initialInvestment || initialInvestment === 0) return { gain: 0, percentage: 0 };
  
  const gain = currentValue - initialInvestment;
  const percentage = (gain / initialInvestment) * 100;
  
  return { gain, percentage };
};

export const calculateTotalInvestmentValue = (investments = []) => {
  return investments.reduce((total, investment) => total + (investment.current_value || 0), 0);
};

export const calculateTotalPensionValue = (pensions = []) => {
  return pensions.reduce((total, pension) => total + (pension.current_value || 0), 0);
};

export const calculateTotalInvestmentContributions = (investments = []) => {
  return investments
    .filter(investment => !investment.is_ignored)
    .reduce((total, investment) => total + (investment.monthly_contribution || 0), 0);
};

export const calculateTotalPensionContributions = (pensions = []) => {
  const activeP = pensions.filter(pension => !pension.is_ignored);
  const employeeContributions = activeP.reduce((total, pension) => total + (pension.monthly_contribution || 0), 0);
  const employerContributions = activeP.reduce((total, pension) => total + (pension.employer_contribution || 0), 0);
  
  return {
    employee: employeeContributions,
    employer: employerContributions,
    total: employeeContributions + employerContributions
  };
};

export const calculateInvestmentAllocation = (investments = []) => {
  const totalValue = calculateTotalInvestmentValue(investments);
  if (totalValue === 0) return [];
  
  return investments.map(investment => ({
    ...investment,
    percentage: ((investment.current_value || 0) / totalValue) * 100
  }));
};