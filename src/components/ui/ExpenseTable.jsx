import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, EyeOff, Eye, X, Info, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateTotalAnnual } from '../../services/calculations.js';

const ExpenseTable = ({ 
  expenseHook, 
  totalNetIncome, 
  isEssential, 
  title, 
  colorScheme,
  thresholds 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  // Filter expenses based on type
  const filteredExpenses = expenseHook.expenses.filter(expense => 
    expense.is_essential === isEssential
  );

  // Calculate totals
  const totalMonthly = filteredExpenses
    .filter(expense => !expense.is_ignored)
    .reduce((sum, expense) => {
      const monthly = expense.monthly_cost || 0;
      return sum + monthly;
    }, 0);

  const totalAnnualCosts = filteredExpenses
    .filter(expense => !expense.is_ignored)
    .reduce((sum, expense) => {
      const annual = expense.annual_cost || 0;
      return sum + annual;
    }, 0);

  const totalAnnual = filteredExpenses
    .filter(expense => !expense.is_ignored)
    .reduce((sum, expense) => {
      const monthly = expense.monthly_cost || 0;
      const annual = expense.annual_cost || 0;
      return sum + (monthly * 12) + annual;
    }, 0);

  // Calculate percentage of net income
  const percentage = totalNetIncome > 0 ? (totalAnnual / totalNetIncome) * 100 : 0;

  // Determine color coding based on thresholds
  const getPercentageColor = (percentage) => {
    if (percentage < thresholds.good) return 'text-green-600';
    if (percentage <= thresholds.acceptable) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage) => {
    if (percentage < thresholds.good) return 'bg-green-50';
    if (percentage <= thresholds.acceptable) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // Headers with Category column in 1st position
  const headers = [
    { 
      key: 'expense_category', 
      label: 'Category', 
      align: 'left',
      render: (item) => (
        <span className={item.is_ignored ? 'text-gray-400' : ''}>
          {item.expense_category || '-'}
        </span>
      )
    },
    { 
      key: 'expense_name', 
      label: 'Name', 
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
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : colorScheme.text}`}>
          {item.monthly_cost ? `£${formatCurrency(item.monthly_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'annual_cost', 
      label: 'Annual', 
      align: 'right',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : colorScheme.text}`}>
          {item.annual_cost ? `£${formatCurrency(item.annual_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'total_annual', 
      label: 'Total Annual', 
      align: 'right',
      className: colorScheme.cellBg,
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : colorScheme.textBold}`}>
          £{formatCurrency(calculateTotalAnnual(item))}
        </span>
      )
    }
  ];

  // Add expense
  const handleAddExpense = () => {
    expenseHook.setNewExpense({
      ...expenseHook.newExpense,
      is_essential: isEssential
    });
    expenseHook.addExpense();
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    expenseHook.setNewExpense({
      expense_category: '',
      expense_name: '',
      monthly_cost: '',
      annual_cost: '',
      is_essential: isEssential
    });
    setShowAddForm(false);
  };

  const handleUpdateExpense = () => {
    expenseHook.updateExpense();
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    expenseHook.cancelEdit();
    setShowAddForm(false);
  };

  const sortExpensesAlphabetically = () => {
    const sortedExpenses = [...expenseHook.expenses].sort((a, b) => {
      const categoryComparison = (a.expense_category || '').localeCompare(b.expense_category || '');
      if (categoryComparison !== 0) {
        return categoryComparison;
      }
      return a.expense_name.localeCompare(b.expense_name);
    });
    
    expenseHook.setExpenses(sortedExpenses);
  };

  return (
    <div className={`bg-white border ${colorScheme.border} rounded-lg overflow-hidden`}>
      {/* Header with Summary */}
      <div className={`p-6 ${getPercentageBg(percentage)} border-b ${colorScheme.border}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          
          {/* Action Buttons */}
          {!showAddForm && !expenseHook.editingExpense && (
            <div className="flex items-center gap-2">
              <button
                onClick={sortExpensesAlphabetically}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                title="Sort expenses alphabetically"
              >
                <RefreshCw size={16} />
                Sort A-Z
              </button>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  expenseHook.setNewExpense({
                    ...expenseHook.newExpense,
                    expense_category: '',
                    expense_name: '',
                    monthly_cost: '',
                    annual_cost: '',
                    is_essential: isEssential
                  });
                }}
                className={`flex items-center gap-2 px-3 py-2 ${colorScheme.button} text-white rounded ${colorScheme.buttonHover} transition-colors text-sm`}
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
                £{formatCurrency(totalMonthly)}
              </div>
              <div className="text-xs text-gray-600">per month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                £{formatCurrency(totalAnnualCosts)}
              </div>
              <div className="text-xs text-gray-600">per year</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                £{formatCurrency(totalAnnual)}
              </div>
              <div className="text-xs text-gray-600">total per year</div>
            </div>
          </div>

          {/* Percentage with Info */}
          <div className="text-right relative">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className="text-sm text-gray-600">% of Total Annual Net Income</span>
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
                      <div className="font-semibold mb-1">{title} Guidelines:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span>&lt;{thresholds.good}% - Good (Recommended)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span>{thresholds.good}-{thresholds.acceptable}% - Acceptable</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span>&gt;{thresholds.acceptable}% - High (Consider reducing)</span>
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
            <div className={`text-lg font-bold ${getPercentageColor(percentage)}`}>
              {percentage.toFixed(1)}%
              <span className="text-sm ml-2">
                {percentage < thresholds.good ? '(Good)' : 
                 percentage <= thresholds.acceptable ? '(Acceptable)' : '(High)'}
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

      {/* Add/Edit Expense Form */}
      {(showAddForm || expenseHook.editingExpense) && (
        <div className={`p-4 ${colorScheme.formBg} border-b ${colorScheme.border}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${colorScheme.formText}`}>
              {expenseHook.editingExpense ? `Edit ${title}` : `Add ${title}`}
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
              placeholder="Category"
              value={expenseHook.newExpense.expense_category}
              onChange={(e) => expenseHook.setNewExpense({
                ...expenseHook.newExpense, 
                expense_category: e.target.value
              })}
              className={`border ${colorScheme.inputBorder} rounded px-3 py-2`}
            />
            <input
              type="text"
              placeholder={isEssential ? "Essential Expense Name" : "Name"}
              value={expenseHook.newExpense.expense_name}
              onChange={(e) => expenseHook.setNewExpense({
                ...expenseHook.newExpense, 
                expense_name: e.target.value
              })}
              className={`border ${colorScheme.inputBorder} rounded px-3 py-2`}
            />
            <input
              type="number"
              placeholder="Monthly Cost"
              value={expenseHook.newExpense.monthly_cost}
              onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, monthly_cost: e.target.value})}
              className={`border ${colorScheme.inputBorder} rounded px-3 py-2`}
            />
            <input
              type="number"
              placeholder="Annual Cost"
              value={expenseHook.newExpense.annual_cost}
              onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, annual_cost: e.target.value})}
              className={`border ${colorScheme.inputBorder} rounded px-3 py-2`}
            />
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
                    onClick={handleAddExpense}
                    className={`flex-1 ${colorScheme.button} text-white rounded px-4 py-2 flex items-center justify-center gap-2 ${colorScheme.buttonHover} transition-colors`}
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

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No {title.toLowerCase()} added yet. Click "Add" to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${colorScheme.headerBg} border-b ${colorScheme.border}`}>
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className={`p-4 font-semibold ${colorScheme.headerText} ${
                      header.align === 'right' ? 'text-right' : 
                      header.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {header.label}
                  </th>
                ))}
                <th className={`w-32 text-center p-4 font-semibold ${colorScheme.headerText}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, rowIndex) => (
                <tr key={expense.id || rowIndex} className={`border-b hover:${colorScheme.rowHover} ${expense.is_ignored ? 'opacity-50' : ''}`}>
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
                        className={`${colorScheme.text} ${colorScheme.textHover}`}
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

export default ExpenseTable;