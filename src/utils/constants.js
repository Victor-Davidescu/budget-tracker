export const API_URL = '';

export const TABS = {
  OVERVIEW: 'overview',
  INCOME: 'income',
  EXPENSES: 'expenses',
  LOANS: 'loans',
  SAVINGS: 'savings'
};

export const LOAN_CATEGORIES = [
  'Car Loan',
  'Personal Loan', 
  'Credit Card'
];

export const DEFAULT_LOAN = {
  id: '',
  name: '',
  category: '',
  monthly_payment: 0,
  start_date: '',
  end_date: '',
  is_completed: false
};

export const DEFAULT_EXPENSE = {
  expense_category: '',
  expense_name: '',
  monthly_cost: '',
  annual_cost: '',
  is_essential: true,
  is_ignored: false
};

export const DEFAULT_INCOME = {
  income_source: '',
  monthly_pay: '',
  annual_pay: ''
};

export const DEFAULT_SAVINGS = {
  emergency_funds: 0,
  monthly_savings: 0,
  goals: []
};

export const DEFAULT_SAVINGS_GOAL = {
  id: null,
  name: '',
  target_amount: '',
  target_date: '',
  current_amount: 0,
  monthly_contribution: 0
};

export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};