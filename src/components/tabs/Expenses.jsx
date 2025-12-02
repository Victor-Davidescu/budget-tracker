import React from 'react';
import { PlusCircle, RefreshCw } from 'lucide-react';
import DataTable from '../ui/DataTable.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateTotalAnnual } from '../../services/calculations.js';

const Expenses = ({ expenseHook }) => {
  const headers = [
    { key: 'expense_category', label: 'Category', align: 'left', render: (item) => item.expense_category || '-' },
    { key: 'expense_name', label: 'Name', align: 'left' },
    { 
      key: 'monthly_cost', 
      label: 'Monthly', 
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-red-600">
          {item.monthly_cost ? `£${formatCurrency(item.monthly_cost)}` : '-'}
        </span>
      )
    },
    { 
      key: 'annual_cost', 
      label: 'Annual', 
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-red-600">
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
        <span className="font-semibold text-red-700">
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
          item.is_essential 
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
      <DataTable
        title="Expenses List"
        headers={headers}
        data={expenseHook.expenses}
        onEdit={expenseHook.startEditExpense}
        onDelete={expenseHook.deleteExpense}
        emptyMessage="No expenses added yet"
        sortButton={sortButton}
      />
    </div>
  );
};

export default Expenses;