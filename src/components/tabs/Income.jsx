import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit2, Eye, EyeOff, X, RefreshCw, ArrowDownUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';

const Income = ({ incomeHook }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortAmountDesc, setSortAmountDesc] = useState(true);

  // Calculate totals (only non-ignored income)
  const totalMonthly = incomeHook.income
    .filter(item => !item.is_ignored)
    .reduce((sum, item) => sum + item.monthly_pay, 0);

  const totalAnnual = incomeHook.income
    .filter(item => !item.is_ignored)
    .reduce((sum, item) => sum + item.annual_pay, 0);

  const handleAddIncome = () => {
    incomeHook.addIncome();
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    incomeHook.setNewIncome({
      income_source: '',
      monthly_pay: '',
      annual_pay: '',
      is_ignored: false
    });
    setShowAddForm(false);
  };

  const handleUpdateIncome = () => {
    incomeHook.updateIncome();
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    incomeHook.cancelEdit();
    setShowAddForm(false);
  };

  const handleSortByAmount = () => {
    const sortedIncome = [...incomeHook.income].sort((a, b) => {
      return sortAmountDesc ? b.monthly_pay - a.monthly_pay : a.monthly_pay - b.monthly_pay;
    });
    incomeHook.setIncome(sortedIncome);
    setSortAmountDesc(!sortAmountDesc);
  };

  return (
    <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
      {/* Header with Summary */}
      <div className="p-6 bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Income Sources</h3>
          
          {/* Action Buttons */}
          {!showAddForm && !incomeHook.editingIncome && (
            <div className="flex items-center gap-2">
              <button
                onClick={incomeHook.sortIncomeAlphabetically}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                title="Sort alphabetically by source"
              >
                <RefreshCw size={16} />
                Sort A-Z
              </button>
              <button
                onClick={handleSortByAmount}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                title={sortAmountDesc ? "Sort by amount (lowest to highest)" : "Sort by amount (highest to lowest)"}
              >
                <ArrowDownUp size={16} />
                Sort by Amount {sortAmountDesc ? '↓' : '↑'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  incomeHook.setNewIncome({
                    income_source: '',
                    monthly_pay: '',
                    annual_pay: '',
                    is_ignored: false
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <PlusCircle size={16} />
                Add
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              £{formatCurrency(totalMonthly)}
            </div>
            <div className="text-xs text-gray-600">per month</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              £{formatCurrency(totalAnnual)}
            </div>
            <div className="text-xs text-gray-600">per year</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || incomeHook.editingIncome) && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-800">
              {incomeHook.editingIncome ? 'Edit Income Source' : 'Add Income Source'}
            </h4>
            <button
              onClick={incomeHook.editingIncome ? handleCancelEdit : handleCancelAdd}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Income Source"
              value={incomeHook.newIncome.income_source}
              onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, income_source: e.target.value})}
              className="border border-green-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Monthly Pay"
              value={incomeHook.newIncome.monthly_pay}
              onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, monthly_pay: e.target.value})}
              className="border border-green-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Annual Pay (optional)"
              value={incomeHook.newIncome.annual_pay}
              onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, annual_pay: e.target.value})}
              className="border border-green-300 rounded px-3 py-2"
            />
            {incomeHook.editingIncome ? (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateIncome}
                  className="flex-1 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddIncome}
                className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            )}
          </div>
        </div>
      )}

      {/* Income Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-50 border-b border-green-200">
            <tr>
              <th className="text-left p-4 font-semibold text-green-800">Source</th>
              <th className="text-right p-4 font-semibold text-green-800">Monthly Pay</th>
              <th className="text-right p-4 font-semibold text-green-800">Annual Pay</th>
              <th className="text-right p-4 font-semibold text-green-800 bg-green-100">Total Annual Pay</th>
              <th className="text-center p-4 font-semibold text-green-800 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomeHook.income.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No income sources added yet
                </td>
              </tr>
            ) : (
              incomeHook.income.map((item) => (
                <tr 
                  key={item.id} 
                  className={`border-b hover:bg-green-25 ${item.is_ignored ? 'opacity-50' : ''}`}
                >
                  <td className="p-4">
                    <span className={item.is_ignored ? 'text-gray-400' : ''}>
                      {item.income_source}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-green-600'}`}>
                      £{formatCurrency(item.monthly_pay)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-green-600'}`}>
                      £{formatCurrency(item.annual_pay)}
                    </span>
                  </td>
                  <td className="p-4 text-right bg-green-50">
                    <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-green-700'}`}>
                      £{formatCurrency(item.annual_pay)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => incomeHook.toggleIncomeIgnored(item.id)}
                        className={`${item.is_ignored ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                        title={item.is_ignored ? 'Include in calculations' : 'Ignore in calculations'}
                      >
                        {item.is_ignored ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          incomeHook.startEditIncome(item);
                          setShowAddForm(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Edit income"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => incomeHook.deleteIncome(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete income"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Income;