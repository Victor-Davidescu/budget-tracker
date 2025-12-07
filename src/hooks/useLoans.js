import { useState } from 'react';
import { apiService } from '../services/api.js';
import { calculateLoanProgress, checkLoanCompletion } from '../services/calculations.js';
import { DEFAULT_LOAN } from '../utils/constants.js';

export const useLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loanForm, setLoanForm] = useState(DEFAULT_LOAN);
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState(null);

  const generateLoanId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const saveLoansData = async (data) => {
    try {
      await apiService.saveLoans(data);
    } catch (error) {
      console.error('Error saving loans data:', error);
    }
  };

  const addLoan = async () => {
    if (!loanForm.name || !loanForm.category || !loanForm.monthly_payment || !loanForm.start_date || !loanForm.end_date) {
      return false;
    }

    const newLoan = {
      ...loanForm,
      id: generateLoanId(),
      monthly_payment: parseFloat(loanForm.monthly_payment) || 0,
      is_completed: checkLoanCompletion(loanForm),
      progress: calculateLoanProgress(loanForm)
    };

    const updatedLoans = [...loans, newLoan];
    setLoans(updatedLoans);
    await saveLoansData(updatedLoans);

    setLoanForm(DEFAULT_LOAN);
    setIsAddingLoan(false);
    return true;
  };

  const updateLoan = async (loanId, updates) => {
    const updatedLoans = loans.map(loan => {
      if (loan.id === loanId) {
        const updatedLoan = { ...loan, ...updates };
        updatedLoan.is_completed = checkLoanCompletion(updatedLoan);
        updatedLoan.progress = calculateLoanProgress(updatedLoan);
        return updatedLoan;
      }
      return loan;
    });

    setLoans(updatedLoans);
    await saveLoansData(updatedLoans);
  };

  const deleteLoan = async (loanId) => {
    const updatedLoans = loans.filter(loan => loan.id !== loanId);
    setLoans(updatedLoans);
    await saveLoansData(updatedLoans);
  };

  const startEditLoan = (loan) => {
    setLoanForm({ ...loan });
    setEditingLoanId(loan.id);
    setIsAddingLoan(true);
  };

  const saveEditLoan = async () => {
    if (!loanForm.name || !loanForm.category || !loanForm.monthly_payment || !loanForm.start_date || !loanForm.end_date) {
      return false;
    }

    await updateLoan(editingLoanId, loanForm);
    setLoanForm(DEFAULT_LOAN);
    setEditingLoanId(null);
    setIsAddingLoan(false);
    return true;
  };

  const cancelLoanEdit = () => {
    setLoanForm(DEFAULT_LOAN);
    setEditingLoanId(null);
    setIsAddingLoan(false);
  };

  const markLoanCompleted = async (loanId) => {
    await updateLoan(loanId, { is_completed: true });
  };

  const sortLoansAlphabetically = async () => {
    const sortedLoans = [...loans].sort((a, b) => a.name.localeCompare(b.name));
    setLoans(sortedLoans);
    await saveLoansData(sortedLoans);
  };

  const toggleLoanIgnored = async (loanId) => {
    const updatedLoans = loans.map(loan => 
      loan.id === loanId ? { ...loan, is_ignored: !loan.is_ignored } : loan
    );
    setLoans(updatedLoans);
    await saveLoansData(updatedLoans);
  };

  return {
    loans,
    setLoans,
    loanForm,
    setLoanForm,
    isAddingLoan,
    setIsAddingLoan,
    editingLoanId,
    addLoan,
    updateLoan,
    deleteLoan,
    startEditLoan,
    saveEditLoan,
    cancelLoanEdit,
    markLoanCompleted,
    sortLoansAlphabetically,
    toggleLoanIgnored
  };
};