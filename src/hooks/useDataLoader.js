import { useEffect } from 'react';
import { apiService } from '../services/api.js';
import { DEFAULT_SAVINGS } from '../utils/constants.js';

export const useDataLoader = (
  setExpenses, 
  setIncome, 
  setCurrentEmergencyFunds, 
  setEmergencyFundsInput, 
  setMonthlySavings, 
  setMonthlySavingsInput,
  setSavingsGoals,
  setLoans,
  setInvestments,
  setPensions
) => {
  const loadData = async () => {
    try {
      const { expenses, income, savings, loans, investments } = await apiService.loadAllData();
      
      setExpenses(expenses);
      setIncome(income);
      setCurrentEmergencyFunds(savings.emergency_funds || DEFAULT_SAVINGS.emergency_funds);
      setEmergencyFundsInput((savings.emergency_funds || DEFAULT_SAVINGS.emergency_funds).toString());
      setMonthlySavings(savings.monthly_savings || DEFAULT_SAVINGS.monthly_savings);
      setMonthlySavingsInput((savings.monthly_savings || DEFAULT_SAVINGS.monthly_savings).toString());
      
      // Load savings goals with backward compatibility
      setSavingsGoals(savings.goals || DEFAULT_SAVINGS.goals || []);
      
      // Load loans
      setLoans(loans || []);
      
      // Load investments
      if (investments) {
        setInvestments(investments.investments || []);
        setPensions(investments.pensions || []);
      } else {
        setInvestments([]);
        setPensions([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { loadData };
};