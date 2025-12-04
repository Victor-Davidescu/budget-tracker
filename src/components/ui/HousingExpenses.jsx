import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, EyeOff, Eye, X, Info, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateTotalAnnual } from '../../services/calculations.js';

const HousingExpenses = ({ expenseHook, totalNetIncome }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const housingExpenses = expenseHook.expenses.filter(expense => 
    expense.expense_category === 'Housing'
  );

  // Calculate housing totals
  const totalHousingMonthly = housingExpenses
    .filter(expense => !expense.is_ignored)
    .reduce((sum, expense) => {
      const monthly = expense.monthly_cost || 0;
      const annual = expense.annual_cost || 0;
      return sum + monthly + (annual / 12);
    }, 0);

  const totalHousingAnnual = totalHousingMonthly * 12;

  // Calculate percentage of net income
  const housingPercentage = totalNetIncome > 0 ? (totalHousingAnnual / totalNetIncome) * 100 : 0;

  // Determine color coding based on percentage
  const getPercentageColor = (percentage) => {
    if (percentage <= 30) return 'text-green-600';
    if (percentage <= 35) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage) => {
    if (percentage <= 30) return 'bg-green-50';
    if (percentage <= 35) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const headers = [
    { 
      key: 'expense_name', 
      label: 'Housing Expense', 
      align: 'left',
      render: (item) => (
        <span className={item.is_ignored ? 'text-gray-400' : ''}>
          {item.expense_name}
        </span>
      )
    },
    { 
      key: 'monthly_cost', 
      label: 'Monthly', 
      align: 'right',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-blue-600'}`}>
          {item.monthly_cost ? `£${formatCurrency(item.monthly_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'annual_cost', 
      label: 'Annual', 
      align: 'right',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-blue-600'}`}>
          {item.annual_cost ? `£${formatCurrency(item.annual_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'total_annual', 
      label: 'Total Annual', 
      align: 'right',
      className: 'bg-blue-50',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-blue-700'}`}>
          £{formatCurrency(calculateTotalAnnual(item))}
        </span>
      )
    },
    { 
      key: 'is_essential', 
      label: 'Is Essential?', 
      align: 'center',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.is_ignored 
            ? 'bg-gray-100 text-gray-400' 
            : item.is_essential 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-purple-100 text-purple-700'
        }`}>
          {item.is_essential ? 'Essential' : 'Non-Essential'}
        </span>
      )
    }
  ];

  // Pre-fill form with Housing category when adding
  const handleAddHousingExpense = () => {
    expenseHook.setNewExpense({
      ...expenseHook.newExpense,
      expense_category: 'Housing'
    });
    expenseHook.addExpense();
    setShowAddForm(false); // Hide form after adding
  };

  const handleCancelAdd = () => {
    expenseHook.setNewExpense({
      expense_category: '',
      expense_name: '',
      monthly_cost: '',
      annual_cost: '',
      is_essential: true
    });
    setShowAddForm(false);
  };

  const handleUpdateExpense = () => {
    expenseHook.updateExpense();
    setShowAddForm(false); // Hide form after updating
  };

  const handleCancelEdit = () => {
    expenseHook.cancelEdit();
    setShowAddForm(false);
  };

  const sortHousingExpensesAlphabetically = () => {
    const housingExpenses = expenseHook.expenses.filter(expense => 
      expense.expense_category === 'Housing'
    );
    const nonHousingExpenses = expenseHook.expenses.filter(expense => 
      expense.expense_category !== 'Housing'
    );
    
    const sortedHousingExpenses = [...housingExpenses].sort((a, b) => 
      a.expense_name.localeCompare(b.expense_name)
    );
    
    const allExpenses = [...nonHousingExpenses, ...sortedHousingExpenses];
    expenseHook.setExpenses(allExpenses);
  };

  return (
    <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
      {/* Housing Header with Summary */}
      <div className={`p-6 ${getPercentageBg(housingPercentage)} border-b border-blue-200`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Housing Expenses</h3>
          
          {/* Action Buttons */}
          {!showAddForm && !expenseHook.editingExpense && (
            <div className="flex items-center gap-2">
              <button
                onClick={sortHousingExpensesAlphabetically}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                title="Sort housing expenses alphabetically"
              >
                <RefreshCw size={16} />
                Sort A-Z
              </button>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  expenseHook.setNewExpense({
                    ...expenseHook.newExpense,
                    expense_category: 'Housing'
                  });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <PlusCircle size={16} />
                Add
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {/* Monthly/Annual Costs */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                £{formatCurrency(totalHousingMonthly)}
              </div>
              <div className="text-xs text-gray-600">per month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                £{formatCurrency(totalHousingAnnual)}
              </div>
              <div className="text-xs text-gray-600">per year</div>
            </div>
          </div>

          {/* Percentage with Info */}
          <div className="text-right relative">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-sm text-gray-600">% of Net Income</span>
              <div className="relative">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Show percentage guidelines"
                >
                  <Info size={16} />
                </button>
                
                {/* Popup Info */}
                {showInfo && (
                  <div className="absolute right-0 top-8 z-10 w-80 bg-white border border-gray-300 shadow-lg rounded-lg p-3">
                    <div className="text-xs text-gray-700">
                      <div className="font-semibold mb-1">Housing Cost Guidelines:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>≤30% - Good (Recommended)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>30-35% - Acceptable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>&gt;35% - High (Consider reducing)</span>
                        </div>
                      </div>
                    </div>
                    {/* Arrow pointing to info button */}
                    <div className="absolute top-[-6px] right-4 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white"></div>
                    <div className="absolute top-[-7px] right-4 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-gray-300"></div>
                  </div>
                )}
              </div>
            </div>
            <div className={`text-lg font-bold ${getPercentageColor(housingPercentage)}`}>
              {housingPercentage.toFixed(1)}%
              <span className="text-sm ml-2">
                {housingPercentage <= 30 ? '(Good)' : 
                 housingPercentage <= 35 ? '(Acceptable)' : '(High)'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Click outside to close popup */}
        {showInfo && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowInfo(false)}
          ></div>
        )}
      </div>

      {/* Add/Edit Housing Expense Form */}
      {(showAddForm || expenseHook.editingExpense) && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-blue-800">
              {expenseHook.editingExpense ? 'Edit Housing Expense' : 'Add Housing Expense'}
            </h4>
            <button
              onClick={expenseHook.editingExpense ? handleCancelEdit : handleCancelAdd}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Housing Expense Name"
              value={expenseHook.newExpense.expense_name}
              onChange={(e) => expenseHook.setNewExpense({
                ...expenseHook.newExpense, 
                expense_name: e.target.value,
                expense_category: 'Housing'
              })}
              className="border border-blue-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Monthly Cost"
              value={expenseHook.newExpense.monthly_cost}
              onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, monthly_cost: e.target.value})}
              className="border border-blue-300 rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Annual Cost"
              value={expenseHook.newExpense.annual_cost}
              onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, annual_cost: e.target.value})}
              className="border border-blue-300 rounded px-3 py-2"
            />
            <select
              value={expenseHook.newExpense.is_essential}
              onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, is_essential: e.target.value === 'true'})}
              className="border border-blue-300 rounded px-3 py-2"
            >
              <option value="true">Essential</option>
              <option value="false">Non-Essential</option>
            </select>
            <div className="md:col-span-2 flex gap-2">
              {expenseHook.editingExpense ? (
                <>
                  <button
                    onClick={handleUpdateExpense}
                    className="flex-1 bg-green-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddHousingExpense}
                    className="flex-1 bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle size={18} />
                    Add
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="flex-1 bg-gray-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Housing Expenses Table */}
      {housingExpenses.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No housing expenses added yet. Click "Add Housing Expense" to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-blue-200">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={`p-4 font-semibold text-blue-800 ${
                      header.align === 'right' ? 'text-right' : 
                      header.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {header.label}
                  </th>
                ))}
                <th className="w-32 text-center p-4 font-semibold text-blue-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {housingExpenses.map((expense, rowIndex) => (
                <tr key={expense.id || rowIndex} className={`border-b hover:bg-blue-25 ${expense.is_ignored ? 'opacity-50' : ''}`}>
                  {headers.map((header, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`p-4 ${
                        header.align === 'right' ? 'text-right' : 
                        header.align === 'center' ? 'text-center' : 'text-left'
                      } ${header.className || ''}`}
                    >
                      {header.render ? header.render(expense) : expense[header.key]}
                    </td>
                  ))}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => expenseHook.toggleExpenseIgnored(expense.id)}
                        className={`${expense.is_ignored ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                        title={expense.is_ignored ? 'Include in calculations' : 'Ignore in calculations'}
                      >
                        {expense.is_ignored ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => {
                          expenseHook.startEditExpense(expense);
                          setShowAddForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit expense"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => expenseHook.deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HousingExpenses;