import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, CheckCircle, RefreshCw, Eye, EyeOff, ArrowDownUp } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { LOAN_CATEGORIES } from '../../utils/constants.js';
import { formatCurrency } from '../../utils/formatters.js';
import { getMonthsRemainingForLoan } from '../../services/calculations.js';

const Loans = ({ loanHook }) => {
  const [sortAmountDesc, setSortAmountDesc] = useState(true);

  const handleSortByAmount = () => {
    loanHook.sortLoansByAmount(sortAmountDesc);
    setSortAmountDesc(!sortAmountDesc);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-700">Your Loans</h3>
          <div className="flex gap-3">
            <button
              onClick={loanHook.sortLoansAlphabetically}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              title="Sort loans alphabetically"
            >
              <RefreshCw size={20} />
              Sort A-Z
            </button>
            <button
              onClick={handleSortByAmount}
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              title={sortAmountDesc ? "Sort by amount (lowest to highest)" : "Sort by amount (highest to lowest)"}
            >
              <ArrowDownUp size={20} />
              Sort by Amount {sortAmountDesc ? '↓' : '↑'}
            </button>
            <button
              onClick={() => loanHook.setIsAddingLoan(!loanHook.isAddingLoan)}
              className="bg-orange-600 text-white rounded px-4 py-2 hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <PlusCircle size={20} />
              Add Loan
            </button>
          </div>
        </div>

        {/* Add/Edit Loan Form */}
        {loanHook.isAddingLoan && (
          <div className="bg-gray-50 border rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-700 mb-4">
              {loanHook.editingLoanId ? 'Edit Loan' : 'Add New Loan'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Loan Name</label>
                <input
                  type="text"
                  value={loanHook.loanForm.name}
                  onChange={(e) => loanHook.setLoanForm({
                    ...loanHook.loanForm,
                    name: e.target.value
                  })}
                  placeholder="e.g., Car Loan Honda"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Category</label>
                <select
                  value={loanHook.loanForm.category}
                  onChange={(e) => loanHook.setLoanForm({
                    ...loanHook.loanForm,
                    category: e.target.value
                  })}
                  className="w-full border rounded px-4 py-2"
                >
                  <option value="">Select Category</option>
                  {LOAN_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Monthly Payment</label>
                <input
                  type="number"
                  value={loanHook.loanForm.monthly_payment}
                  onChange={(e) => loanHook.setLoanForm({
                    ...loanHook.loanForm,
                    monthly_payment: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0.00"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  value={loanHook.loanForm.start_date}
                  onChange={(e) => loanHook.setLoanForm({
                    ...loanHook.loanForm,
                    start_date: e.target.value
                  })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  value={loanHook.loanForm.end_date}
                  onChange={(e) => loanHook.setLoanForm({
                    ...loanHook.loanForm,
                    end_date: e.target.value
                  })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={loanHook.editingLoanId ? loanHook.saveEditLoan : loanHook.addLoan}
                className="bg-orange-600 text-white rounded px-6 py-2 hover:bg-orange-700 transition-colors font-medium"
              >
                {loanHook.editingLoanId ? 'Update Loan' : 'Add Loan'}
              </button>
              <button
                onClick={loanHook.cancelLoanEdit}
                className="bg-gray-600 text-white rounded px-6 py-2 hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Loans List */}
        <div className="space-y-4">
          {loanHook.loans.map(loan => (
            <div key={loan.id} className={`border rounded-lg p-4 ${
              loan.is_completed ? 'bg-green-50 border-green-200' : loan.is_ignored ? 'opacity-60 border-gray-300 bg-gray-50' : 'bg-white'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    {loan.name}
                    {loan.is_completed && <CheckCircle size={16} className="text-green-600" />}
                  </h4>
                  <p className="text-sm text-gray-500">{loan.category}</p>
                  <p className="text-sm text-gray-500">
                    End Date: {new Date(loan.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loanHook.toggleLoanIgnored(loan.id)}
                    className={`${loan.is_ignored ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                    title={loan.is_ignored ? 'Include in calculations' : 'Ignore in calculations'}
                  >
                    {loan.is_ignored ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  {!loan.is_completed && (
                    <button
                      onClick={() => loanHook.startEditLoan(loan)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit loan"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => loanHook.deleteLoan(loan.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete loan"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Loan Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-600">Monthly Payment</p>
                  <p className="font-semibold">£{formatCurrency(loan.monthly_payment)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Months Remaining</p>
                  <p className="font-semibold">{getMonthsRemainingForLoan(loan.end_date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-semibold ${
                    loan.is_completed ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {loan.is_completed ? 'Completed' : 'Active'}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              {!loan.is_completed && (
                <ProgressBar
                  percentage={loan.progress || 0}
                  color="bg-orange-600"
                  className="mb-3"
                />
              )}
            </div>
          ))}
          
          {loanHook.loans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No loans yet</p>
              <p>Add your first loan to start tracking payments!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loans;