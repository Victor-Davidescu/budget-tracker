import React from 'react';
import { DollarSign } from 'lucide-react';
import TabButton from './ui/TabButton.jsx';
import { TABS } from '../utils/constants.js';

const Layout = ({ activeTab, setActiveTab, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign size={36} />
              Personal Budget Tracker
            </h1>
            <p className="mt-2 opacity-90">Track your income and expenses</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {[TABS.OVERVIEW, TABS.DASHBOARD, TABS.INCOME, TABS.EXPENSES, TABS.LOANS, TABS.SAVINGS, TABS.INVESTMENTS].map(tab => (
              <TabButton
                key={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </TabButton>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;