import React from 'react';
import { PlusCircle, RefreshCw, EyeOff, Eye, Edit2, Trash2 } from 'lucide-react';
import DataTable from '../ui/DataTable.jsx';
import HousingExpenses from '../ui/HousingExpenses.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateTotalAnnual } from '../../services/calculations.js';

const Expenses = ({ expenseHook, totalNetIncome }) => {
  // Filter out Housing expenses from main table
  const nonHousingExpenses = expenseHook.expenses.filter(expense => 
    expense.expense_category !== 'Housing'
  );
  const headers = [
    { key: 'expense_category', label: 'Category', align: 'left', render: (item) => item.expense_category || '-' },
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
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-red-600'}`}>
          {item.monthly_cost ? `£${formatCurrency(item.monthly_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'annual_cost', 
      label: 'Annual', 
      align: 'right',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-red-600'}`}>
          {item.annual_cost ? `£${formatCurrency(item.annual_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'total_annual', 
      label: 'Total Annual', 
      align: 'right',
      className: 'bg-red-50',
      render: (item) => (
        <span className={`font-semibold ${item.is_ignored ? 'text-gray-400' : 'text-red-700'}`}>
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

  const sortButton = (
    <button
      onClick={expenseHook.sortExpensesAlphabetically}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
      title="Sort expenses alphabetically"
    >
      <RefreshCw size={16} />
      Sort A-Z
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Housing Expenses Section */}
      <HousingExpenses expenseHook={expenseHook} totalNetIncome={totalNetIncome} />

      {/* Add Expense Form */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">
          {expenseHook.editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Category"
            value={expenseHook.newExpense.expense_category}
            onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, expense_category: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Expense Name"
            value={expenseHook.newExpense.expense_name}
            onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, expense_name: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Monthly Cost"
            value={expenseHook.newExpense.monthly_cost}
            onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, monthly_cost: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Annual Cost"
            value={expenseHook.newExpense.annual_cost}
            onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, annual_cost: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <select
            value={expenseHook.newExpense.is_essential}
            onChange={(e) => expenseHook.setNewExpense({...expenseHook.newExpense, is_essential: e.target.value === 'true'})}
            className="border rounded px-3 py-2"
          >
            <option value="true">Essential</option>
            <option value="false">Non-Essential</option>
          </select>
          <div className="flex gap-2">
            {expenseHook.editingExpense ? (
              <>
                <button
                  onClick={expenseHook.updateExpense}
                  className="flex-1 bg-green-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={expenseHook.cancelEdit}
                  className="flex-1 bg-gray-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={expenseHook.addExpense}
                className="w-full bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={20} />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-700">Expenses List</h3>
          {sortButton}
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`p-4 font-semibold text-gray-700 ${
                    header.align === 'right' ? 'text-right' : 
                    header.align === 'center' ? 'text-center' : 'text-left'
                  } ${header.width || ''}`}
                >
                  {header.label}
                </th>
              ))}
              <th className="w-40 text-center p-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {nonHousingExpenses.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="p-8 text-center text-gray-500">
                  No expenses added yet
                </td>
              </tr>
            ) : (
              nonHousingExpenses.map((expense, rowIndex) => (
                <tr key={expense.id || rowIndex} className={`border-b hover:bg-gray-50 ${expense.is_ignored ? 'opacity-50' : ''}`}>
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
                        {expense.is_ignored ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => expenseHook.startEditExpense(expense)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit expense"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => expenseHook.deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete expense"
                      >
                        <Trash2 size={18} />
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

export default Expenses;