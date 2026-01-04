import React, { useState } from 'react';
import { TABS } from './utils/constants.js';
import { useExpenses } from './hooks/useExpenses.js';
import { useIncome } from './hooks/useIncome.js';
import { useSavings } from './hooks/useSavings.js';
import { useLoans } from './hooks/useLoans.js';
import { useInvestments } from './hooks/useInvestments.js';
import { useDataLoader } from './hooks/useDataLoader.js';
import { calculateTotals, getCategoryBreakdown, getEmergencyFundStatus } from './services/calculations.js';

// Components
import Layout from './components/Layout.jsx';
import Overview from './components/tabs/Overview.jsx';
import Dashboard from './components/tabs/Dashboard.jsx';
import Income from './components/tabs/Income.jsx';
import Expenses from './components/tabs/Expenses.jsx';
import Loans from './components/tabs/Loans.jsx';
import Savings from './components/tabs/Savings.jsx';
import Investments from './components/tabs/Investments.jsx';

const App = () => {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  
  // Custom hooks
  const expenseHook = useExpenses();
  const incomeHook = useIncome();
  const loanHook = useLoans();
  const investmentHook = useInvestments();
  const savingsHook = useSavings(expenseHook.expenses, incomeHook.income);
  
  // Load data
  useDataLoader(
    expenseHook.setExpenses,
    incomeHook.setIncome,
    savingsHook.setCurrentEmergencyFunds,
    savingsHook.setEmergencyFundsInput,
    savingsHook.setMonthlySavings,
    savingsHook.setMonthlySavingsInput,
    savingsHook.setSavingsGoals,
    loanHook.setLoans,
    investmentHook.setInvestments,
    investmentHook.setPensions
  );

  // Calculate totals and status
  const totals = calculateTotals(expenseHook.expenses, incomeHook.income, savingsHook.monthlySavings, savingsHook.savingsGoals, loanHook.loans, investmentHook.investments, investmentHook.pensions);
  const categoryBreakdown = getCategoryBreakdown(expenseHook.expenses);
  const emergencyFundStatus = getEmergencyFundStatus(expenseHook.expenses, savingsHook.currentEmergencyFunds, loanHook.loans);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === TABS.OVERVIEW && (
        <Overview 
          totals={totals}
          categoryBreakdown={categoryBreakdown}
          emergencyFundStatus={emergencyFundStatus}
          loans={loanHook.loans}
        />
      )}

      {activeTab === TABS.DASHBOARD && (
        <Dashboard 
          totals={totals}
          categoryBreakdown={categoryBreakdown}
          income={incomeHook.income}
          expenses={expenseHook.expenses}
        />
      )}

      {activeTab === TABS.INCOME && (
        <Income incomeHook={incomeHook} />
      )}

      {activeTab === TABS.EXPENSES && (
        <Expenses expenseHook={expenseHook} />
      )}

      {activeTab === TABS.LOANS && (
        <Loans loanHook={loanHook} />
      )}

      {activeTab === TABS.SAVINGS && (
        <Savings 
          savingsHook={savingsHook}
          totals={totals}
          emergencyFundStatus={emergencyFundStatus}
        />
      )}

      {activeTab === TABS.INVESTMENTS && (
        <Investments 
          investmentHook={investmentHook} 
          totals={totals}
        />
      )}
    </Layout>
  );
};

export default App;