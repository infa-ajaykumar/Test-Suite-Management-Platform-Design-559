import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TestSuiteProvider } from './context/TestSuiteContext';
import Layout from './components/Layout';
import OnboardingPage from './pages/OnboardingPage';
import TriggerPage from './pages/TriggerPage';
import DashboardPage from './pages/DashboardPage';
import SchedulerPage from './pages/SchedulerPage';
import './App.css';

function App() {
  return (
    <TestSuiteProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/trigger" element={<TriggerPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scheduler" element={<SchedulerPage />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </TestSuiteProvider>
  );
}

export default App;