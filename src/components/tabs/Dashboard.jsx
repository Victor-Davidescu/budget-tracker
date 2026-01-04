import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '../../utils/formatters.js';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const Dashboard = ({ 
  totals, 
  categoryBreakdown,
  income,
  expenses
}) => {
  const chartRef = useRef(null);
  const annualChartRef = useRef(null);

  // Color palettes
  const ALLOCATION_COLORS = {
    essentialExpenses: '#b91c1c',
    nonEssentialExpenses: '#ef4444',
    loans: '#f97316',
    savings: '#8b5cf6',
    investments: '#3b82f6',
    pocketMoney: '#22c55e'
  };

  // Prepare Monthly Budget Allocation Data
  const allocationData = [
    {
      category: "Essential Expenses",
      value: totals.essentialExpenses,
      color: am5.color(ALLOCATION_COLORS.essentialExpenses)
    },
    {
      category: "Non-Essential Expenses",
      value: totals.nonEssentialExpenses,
      color: am5.color(ALLOCATION_COLORS.nonEssentialExpenses)
    },
    {
      category: "Loans",
      value: totals.totalMonthlyLoans,
      color: am5.color(ALLOCATION_COLORS.loans)
    },
    {
      category: "Savings",
      value: totals.totalSavingsAllocated,
      color: am5.color(ALLOCATION_COLORS.savings)
    },
    {
      category: "Investments",
      value: (totals.totalMonthlyInvestmentContributions || 0) + (totals.totalMonthlyPensionContributions || 0),
      color: am5.color(ALLOCATION_COLORS.investments)
    },
    {
      category: "Pocket Money",
      value: totals.pocketMoney,
      color: am5.color(ALLOCATION_COLORS.pocketMoney)
    }
  ].filter(item => item.value > 0);

  // Prepare Annual Budget Allocation Data
  // Note: For annual, we use totalAnnualExpenses which includes both monthly*12 AND annual-only costs
  const annualEssentialExpenses = expenses
    .filter(e => !e.is_ignored && e.is_essential)
    .reduce((sum, e) => sum + ((e.monthly_cost || 0) * 12) + (e.annual_cost || 0), 0);
  
  const annualNonEssentialExpenses = expenses
    .filter(e => !e.is_ignored && !e.is_essential)
    .reduce((sum, e) => sum + ((e.monthly_cost || 0) * 12) + (e.annual_cost || 0), 0);

  const annualAllocationData = [
    {
      category: "Essential Expenses",
      value: annualEssentialExpenses,
      color: am5.color(ALLOCATION_COLORS.essentialExpenses)
    },
    {
      category: "Non-Essential Expenses",
      value: annualNonEssentialExpenses,
      color: am5.color(ALLOCATION_COLORS.nonEssentialExpenses)
    },
    {
      category: "Loans",
      value: totals.totalMonthlyLoans * 12,
      color: am5.color(ALLOCATION_COLORS.loans)
    },
    {
      category: "Savings",
      value: totals.totalSavingsAllocated * 12,
      color: am5.color(ALLOCATION_COLORS.savings)
    },
    {
      category: "Investments",
      value: ((totals.totalMonthlyInvestmentContributions || 0) + (totals.totalMonthlyPensionContributions || 0)) * 12,
      color: am5.color(ALLOCATION_COLORS.investments)
    },
    {
      category: "Pocket Money",
      value: totals.pocketMoney * 12,
      color: am5.color(ALLOCATION_COLORS.pocketMoney)
    }
  ].filter(item => item.value > 0);

  // Initialize pie chart
  useEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        fillField: "color",
        endAngle: 270
      })
    );

    series.states.create("hidden", {
      endAngle: -90
    });

    // Set data
    series.data.setAll(allocationData);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [allocationData]);

  // Initialize annual pie chart
  useEffect(() => {
    if (!annualChartRef.current) return;

    const root = am5.Root.new(annualChartRef.current);

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        endAngle: 270
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        fillField: "color",
        endAngle: 270
      })
    );

    series.states.create("hidden", {
      endAngle: -90
    });

    // Set data
    series.data.setAll(annualAllocationData);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [annualAllocationData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Monthly Dashboard</h2>
        <p className="text-indigo-100">Visual breakdown of your monthly finances</p>
      </div>

      {/* Monthly Budget Allocation */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Monthly Budget Allocation</h3>
        <p className="text-sm text-gray-600 mb-6">How your monthly income is distributed</p>
        
        <div className="flex items-center gap-8">
          {/* Categories */}
          <div className="w-80">
            <div className="space-y-3">
              {allocationData.map((item) => (
                <div key={item.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color.toString() }}
                    ></div>
                    <span className="text-gray-700">{item.category}</span>
                  </div>
                  <span className="font-semibold text-gray-800">£{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-4 flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total Allocated</span>
                <span className="text-gray-800">
                  £{formatCurrency(allocationData.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex-1 h-96">
            <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Annual Budget Allocation */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Annual Budget Allocation</h3>
        <p className="text-sm text-gray-600 mb-6">How your annual income is distributed</p>
        
        <div className="flex items-center gap-8">
          {/* Categories */}
          <div className="w-80">
            <div className="space-y-3">
              {annualAllocationData.map((item) => (
                <div key={item.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color.toString() }}
                    ></div>
                    <span className="text-gray-700">{item.category}</span>
                  </div>
                  <span className="font-semibold text-gray-800">£{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-4 flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total Allocated</span>
                <span className="text-gray-800">
                  £{formatCurrency(annualAllocationData.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex-1 h-96">
            <div ref={annualChartRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
