import { parseNumber, roundToNextHundred } from '../utils/formatters.js';

export const calculateTotalAnnual = (expense) => {
  const monthly = expense.monthly_cost || 0;
  const annual = expense.annual_cost || 0;
  return (monthly * 12) + annual;
};

export const calculateTotals = (expenses, income, monthlySavings, savingsGoals = [], loans = []) => {
  // Filter out ignored expenses
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  
  const totalMonthlyIncome = income.reduce((sum, i) => sum + i.monthly_pay, 0);
  const totalAnnualIncome = income.reduce((sum, i) => sum + i.annual_pay, 0);
  const totalMonthlyExpenses = activeExpenses.reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const totalMonthlyLoans = calculateTotalMonthlyLoans(loans);
  const totalAnnualExpenses = activeExpenses.reduce((sum, e) => sum + calculateTotalAnnual(e), 0);
  const essentialExpenses = activeExpenses.filter(e => e.is_essential).reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const nonEssentialExpenses = activeExpenses.filter(e => !e.is_essential).reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
  const monthlySurplusRaw = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyLoans;
  
  const totalGoalContributions = calculateTotalGoalContributions(savingsGoals);
  const totalSavingsAllocated = monthlySavings + totalGoalContributions;
  const maxSavings = Math.max(0, monthlySurplusRaw);
  const adjustedMonthlySavings = monthlySurplusRaw <= 0 ? 0 : Math.min(monthlySavings, maxSavings);
  const pocketMoney = monthlySurplusRaw <= 0 ? 0 : monthlySurplusRaw - totalSavingsAllocated;
  
  return {
    totalMonthlyIncome,
    totalAnnualIncome,
    totalMonthlyExpenses,
    totalMonthlyLoans,
    totalAnnualExpenses,
    essentialExpenses,
    nonEssentialExpenses,
    monthlySurplus: monthlySurplusRaw,
    monthlySavings: monthlySavings,
    totalGoalContributions,
    totalSavingsAllocated,
    pocketMoney,
    annualSurplus: totalAnnualIncome - totalAnnualExpenses,
    savingsRate: totalMonthlyIncome > 0 ? ((totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyLoans) / totalMonthlyIncome * 100) : 0
  };
};

export const calculateMonthlyEssentialExpenses = (expenses, loans = []) => {
  // Filter out ignored expenses
  const activeExpenses = expenses.filter(e => !e.is_ignored);
  
  const expenseTotal = activeExpenses
    .filter(e => e.is_essential)
    .reduce((sum, e) => {
      const monthly = e.monthly_cost || 0;
      const annualAsMonthly = e.annual_cost ? e.annual_cost / 12 : 0;
      return sum + monthly + annualAsMonthly;
    }, 0);
  
  const loanTotal = calculateTotalMonthlyLoans(loans);
  
  return expenseTotal + loanTotal;
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
  const monthlyEssential = calculateMonthlyEssentialExpenses(expenses, loans);
  const minimumRaw = monthlyEssential * 3;
  const recommendedRaw = monthlyEssential * 6;
  
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
    const monthsToGo = ((recommended - current) / monthlyEssential).toFixed(1);
    message = `Good progress! You're ${monthsToGo} months away from your recommended target.`;
  } else {
    status = 'danger';
    color = 'red';
    percentage = (current / minimum) * 100;
    const monthsToGo = ((minimum - current) / monthlyEssential).toFixed(1);
    message = `You're ${monthsToGo} months away from your minimum target.`;
  }
  
  return {
    monthlyEssential,
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
  return goals.reduce((total, goal) => total + (goal.monthly_contribution || 0), 0);
};

export const validateGoalAllocation = (goals, availableSavings, emergencyContribution = 0) => {
  const totalGoalContributions = calculateTotalGoalContributions(goals);
  const totalAllocated = totalGoalContributions + emergencyContribution;
  
  return {
    totalGoalContributions,
    totalAllocated,
    remaining: Math.max(0, availableSavings - totalAllocated),
    isOverAllocated: totalAllocated > availableSavings,
    overAllocation: Math.max(0, totalAllocated - availableSavings)
  };
};

// Loan Calculations
export const calculateTotalMonthlyLoans = (loans) => {
  return loans
    .filter(loan => !loan.is_completed)
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