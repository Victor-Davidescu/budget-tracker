import { useState } from 'react';
import { apiService } from '../services/api.js';
import { DEFAULT_EXPENSE } from '../utils/constants.js';
import { hasValue, parseNumber } from '../utils/formatters.js';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState(DEFAULT_EXPENSE);

  const saveExpenses = async (data) => {
    setExpenses(data);
    try {
      await apiService.saveExpenses(data);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const addExpense = () => {
    const hasMonthly = hasValue(newExpense.monthly_cost);
    const hasAnnual = hasValue(newExpense.annual_cost);
    
    if (newExpense.expense_name && (hasMonthly || hasAnnual)) {
      const monthlyValue = parseNumber(newExpense.monthly_cost);
      const annualValue = parseNumber(newExpense.annual_cost);
      
      const expense = {
        expense_category: newExpense.expense_category,
        expense_name: newExpense.expense_name,
        monthly_cost: monthlyValue,
        annual_cost: annualValue,
        is_essential: newExpense.is_essential,
        id: Date.now()
      };
      
      saveExpenses([...expenses, expense]);
      setNewExpense(DEFAULT_EXPENSE);
    }
  };

  const deleteExpense = (id) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  const startEditExpense = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      expense_category: expense.expense_category,
      expense_name: expense.expense_name,
      monthly_cost: expense.monthly_cost !== undefined && expense.monthly_cost !== null ? expense.monthly_cost.toString() : '',
      annual_cost: expense.annual_cost !== undefined && expense.annual_cost !== null ? expense.annual_cost.toString() : '',
      is_essential: expense.is_essential
    });
  };

  const updateExpense = () => {
    const hasMonthly = hasValue(newExpense.monthly_cost);
    const hasAnnual = hasValue(newExpense.annual_cost);
    
    if (editingExpense && newExpense.expense_name && (hasMonthly || hasAnnual)) {
      const monthlyValue = parseNumber(newExpense.monthly_cost);
      const annualValue = parseNumber(newExpense.annual_cost);
      
      const updatedExpense = {
        ...editingExpense,
        expense_category: newExpense.expense_category,
        expense_name: newExpense.expense_name,
        monthly_cost: monthlyValue,
        annual_cost: annualValue,
        is_essential: newExpense.is_essential
      };
      
      saveExpenses(expenses.map(e => e.id === editingExpense.id ? updatedExpense : e));
      setEditingExpense(null);
      setNewExpense(DEFAULT_EXPENSE);
    }
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setNewExpense(DEFAULT_EXPENSE);
  };

  const sortExpensesAlphabetically = () => {
    const sorted = [...expenses].sort((a, b) => {
      const categoryCompare = (a.expense_category || '').localeCompare(b.expense_category || '');
      if (categoryCompare !== 0) return categoryCompare;
      return a.expense_name.localeCompare(b.expense_name);
    });
    saveExpenses(sorted);
  };

  return {
    expenses,
    setExpenses,
    editingExpense,
    newExpense,
    setNewExpense,
    addExpense,
    deleteExpense,
    startEditExpense,
    updateExpense,
    cancelEdit,
    sortExpensesAlphabetically
  };
};