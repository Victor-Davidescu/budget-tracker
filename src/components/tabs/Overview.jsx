import React from 'react';
import { TrendingUp, PieChart, DollarSign } from 'lucide-react';
import SummaryCard from '../ui/SummaryCard.jsx';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';

const Overview = ({ 
  totals, 
  categoryBreakdown, 
  emergencyFundStatus, 
  loans 
}) => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Monthly Income"
          value={`£${formatCurrency(totals.totalMonthlyIncome)}`}
          icon={TrendingUp}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          titleColor="text-green-600"
          valueColor="text-green-700"
          iconColor="text-green-600"
        />

        <SummaryCard
          title="Monthly Expenses"
          value={`£${formatCurrency(totals.totalMonthlyExpenses)}`}
          percentage={totals.totalMonthlyIncome > 0 ? `${((totals.totalMonthlyExpenses / totals.totalMonthlyIncome) * 100).toFixed(0)}%` : '0%'}
          icon={PieChart}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          titleColor="text-red-600"
          valueColor="text-red-700"
          percentageColor="text-red-600"
          iconColor="text-red-600"
        />

        <SummaryCard
          title="Monthly Loan Payments"
          value={`£${formatCurrency(totals.totalMonthlyLoans)}`}
          percentage={totals.totalMonthlyIncome > 0 ? `${((totals.totalMonthlyLoans / totals.totalMonthlyIncome) * 100).toFixed(0)}%` : '0%'}
          icon={TrendingUp}
          bgColor="bg-orange-50"
          borderColor="border-orange-200"
          titleColor="text-orange-600"
          valueColor="text-orange-700"
          percentageColor="text-orange-600"
          iconColor="text-orange-600"
        />
      </div>

      {/* Monthly Surplus/Deficit Card */}
      <div className={`${totals.monthlySurplus >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className={`text-sm font-medium ${totals.monthlySurplus >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Monthly {totals.monthlySurplus >= 0 ? 'Surplus' : 'Deficit'}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className={`text-3xl font-bold ${totals.monthlySurplus >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                £{formatCurrency(Math.abs(totals.monthlySurplus))}
              </p>
              <p className={`text-lg font-semibold ${totals.monthlySurplus >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {totals.totalMonthlyIncome > 0 ? `${((Math.abs(totals.monthlySurplus) / totals.totalMonthlyIncome) * 100).toFixed(0)}%` : '0%'}
              </p>
            </div>
          </div>
          <DollarSign className={totals.monthlySurplus >= 0 ? 'text-blue-600' : 'text-orange-600'} size={40} />
        </div>
        
        {/* Sub-cards for Savings and Investments */}
        {totals.monthlySurplus > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-blue-200">
            {/* Savings Sub-card */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium mb-1">Savings</p>
              <p className="text-xl font-bold text-purple-700">
                £{formatCurrency(totals.totalSavingsAllocated)}
              </p>
            </div>
            
            {/* Investment Sub-card */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium mb-1">Investments</p>
              <p className="text-xl font-bold text-purple-700">
                £{formatCurrency((totals.totalMonthlyInvestmentContributions || 0) + (totals.totalMonthlyPensionContributions || 0))}
              </p>
            </div>
            

          </div>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Annual Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Income:</span>
              <span className="font-semibold text-green-600">£{formatCurrency(totals.totalAnnualIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual Expenses:</span>
              <span className="font-semibold text-red-600">£{formatCurrency(totals.totalAnnualExpenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-700 font-medium">Annual {totals.annualSurplus >= 0 ? 'Surplus' : 'Deficit'}:</span>
              <span className={`font-bold ${totals.annualSurplus >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                £{formatCurrency(Math.abs(totals.annualSurplus))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Expense Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Essential:</span>
              <span className="font-semibold">£{formatCurrency(totals.essentialExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Non-Essential:</span>
              <span className="font-semibold">£{formatCurrency(totals.nonEssentialExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Expenses by Category</h3>
          <div className="space-y-3">
            {categoryBreakdown.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-gray-700">{category}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(amount / totals.totalMonthlyExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-700 w-24 text-right">
                    £{formatCurrency(amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;