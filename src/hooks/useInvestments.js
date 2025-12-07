import { useState } from 'react';
import { apiService } from '../services/api.js';
import { DEFAULT_INVESTMENT, DEFAULT_PENSION } from '../utils/constants.js';

export const useInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [pensions, setPensions] = useState([]);
  const [investmentForm, setInvestmentForm] = useState(DEFAULT_INVESTMENT);
  const [pensionForm, setPensionForm] = useState(DEFAULT_PENSION);
  const [isAddingInvestment, setIsAddingInvestment] = useState(false);
  const [isAddingPension, setIsAddingPension] = useState(false);
  const [editingInvestmentId, setEditingInvestmentId] = useState(null);
  const [editingPensionId, setEditingPensionId] = useState(null);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const saveInvestmentData = async (investmentData, pensionData) => {
    try {
      await apiService.saveInvestments({ investments: investmentData, pensions: pensionData });
    } catch (error) {
      console.error('Error saving investment data:', error);
    }
  };

  // Investment Functions
  const addInvestment = async () => {
    if (!investmentForm.account_name || !investmentForm.account_type) {
      return false;
    }

    const newInvestment = {
      ...investmentForm,
      id: generateId(),
      current_value: parseFloat(investmentForm.current_value) || 0,
      initial_investment: parseFloat(investmentForm.initial_investment) || 0,
      monthly_contribution: parseFloat(investmentForm.monthly_contribution) || 0
    };

    const updatedInvestments = [...investments, newInvestment];
    setInvestments(updatedInvestments);
    await saveInvestmentData(updatedInvestments, pensions);
    
    setInvestmentForm(DEFAULT_INVESTMENT);
    setIsAddingInvestment(false);
    return true;
  };

  const updateInvestment = async (investmentId, updates) => {
    const updatedInvestments = investments.map(investment =>
      investment.id === investmentId ? { ...investment, ...updates } : investment
    );
    
    setInvestments(updatedInvestments);
    await saveInvestmentData(updatedInvestments, pensions);
  };

  const deleteInvestment = async (investmentId) => {
    const updatedInvestments = investments.filter(investment => investment.id !== investmentId);
    setInvestments(updatedInvestments);
    await saveInvestmentData(updatedInvestments, pensions);
  };

  const startEditInvestment = (investment) => {
    setInvestmentForm({ ...investment });
    setEditingInvestmentId(investment.id);
    setIsAddingInvestment(true);
  };

  const saveEditInvestment = async () => {
    if (!investmentForm.account_name || !investmentForm.account_type) {
      return false;
    }

    await updateInvestment(editingInvestmentId, investmentForm);
    setInvestmentForm(DEFAULT_INVESTMENT);
    setEditingInvestmentId(null);
    setIsAddingInvestment(false);
    return true;
  };

  const cancelInvestmentEdit = () => {
    setInvestmentForm(DEFAULT_INVESTMENT);
    setEditingInvestmentId(null);
    setIsAddingInvestment(false);
  };

  // Pension Functions
  const addPension = async () => {
    if (!pensionForm.account_name || !pensionForm.pension_type) {
      return false;
    }

    const newPension = {
      ...pensionForm,
      id: generateId(),
      current_value: parseFloat(pensionForm.current_value) || 0,
      initial_investment: parseFloat(pensionForm.initial_investment) || 0,
      monthly_contribution: parseFloat(pensionForm.monthly_contribution) || 0,
      employer_contribution: parseFloat(pensionForm.employer_contribution) || 0
    };

    const updatedPensions = [...pensions, newPension];
    setPensions(updatedPensions);
    await saveInvestmentData(investments, updatedPensions);
    
    setPensionForm(DEFAULT_PENSION);
    setIsAddingPension(false);
    return true;
  };

  const updatePension = async (pensionId, updates) => {
    const updatedPensions = pensions.map(pension =>
      pension.id === pensionId ? { ...pension, ...updates } : pension
    );
    
    setPensions(updatedPensions);
    await saveInvestmentData(investments, updatedPensions);
  };

  const deletePension = async (pensionId) => {
    const updatedPensions = pensions.filter(pension => pension.id !== pensionId);
    setPensions(updatedPensions);
    await saveInvestmentData(investments, updatedPensions);
  };

  const startEditPension = (pension) => {
    setPensionForm({ ...pension });
    setEditingPensionId(pension.id);
    setIsAddingPension(true);
  };

  const saveEditPension = async () => {
    if (!pensionForm.account_name || !pensionForm.pension_type) {
      return false;
    }

    await updatePension(editingPensionId, pensionForm);
    setPensionForm(DEFAULT_PENSION);
    setEditingPensionId(null);
    setIsAddingPension(false);
    return true;
  };

  const cancelPensionEdit = () => {
    setPensionForm(DEFAULT_PENSION);
    setEditingPensionId(null);
    setIsAddingPension(false);
  };

  const toggleInvestmentIgnored = async (investmentId) => {
    const updatedInvestments = investments.map(investment => 
      investment.id === investmentId ? { ...investment, is_ignored: !investment.is_ignored } : investment
    );
    setInvestments(updatedInvestments);
    await saveInvestmentData(updatedInvestments, pensions);
  };

  const togglePensionIgnored = async (pensionId) => {
    const updatedPensions = pensions.map(pension => 
      pension.id === pensionId ? { ...pension, is_ignored: !pension.is_ignored } : pension
    );
    setPensions(updatedPensions);
    await saveInvestmentData(investments, updatedPensions);
  };

  return {
    // Investment state
    investments,
    setInvestments,
    investmentForm,
    setInvestmentForm,
    isAddingInvestment,
    setIsAddingInvestment,
    editingInvestmentId,

    // Investment functions
    addInvestment,
    updateInvestment,
    deleteInvestment,
    startEditInvestment,
    saveEditInvestment,
    cancelInvestmentEdit,

    // Pension state
    pensions,
    setPensions,
    pensionForm,
    setPensionForm,
    isAddingPension,
    setIsAddingPension,
    editingPensionId,

    // Pension functions
    addPension,
    updatePension,
    deletePension,
    startEditPension,
    saveEditPension,
    cancelPensionEdit,
    toggleInvestmentIgnored,
    togglePensionIgnored
  };
};