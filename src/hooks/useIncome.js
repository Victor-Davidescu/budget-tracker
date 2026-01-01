import { useState } from 'react';
import { apiService } from '../services/api.js';
import { DEFAULT_INCOME } from '../utils/constants.js';

export const useIncome = () => {
  const [income, setIncome] = useState([]);
  const [newIncome, setNewIncome] = useState(DEFAULT_INCOME);
  const [editingIncome, setEditingIncome] = useState(null);

  const saveIncome = async (data) => {
    setIncome(data);
    try {
      await apiService.saveIncome(data);
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const addIncome = () => {
    if (newIncome.income_source && newIncome.monthly_pay) {
      const monthlyValue = parseFloat(newIncome.monthly_pay);
      const incomeItem = {
        ...newIncome,
        monthly_pay: monthlyValue,
        annual_pay: newIncome.annual_pay ? parseFloat(newIncome.annual_pay) : monthlyValue * 12,
        is_ignored: false,
        id: Date.now()
      };
      saveIncome([...income, incomeItem]);
      setNewIncome(DEFAULT_INCOME);
    }
  };

  const deleteIncome = (id) => {
    saveIncome(income.filter(i => i.id !== id));
  };

  const toggleIncomeIgnored = (id) => {
    const updatedIncome = income.map(item =>
      item.id === id ? { ...item, is_ignored: !item.is_ignored } : item
    );
    saveIncome(updatedIncome);
  };

  const startEditIncome = (incomeItem) => {
    setEditingIncome(incomeItem);
    setNewIncome({
      income_source: incomeItem.income_source,
      monthly_pay: incomeItem.monthly_pay,
      annual_pay: incomeItem.annual_pay,
      is_ignored: incomeItem.is_ignored || false
    });
  };

  const updateIncome = () => {
    if (editingIncome && newIncome.income_source && newIncome.monthly_pay) {
      const monthlyValue = parseFloat(newIncome.monthly_pay);
      const updatedIncome = income.map(item =>
        item.id === editingIncome.id
          ? {
              ...item,
              income_source: newIncome.income_source,
              monthly_pay: monthlyValue,
              annual_pay: newIncome.annual_pay ? parseFloat(newIncome.annual_pay) : monthlyValue * 12,
              is_ignored: newIncome.is_ignored || false
            }
          : item
      );
      saveIncome(updatedIncome);
      setNewIncome(DEFAULT_INCOME);
      setEditingIncome(null);
    }
  };

  const cancelEdit = () => {
    setNewIncome(DEFAULT_INCOME);
    setEditingIncome(null);
  };

  const sortIncomeAlphabetically = () => {
    const sortedIncome = [...income].sort((a, b) => 
      a.income_source.localeCompare(b.income_source)
    );
    setIncome(sortedIncome);
  };

  const sortIncomeByAmount = () => {
    const sortedIncome = [...income].sort((a, b) => 
      b.monthly_pay - a.monthly_pay
    );
    setIncome(sortedIncome);
  };

  return {
    income,
    setIncome,
    newIncome,
    setNewIncome,
    editingIncome,
    addIncome,
    deleteIncome,
    toggleIncomeIgnored,
    startEditIncome,
    updateIncome,
    cancelEdit,
    sortIncomeAlphabetically,
    sortIncomeByAmount
  };
};