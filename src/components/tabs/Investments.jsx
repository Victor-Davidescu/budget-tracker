import React from 'react';
import { PlusCircle, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import { INVESTMENT_TYPES, PENSION_TYPES } from '../../utils/constants.js';
import { 
  calculateInvestmentGainLoss, 
  calculateTotalInvestmentValue, 
  calculateTotalPensionValue,
  calculateTotalInvestmentContributions,
  calculateTotalPensionContributions
} from '../../services/calculations.js';

const Investments = ({ investmentHook }) => {
  const totalInvestmentValue = calculateTotalInvestmentValue(investmentHook.investments);
  const totalPensionValue = calculateTotalPensionValue(investmentHook.pensions);
  const totalInvestmentContributions = calculateTotalInvestmentContributions(investmentHook.investments);
  const pensionContributions = calculateTotalPensionContributions(investmentHook.pensions);

  const renderGainLoss = (currentValue, initialInvestment) => {
    const { gain, percentage } = calculateInvestmentGainLoss(currentValue, initialInvestment);
    const isPositive = gain >= 0;
    
    return (
      <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        <span>{isPositive ? '+' : ''}£{formatCurrency(Math.abs(gain))} ({isPositive ? '+' : ''}{percentage.toFixed(1)}%)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-1">Total Investments</p>
            <p className="text-2xl font-bold text-purple-700">£{formatCurrency(totalInvestmentValue)}</p>
            <p className="text-xs text-purple-500">{investmentHook.investments.length} accounts</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Total Pensions</p>
            <p className="text-2xl font-bold text-blue-700">£{formatCurrency(totalPensionValue)}</p>
            <p className="text-xs text-blue-500">{investmentHook.pensions.length} accounts</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-medium mb-1">Monthly Contributions</p>
            <p className="text-2xl font-bold text-green-700">£{formatCurrency(totalInvestmentContributions)}</p>
            <p className="text-xs text-green-500">Investments only</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Total Portfolio</p>
            <p className="text-2xl font-bold text-gray-700">£{formatCurrency(totalInvestmentValue + totalPensionValue)}</p>
            <p className="text-xs text-gray-500">All accounts</p>
          </div>
        </div>
      </div>

      {/* Pension Accounts */}
      <div className="bg-white border border-blue-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-blue-800">Pension Accounts</h3>
            <p className="text-sm text-blue-600">
              Total monthly contributions: £{formatCurrency(pensionContributions.employee)} (you) + £{formatCurrency(pensionContributions.employer)} (employer)
            </p>
          </div>
          <button
            onClick={() => investmentHook.setIsAddingPension(!investmentHook.isAddingPension)}
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add Pension
          </button>
        </div>

        {/* Add Pension Form */}
        {investmentHook.isAddingPension && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-4">
              {investmentHook.editingPensionId ? 'Edit Pension Account' : 'Add Pension Account'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-blue-700 mb-2">Account Name</label>
                <input
                  type="text"
                  value={investmentHook.pensionForm.account_name}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    account_name: e.target.value
                  })}
                  placeholder="e.g., Company Pension"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Pension Type</label>
                <select
                  value={investmentHook.pensionForm.pension_type}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    pension_type: e.target.value
                  })}
                  className="w-full border border-blue-300 rounded px-3 py-2"
                >
                  <option value="">Select type</option>
                  {Object.entries(PENSION_TYPES).map(([key, label]) => (
                    <option key={key} value={label}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Provider</label>
                <input
                  type="text"
                  value={investmentHook.pensionForm.provider}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    provider: e.target.value
                  })}
                  placeholder="e.g., Aviva, Nest"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={investmentHook.pensionForm.current_value}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    current_value: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Initial Contribution</label>
                <input
                  type="number"
                  value={investmentHook.pensionForm.initial_investment}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    initial_investment: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Your Monthly Contribution</label>
                <input
                  type="number"
                  value={investmentHook.pensionForm.monthly_contribution}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    monthly_contribution: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-blue-700 mb-2">Employer Contribution</label>
                <input
                  type="number"
                  value={investmentHook.pensionForm.employer_contribution}
                  onChange={(e) => investmentHook.setPensionForm({
                    ...investmentHook.pensionForm, 
                    employer_contribution: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-blue-300 rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={investmentHook.editingPensionId ? investmentHook.saveEditPension : investmentHook.addPension}
                className="bg-blue-600 text-white rounded px-6 py-2 hover:bg-blue-700 transition-colors font-medium"
              >
                {investmentHook.editingPensionId ? 'Update' : 'Add'} Pension
              </button>
              <button
                onClick={investmentHook.cancelPensionEdit}
                className="bg-gray-600 text-white rounded px-6 py-2 hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pension Accounts List */}
        <div className="space-y-4">
          {investmentHook.pensions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No pension accounts yet</p>
              <p>Add your pension accounts to track your retirement savings!</p>
            </div>
          ) : (
            investmentHook.pensions.map(pension => (
              <div key={pension.id} className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-800">{pension.account_name}</h4>
                    <p className="text-sm text-blue-600">{pension.pension_type} • {pension.provider}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => investmentHook.startEditPension(pension)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit pension"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => investmentHook.deletePension(pension.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete pension"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Current Value Card */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">Current Value</p>
                    <p className="text-lg font-bold text-blue-700">£{formatCurrency(pension.current_value)}</p>
                  </div>
                  
                  {/* Monthly Contributions Card */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">Monthly Contributions</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-blue-500">Your</p>
                        <p className="text-lg font-bold text-blue-700">£{formatCurrency(pension.monthly_contribution)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-blue-500">Employer</p>
                        <p className="text-lg font-bold text-blue-700">£{formatCurrency(pension.employer_contribution)}</p>
                      </div>
                      <div className="text-center border-l border-blue-200 pl-4">
                        <p className="text-xs text-blue-500">Total</p>
                        <p className="text-lg font-bold text-blue-700">£{formatCurrency(pension.monthly_contribution + pension.employer_contribution)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gain/Loss Card */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">Gain/Loss</p>
                    <div>
                      {renderGainLoss(pension.current_value, pension.initial_investment || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Investment Accounts */}
      <div className="bg-white border border-purple-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-purple-800">Investment Accounts</h3>
          <button
            onClick={() => investmentHook.setIsAddingInvestment(!investmentHook.isAddingInvestment)}
            className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Add Investment
          </button>
        </div>

        {/* Add Investment Form */}
        {investmentHook.isAddingInvestment && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-purple-800 mb-4">
              {investmentHook.editingInvestmentId ? 'Edit Investment Account' : 'Add Investment Account'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-purple-700 mb-2">Account Name</label>
                <input
                  type="text"
                  value={investmentHook.investmentForm.account_name}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    account_name: e.target.value
                  })}
                  placeholder="e.g., Vanguard S&S ISA"
                  className="w-full border border-purple-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-700 mb-2">Account Type</label>
                <select
                  value={investmentHook.investmentForm.account_type}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    account_type: e.target.value
                  })}
                  className="w-full border border-purple-300 rounded px-3 py-2"
                >
                  <option value="">Select type</option>
                  {Object.entries(INVESTMENT_TYPES).map(([key, label]) => (
                    <option key={key} value={label}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-purple-700 mb-2">Provider</label>
                <input
                  type="text"
                  value={investmentHook.investmentForm.provider}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    provider: e.target.value
                  })}
                  placeholder="e.g., Vanguard, HL"
                  className="w-full border border-purple-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-700 mb-2">Current Value</label>
                <input
                  type="number"
                  value={investmentHook.investmentForm.current_value}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    current_value: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-purple-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-700 mb-2">Initial Investment</label>
                <input
                  type="number"
                  value={investmentHook.investmentForm.initial_investment}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    initial_investment: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-purple-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-700 mb-2">Monthly Contribution</label>
                <input
                  type="number"
                  value={investmentHook.investmentForm.monthly_contribution}
                  onChange={(e) => investmentHook.setInvestmentForm({
                    ...investmentHook.investmentForm, 
                    monthly_contribution: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full border border-purple-300 rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={investmentHook.editingInvestmentId ? investmentHook.saveEditInvestment : investmentHook.addInvestment}
                className="bg-purple-600 text-white rounded px-6 py-2 hover:bg-purple-700 transition-colors font-medium"
              >
                {investmentHook.editingInvestmentId ? 'Update' : 'Add'} Investment
              </button>
              <button
                onClick={investmentHook.cancelInvestmentEdit}
                className="bg-gray-600 text-white rounded px-6 py-2 hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Investment Accounts List */}
        <div className="space-y-4">
          {investmentHook.investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No investment accounts yet</p>
              <p>Add your first investment account to start tracking your portfolio!</p>
            </div>
          ) : (
            investmentHook.investments.map(investment => (
              <div key={investment.id} className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-800">{investment.account_name}</h4>
                    <p className="text-sm text-purple-600">{investment.account_type} • {investment.provider}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => investmentHook.startEditInvestment(investment)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Edit investment"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => investmentHook.deleteInvestment(investment.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete investment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Value Card */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">Current Value</p>
                    <p className="text-lg font-bold text-purple-700">£{formatCurrency(investment.current_value)}</p>
                  </div>
                  
                  {/* Monthly Contribution Card */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">Monthly Contribution</p>
                    <p className="text-lg font-bold text-purple-700">£{formatCurrency(investment.monthly_contribution)}</p>
                  </div>
                  
                  {/* Gain/Loss Card */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">Gain/Loss</p>
                    <div>
                      {renderGainLoss(investment.current_value, investment.initial_investment)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Investments;