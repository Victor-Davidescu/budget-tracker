import React from 'react';
import { PlusCircle, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { calculateTotalGoalContributions } from '../../services/calculations.js';

const Savings = ({ savingsHook, totals, emergencyFundStatus }) => {
  const maxSavings = Math.max(0, totals.monthlySurplus);
  const isInDeficit = totals.monthlySurplus < 0;
  const isEmergencyFundScaled = totals?.emergencyFundScaling?.isScaled || false;

  const renderEmergencyFundScalingIndicator = () => {
    if (!isEmergencyFundScaled) return null;
    
    const scaling = totals.emergencyFundScaling;
    
    return (
      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm font-medium text-orange-700">
            Emergency fund contribution has been reduced due to insufficient funds
          </span>
        </div>
        <div className="text-xs text-orange-600">
          Target: £{formatCurrency(scaling.original)} → Actual: £{formatCurrency(scaling.adjusted)} ({(scaling.scalingFactor * 100).toFixed(1)}%)
        </div>
      </div>
    );
  };
  
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      progressBg: 'bg-red-200',
      progressBar: 'bg-red-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      progressBg: 'bg-orange-200',
      progressBar: 'bg-orange-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      progressBg: 'bg-green-200',
      progressBar: 'bg-green-600'
    }
  };
  const colors = colorClasses[emergencyFundStatus.color];

  return (
    <div className="space-y-6">
      {/* Consolidated Emergency Fund Card */}
      <div className={`${colors.bg} border ${colors.border} rounded-lg p-6`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency Fund</h2>
            <p className="text-gray-600">Build your financial safety net based on essential expenses</p>
          </div>
          <button
            onClick={savingsHook.isEditingEmergencyFund ? savingsHook.cancelEmergencyFundEdit : savingsHook.startEditEmergencyFund}
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Edit2 size={18} />
            {savingsHook.isEditingEmergencyFund ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Edit Mode */}
        {savingsHook.isEditingEmergencyFund && (
          <div className="bg-white rounded-lg p-4 mb-6 border">
            {isInDeficit ? (
              <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-4">
                <p className="text-orange-700 font-medium">
                  You currently have a monthly deficit. You cannot allocate funds to savings until you have a surplus.
                </p>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Current Emergency Funds</label>
                <input
                  type="number"
                  value={savingsHook.emergencyFundsInput}
                  onChange={(e) => savingsHook.setEmergencyFundsInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Monthly Contribution</label>
                <input
                  type="number"
                  min="0"
                  max={maxSavings}
                  step="10"
                  value={savingsHook.monthlySavingsInput}
                  onChange={savingsHook.handleSavingsInputChange}
                  placeholder="0.00"
                  className="w-full border rounded px-4 py-2"
                  disabled={isInDeficit}
                />
              </div>
            </div>
            
            {!isInDeficit && (
              <div className="text-sm text-gray-600 mb-4">
                <p>Monthly contribution: £{formatCurrency(parseFloat(savingsHook.monthlySavingsInput) || 0)} of £{formatCurrency(Math.max(0, totals.monthlySurplus - totals.totalGoalContributions))} available</p>
                <p>This leaves you with: <span className="font-bold text-teal-600">£{formatCurrency(Math.max(0, totals.monthlySurplus - totals.totalGoalContributions - (parseFloat(savingsHook.monthlySavingsInput) || 0)))}</span> pocket money per month</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={savingsHook.saveEmergencyFundEdit}
                className="bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={savingsHook.cancelEmergencyFundEdit}
                className="bg-gray-600 text-white rounded px-6 py-2 hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Emergency Fund Scaling Indicator */}
        {renderEmergencyFundScalingIndicator()}

        {/* Current Status Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Emergency Funds</p>
            <p className={`text-3xl font-bold ${colors.text}`}>
              £{formatCurrency(emergencyFundStatus.current)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Monthly Contribution</p>
            <p className="text-3xl font-bold text-purple-600">
              £{formatCurrency(totals?.emergencyFundScaling?.adjusted || savingsHook.monthlySavings)}
            </p>
            {isEmergencyFundScaled && (
              <p className="text-sm text-orange-600 mt-1">
                (target: £{formatCurrency(totals.emergencyFundScaling.original)})
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          percentage={emergencyFundStatus.percentage}
          color={colors.progressBar}
          bgColor={colors.progressBg}
          label="Progress to Recommended Target"
          className="mb-6"
        />

        {/* Status Message */}
        <div className={`${colors.bg} border-l-4 ${colors.border} p-4 mb-6`}>
          <p className={`${colors.text} font-medium`}>{emergencyFundStatus.message}</p>
        </div>

        {/* Targets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Monthly Essentials</p>
            <p className="text-xl font-bold text-blue-600">
              £{formatCurrency(emergencyFundStatus.monthlyEssentialsOnly)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Monthly Loans</p>
            <p className="text-xl font-bold text-purple-600">
              £{formatCurrency(emergencyFundStatus.monthlyLoans)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Total Monthly</p>
            <p className="text-xl font-bold text-gray-700">
              £{formatCurrency(emergencyFundStatus.monthlyTotal)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Annual Essentials</p>
            <p className="text-xl font-bold text-indigo-600">
              £{formatCurrency(emergencyFundStatus.annualEssential)}
            </p>
          </div>
        </div>
        
        {/* Minimum and Recommended Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Minimum (3 months)</p>
            <p className="text-xl font-bold text-orange-600">
              £{formatCurrency(emergencyFundStatus.minimum)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-gray-600 mb-1">Recommended (6 months)</p>
            <p className="text-xl font-bold text-green-600">
              £{formatCurrency(emergencyFundStatus.recommended)}
            </p>
          </div>
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-700">Savings Goals</h3>
          <button
            onClick={() => savingsHook.setIsAddingGoal(!savingsHook.isAddingGoal)}
            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Goal
          </button>
        </div>

        {/* Budget Allocation Summary */}
        {(() => {
          const goalScaling = totals.goalScaling || {};
          const scaledGoals = goalScaling.scaledGoals || [];
          const isScaled = goalScaling.isScaled || false;
          const scalingFactor = goalScaling.scalingFactor || 1;
          const availableForGoals = totals.availableForGoals || 0;
          const totalOriginalContributions = goalScaling.totalOriginalContributions || 0;
          const totalScaledContributions = goalScaling.totalScaledContributions || 0;
          const remaining = Math.max(0, availableForGoals - totalScaledContributions);
          
          return (
            <div className={`p-4 rounded-lg mb-6 border ${
              isScaled ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Budget Allocation</h4>
                {isScaled && (
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Goals scaled to {(scalingFactor * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-blue-600 font-medium mb-1">Available for Goals</p>
                  <p className="text-2xl font-bold text-blue-700">£{formatCurrency(availableForGoals)}</p>
                  <p className="text-xs text-blue-500">After emergency fund</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className={`text-sm font-medium mb-1 ${
                    isScaled ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {isScaled ? 'Scaled Goals Total' : 'Goals Total'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    isScaled ? 'text-orange-700' : 'text-green-700'
                  }`}>£{formatCurrency(totalScaledContributions)}</p>
                  {isScaled && totalOriginalContributions > 0 && (
                    <p className="text-xs text-orange-600">
                      Target: £{formatCurrency(totalOriginalContributions)}
                    </p>
                  )}
                  <p className={`text-xs ${
                    isScaled ? 'text-orange-500' : 'text-green-500'
                  }`}>{savingsHook.savingsGoals.length} goals</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-green-600 font-medium mb-1">Pocket Money</p>
                  <p className="text-2xl font-bold text-green-700">£{formatCurrency(remaining)}</p>
                  <p className="text-xs text-green-500">Available to spend</p>
                </div>
              </div>
              
              {isScaled && (
                <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Auto-scaling active:</strong> Your goals have been proportionally reduced to fit your budget. 
                    When your income increases or expenses decrease, goals will automatically scale back up.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Add/Edit Goal Form */}
        {savingsHook.isAddingGoal && (
          <div className="bg-gray-50 border rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-700 mb-4">
              {savingsHook.editingGoalId ? 'Edit Savings Goal' : 'Add New Savings Goal'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={savingsHook.goalForm.name}
                  onChange={(e) => savingsHook.setGoalForm({
                    ...savingsHook.goalForm,
                    name: e.target.value
                  })}
                  placeholder="e.g., Car Down Payment"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Target Amount</label>
                <input
                  type="number"
                  value={savingsHook.goalForm.target_amount}
                  onChange={(e) => savingsHook.setGoalForm({
                    ...savingsHook.goalForm,
                    target_amount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0.00"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Target Date</label>
                <input
                  type="date"
                  value={savingsHook.goalForm.target_date}
                  onChange={(e) => savingsHook.setGoalForm({
                    ...savingsHook.goalForm,
                    target_date: e.target.value
                  })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Current Amount (Optional)</label>
                <input
                  type="number"
                  value={savingsHook.goalForm.current_amount}
                  onChange={(e) => savingsHook.setGoalForm({
                    ...savingsHook.goalForm,
                    current_amount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0.00"
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={savingsHook.editingGoalId ? savingsHook.saveEditGoal : savingsHook.addSavingsGoal}
                className="bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700 transition-colors font-medium"
              >
                {savingsHook.editingGoalId ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                onClick={savingsHook.cancelGoalEdit}
                className="bg-gray-600 text-white rounded px-6 py-2 hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {savingsHook.savingsGoals.map(goal => {
            // Find scaled version of this goal
            const scaledGoals = totals.goalScaling?.scaledGoals || [];
            const scaledGoal = scaledGoals.find(sg => sg.id === goal.id) || goal;
            const isScaled = scaledGoal.is_scaled || false;
            const originalContribution = scaledGoal.monthly_contribution_original || goal.monthly_contribution;
            const adjustedContribution = scaledGoal.monthly_contribution_adjusted || goal.monthly_contribution;
            
            return (
              <div key={goal.id} className={`border rounded-lg p-4 ${isScaled ? 'border-orange-300 bg-orange-50' : ''} ${goal.is_ignored ? 'opacity-60 border-gray-300 bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-700">{goal.name}</h4>
                      {isScaled && (
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                          Scaled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Target: £{formatCurrency(goal.target_amount)} by {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => savingsHook.toggleGoalIgnored(goal.id)}
                      className={`${goal.is_ignored ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                      title={goal.is_ignored ? 'Include in calculations' : 'Ignore in calculations'}
                    >
                      {goal.is_ignored ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                      onClick={() => savingsHook.startEditGoal(goal)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit goal"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => savingsHook.deleteSavingsGoal(goal.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete goal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <ProgressBar
                  percentage={goal.progress || 0}
                  color={isScaled ? "bg-orange-500" : "bg-green-600"}
                  className="mb-3"
                />
                
                {/* Goal Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Current Amount</p>
                    <p className="font-semibold">£{formatCurrency(goal.current_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Contribution</p>
                    {isScaled ? (
                      <div>
                        <p className="font-semibold text-orange-700">
                          £{formatCurrency(adjustedContribution)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Target: £{formatCurrency(originalContribution)}
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold">£{formatCurrency(adjustedContribution || 0)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600">Months Remaining</p>
                    <p className="font-semibold">{Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24 * 30.44)))}</p>
                  </div>
                </div>
                
                {isScaled && (
                  <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
                    This goal has been scaled to {(scaledGoal.scaling_factor * 100).toFixed(1)}% of target contribution to fit your current budget.
                  </div>
                )}
              </div>
            );
          })}
          
          {savingsHook.savingsGoals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No savings goals yet</p>
              <p>Add your first savings goal to start tracking your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Savings;