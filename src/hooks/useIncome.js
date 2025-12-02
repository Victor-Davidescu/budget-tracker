import { useState } from 'react';
import { apiService } from '../services/api.js';
import { DEFAULT_INCOME } from '../utils/constants.js';

export const useIncome = () => {
  const [income, setIncome] = useState([]);
  const [newIncome, setNewIncome] = useState(DEFAULT_INCOME);

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
        id: Date.now()
      };
      saveIncome([...income, incomeItem]);
      setNewIncome(DEFAULT_INCOME);
    }
  };

  const deleteIncome = (id) => {
    saveIncome(income.filter(i => i.id !== id));
  };

  return {
    income,
    setIncome,
    newIncome,
    setNewIncome,
    addIncome,
    deleteIncome
  };
};