import React from 'react';
import ExpenseTable from '../ui/ExpenseTable.jsx';

const Expenses = ({ expenseHook, totalNetIncome }) => {
  // Color schemes for different expense types
  const essentialColorScheme = {
    border: 'border-blue-200',
    text: 'text-blue-600',
    textBold: 'text-blue-700',
    textHover: 'hover:text-blue-800',
    cellBg: 'bg-blue-50',
    button: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    formBg: 'bg-blue-50',
    formText: 'text-blue-800',
    inputBorder: 'border-blue-300',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-800',
    rowHover: 'bg-blue-25'
  };

  const nonEssentialColorScheme = {
    border: 'border-purple-200',
    text: 'text-purple-600',
    textBold: 'text-purple-700',
    textHover: 'hover:text-purple-800',
    cellBg: 'bg-purple-50',
    button: 'bg-purple-600',
    buttonHover: 'hover:bg-purple-700',
    formBg: 'bg-purple-50',
    formText: 'text-purple-800',
    inputBorder: 'border-purple-300',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-800',
    rowHover: 'bg-purple-25'
  };

  return (
    <div className="space-y-6">
      {/* Essential Living Expenses Section */}
      <ExpenseTable 
        expenseHook={expenseHook} 
        totalNetIncome={totalNetIncome}
        isEssential={true}
        title="Essential Expenses (Needs)"
        colorScheme={essentialColorScheme}
        thresholds={{ good: 45, acceptable: 50 }}
      />

      {/* Non-Essential Expenses Section */}
      <ExpenseTable 
        expenseHook={expenseHook} 
        totalNetIncome={totalNetIncome}
        isEssential={false}
        title="Non-Essential Expenses (Wants)"
        colorScheme={nonEssentialColorScheme}
        thresholds={{ good: 25, acceptable: 30 }}
      />
    </div>
  );
};

export default Expenses;