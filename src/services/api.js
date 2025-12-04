import { API_URL } from '../utils/constants.js';

export const apiService = {
  async fetchExpenses() {
    const response = await fetch(`${API_URL}/api/expenses`);
    return response.json();
  },

  async saveExpenses(expenses) {
    const response = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenses)
    });
    return response.json();
  },

  async fetchIncome() {
    const response = await fetch(`${API_URL}/api/income`);
    return response.json();
  },

  async saveIncome(income) {
    const response = await fetch(`${API_URL}/api/income`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(income)
    });
    return response.json();
  },

  async fetchSavings() {
    const response = await fetch(`${API_URL}/api/savings`);
    return response.json();
  },

  async saveSavings(savings) {
    const response = await fetch(`${API_URL}/api/savings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savings)
    });
    return response.json();
  },

  async fetchLoans() {
    const response = await fetch(`${API_URL}/api/loans`);
    return response.json();
  },

  async saveLoans(loans) {
    const response = await fetch(`${API_URL}/api/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loans)
    });
    return response.json();
  },

  async fetchInvestments() {
    const response = await fetch(`${API_URL}/api/investments`);
    return response.json();
  },

  async saveInvestments(investments) {
    const response = await fetch(`${API_URL}/api/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investments)
    });
    return response.json();
  },

  async loadAllData() {
    try {
      const [expensesRes, incomeRes, savingsRes, loansRes, investmentsRes] = await Promise.all([
        this.fetchExpenses(),
        this.fetchIncome(),
        this.fetchSavings(),
        this.fetchLoans(),
        this.fetchInvestments()
      ]);
      
      return {
        expenses: expensesRes,
        income: incomeRes,
        savings: savingsRes,
        loans: loansRes,
        investments: investmentsRes
      };
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
};