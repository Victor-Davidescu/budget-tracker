import React from 'react';
import EssentialLivingExpenses from '../ui/EssentialLivingExpenses.jsx';
import NonEssentialExpenses from '../ui/NonEssentialExpenses.jsx';

const Expenses = ({ expenseHook, totalNetIncome }) => {
  return (
    <div className="space-y-6">
      {/* Essential Living Expenses Section */}
      <EssentialLivingExpenses expenseHook={expenseHook} totalNetIncome={totalNetIncome} />

      {/* Non-Essential Expenses Section */}
      <NonEssentialExpenses expenseHook={expenseHook} totalNetIncome={totalNetIncome} />
    </div>
  );
};

export default Expenses;