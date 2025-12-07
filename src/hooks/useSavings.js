import { useState } from 'react';
import { apiService } from '../services/api.js';
import { calculateTotals, calculateGoalProgress, calculateMonthsToGoal, calculateRequiredContribution, calculateTotalGoalContributions } from '../services/calculations.js';
import { DEFAULT_SAVINGS_GOAL } from '../utils/constants.js';

export const useSavings = (expenses, income) => {
  const [currentEmergencyFunds, setCurrentEmergencyFunds] = useState(0);
  const [emergencyFundsInput, setEmergencyFundsInput] = useState('');
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [monthlySavingsInput, setMonthlySavingsInput] = useState('');
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [goalForm, setGoalForm] = useState(DEFAULT_SAVINGS_GOAL);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [isEditingEmergencyFund, setIsEditingEmergencyFund] = useState(false);

  const generateGoalId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const saveSavingsData = async (data) => {
    try {
      await apiService.saveSavings(data);
    } catch (error) {
      console.error('Error saving savings data:', error);
    }
  };

  const updateEmergencyFunds = async () => {
    const amount = parseFloat(emergencyFundsInput);
    if (!isNaN(amount) && amount >= 0) {
      setCurrentEmergencyFunds(amount);
      await saveSavingsData({
        emergency_funds: amount,
        monthly_savings: monthlySavings,
        goals: savingsGoals
      });
    }
  };

  const updateMonthlySavings = async (value) => {
    const amount = parseFloat(value);
    // Calculate basic surplus without any savings allocations
    const totalIncome = income.reduce((sum, i) => sum + i.monthly_pay, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
    const monthlySurplus = totalIncome - totalExpenses;
    const goalContributions = calculateTotalGoalContributions(savingsGoals);
    const maxSavings = Math.max(0, monthlySurplus - goalContributions);
    
    if (!isNaN(amount) && amount >= 0) {
      const adjustedAmount = Math.min(amount, maxSavings);
      setMonthlySavings(adjustedAmount);
      setMonthlySavingsInput(adjustedAmount.toString());
      await saveSavingsData({
        emergency_funds: currentEmergencyFunds,
        monthly_savings: adjustedAmount,
        goals: savingsGoals
      });
    }
  };

  const handleSavingsSliderChange = (e) => {
    const value = e.target.value;
    setMonthlySavingsInput(value);
    updateMonthlySavings(value);
  };

  const handleSavingsInputChange = (e) => {
    const value = e.target.value;
    setMonthlySavingsInput(value);
  };

  const handleSavingsInputBlur = () => {
    updateMonthlySavings(monthlySavingsInput);
  };

  // Savings Goals Functions
  const addSavingsGoal = async () => {
    if (!goalForm.name || !goalForm.target_amount || !goalForm.target_date) {
      return false;
    }

    const monthsRemaining = calculateMonthsToGoal(goalForm.target_date);
    const requiredContribution = calculateRequiredContribution(
      goalForm.target_amount,
      goalForm.current_amount || 0,
      monthsRemaining
    );

    const newGoal = {
      ...goalForm,
      id: generateGoalId(),
      current_amount: goalForm.current_amount || 0,
      monthly_contribution: requiredContribution,
      progress: calculateGoalProgress(goalForm)
    };

    const updatedGoals = [...savingsGoals, newGoal];
    setSavingsGoals(updatedGoals);
    
    await saveSavingsData({
      emergency_funds: currentEmergencyFunds,
      monthly_savings: monthlySavings,
      goals: updatedGoals
    });

    setGoalForm(DEFAULT_SAVINGS_GOAL);
    setIsAddingGoal(false);
    return true;
  };

  const updateSavingsGoal = async (goalId, updates) => {
    const updatedGoals = savingsGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, ...updates };
        
        // Recalculate monthly contribution if amount or date changed
        if (updates.target_amount !== undefined || updates.target_date !== undefined || updates.current_amount !== undefined) {
          const monthsRemaining = calculateMonthsToGoal(updatedGoal.target_date);
          updatedGoal.monthly_contribution = calculateRequiredContribution(
            updatedGoal.target_amount,
            updatedGoal.current_amount,
            monthsRemaining
          );
        }

        updatedGoal.progress = calculateGoalProgress(updatedGoal);
        return updatedGoal;
      }
      return goal;
    });

    setSavingsGoals(updatedGoals);
    
    await saveSavingsData({
      emergency_funds: currentEmergencyFunds,
      monthly_savings: monthlySavings,
      goals: updatedGoals
    });
  };

  const deleteSavingsGoal = async (goalId) => {
    const updatedGoals = savingsGoals.filter(goal => goal.id !== goalId);
    setSavingsGoals(updatedGoals);
    
    await saveSavingsData({
      emergency_funds: currentEmergencyFunds,
      monthly_savings: monthlySavings,
      goals: updatedGoals
    });
  };

  const toggleGoalIgnored = async (goalId) => {
    const updatedGoals = savingsGoals.map(goal => 
      goal.id === goalId ? { ...goal, is_ignored: !goal.is_ignored } : goal
    );
    setSavingsGoals(updatedGoals);
    
    await saveSavingsData({
      emergency_funds: currentEmergencyFunds,
      monthly_savings: monthlySavings,
      goals: updatedGoals
    });
  };

  const startEditGoal = (goal) => {
    setGoalForm({ ...goal });
    setEditingGoalId(goal.id);
    setIsAddingGoal(true);
  };

  const saveEditGoal = async () => {
    if (!goalForm.name || !goalForm.target_amount || !goalForm.target_date) {
      return false;
    }

    await updateSavingsGoal(editingGoalId, goalForm);
    setGoalForm(DEFAULT_SAVINGS_GOAL);
    setEditingGoalId(null);
    setIsAddingGoal(false);
    return true;
  };

  const cancelGoalEdit = () => {
    setGoalForm(DEFAULT_SAVINGS_GOAL);
    setEditingGoalId(null);
    setIsAddingGoal(false);
  };

  const startEditEmergencyFund = () => {
    setIsEditingEmergencyFund(true);
  };

  const saveEmergencyFundEdit = async () => {
    const emergencyAmount = parseFloat(emergencyFundsInput);
    const savingsAmount = parseFloat(monthlySavingsInput);
    
    let finalEmergencyAmount = currentEmergencyFunds;
    let finalSavingsAmount = monthlySavings;
    
    if (!isNaN(emergencyAmount) && emergencyAmount >= 0) {
      setCurrentEmergencyFunds(emergencyAmount);
      finalEmergencyAmount = emergencyAmount;
    }
    
    if (!isNaN(savingsAmount) && savingsAmount >= 0) {
      const totalIncome = income.reduce((sum, i) => sum + i.monthly_pay, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (e.monthly_cost || 0), 0);
      const monthlySurplus = totalIncome - totalExpenses;
      const goalContributions = calculateTotalGoalContributions(savingsGoals);
      const maxSavings = Math.max(0, monthlySurplus - goalContributions);
      const adjustedAmount = Math.min(savingsAmount, maxSavings);
      setMonthlySavings(adjustedAmount);
      setMonthlySavingsInput(adjustedAmount.toString());
      finalSavingsAmount = adjustedAmount;
    }
    
    await saveSavingsData({
      emergency_funds: finalEmergencyAmount,
      monthly_savings: finalSavingsAmount,
      goals: savingsGoals
    });
    
    setIsEditingEmergencyFund(false);
  };

  const cancelEmergencyFundEdit = () => {
    setEmergencyFundsInput(currentEmergencyFunds.toString());
    setMonthlySavingsInput(monthlySavings.toString());
    setIsEditingEmergencyFund(false);
  };

  return {
    currentEmergencyFunds,
    setCurrentEmergencyFunds,
    emergencyFundsInput,
    setEmergencyFundsInput,
    monthlySavings,
    setMonthlySavings,
    monthlySavingsInput,
    setMonthlySavingsInput,
    updateEmergencyFunds,
    updateMonthlySavings,
    handleSavingsSliderChange,
    handleSavingsInputChange,
    handleSavingsInputBlur,
    
    // Savings Goals
    savingsGoals,
    setSavingsGoals,
    goalForm,
    setGoalForm,
    isAddingGoal,
    setIsAddingGoal,
    editingGoalId,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    toggleGoalIgnored,
    startEditGoal,
    saveEditGoal,
    cancelGoalEdit,
    
    // Emergency Fund Editing
    isEditingEmergencyFund,
    startEditEmergencyFund,
    saveEmergencyFundEdit,
    cancelEmergencyFundEdit
  };
};