import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import DataTable from '../ui/DataTable.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const Income = ({ incomeHook }) => {
  const headers = [
    { key: 'income_source', label: 'Source', align: 'left' },
    { 
      key: 'monthly_pay', 
      label: 'Monthly Pay', 
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-green-600">
          £{formatCurrency(item.monthly_pay)}
        </span>
      )
    },
    { 
      key: 'annual_pay', 
      label: 'Annual Pay', 
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-green-600">
          £{formatCurrency(item.annual_pay)}
        </span>
      )
    },
    { 
      key: 'total_annual_pay', 
      label: 'Total Annual Pay', 
      align: 'right',
      className: 'bg-green-50',
      render: (item) => (
        <span className="font-semibold text-green-700">
          £{formatCurrency(item.annual_pay)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Add Income Form */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Add Income Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Income Source"
            value={incomeHook.newIncome.income_source}
            onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, income_source: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Monthly Pay"
            value={incomeHook.newIncome.monthly_pay}
            onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, monthly_pay: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Annual Pay (optional)"
            value={incomeHook.newIncome.annual_pay}
            onChange={(e) => incomeHook.setNewIncome({...incomeHook.newIncome, annual_pay: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={incomeHook.addIncome}
            className="bg-green-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <PlusCircle size={20} />
            Add
          </button>
        </div>
      </div>

      {/* Income List */}
      <DataTable
        headers={headers}
        data={incomeHook.income}
        onDelete={incomeHook.deleteIncome}
        emptyMessage="No income sources added yet"
        onEdit={null}
      />
    </div>
  );
};

export default Income;