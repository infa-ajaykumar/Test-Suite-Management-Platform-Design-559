import React from 'react';
import { NavLink } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiPlus, FiPlay, FiBarChart3, FiClock, FiSettings } = FiIcons;

const Layout = ({ children }) => {
  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/onboarding', icon: FiPlus, label: 'Onboarding' },
    { path: '/trigger', icon: FiPlay, label: 'Trigger' },
    { path: '/scheduler', icon: FiClock, label: 'Scheduler' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TestSuite</h1>
              <p className="text-sm text-gray-500">Management Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiSettings} className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;