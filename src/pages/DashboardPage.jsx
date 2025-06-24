import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { useTestSuite } from '../context/TestSuiteContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import SafeIcon from '../common/SafeIcon';
import { formatDistanceToNow, format } from 'date-fns';

const { FiActivity, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiEye, FiFilter, FiDownload } = FiIcons;

const DashboardPage = () => {
  const { testSuites, executions, runningJobs } = useTestSuite();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedFilters, setSelectedFilters] = useState({
    product: '',
    environment: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'success').length;
    const failedExecutions = executions.filter(e => e.status === 'failure').length;
    const runningExecutions = executions.filter(e => e.status === 'running').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      runningExecutions,
      successRate
    };
  }, [executions]);

  // Filter executions
  const filteredExecutions = useMemo(() => {
    return executions.filter(execution => {
      if (selectedFilters.product && execution.product !== selectedFilters.product) return false;
      if (selectedFilters.environment && execution.environment !== selectedFilters.environment) return false;
      if (selectedFilters.status && execution.status !== selectedFilters.status) return false;
      return true;
    });
  }, [executions, selectedFilters]);

  // Paginate executions
  const paginatedExecutions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredExecutions.slice(startIndex, startIndex + pageSize);
  }, [filteredExecutions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredExecutions.length / pageSize);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const products = [...new Set(executions.map(e => e.product))];
    const environments = [...new Set(executions.map(e => e.environment))];
    const statuses = [...new Set(executions.map(e => e.status))];

    return { products, environments, statuses };
  }, [executions]);

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <SafeIcon icon={icon} className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Suite Dashboard
          </h1>
          <p className="text-gray-600">
            Historical view and status overview of all test executions.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <Button icon={FiDownload} variant="outline">
            Export
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Executions"
          value={stats.totalExecutions}
          subtitle="All time"
          icon={FiActivity}
          color="primary"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle={`${stats.successfulExecutions} successful`}
          icon={FiCheckCircle}
          color="success"
        />
        <StatCard
          title="Failed Tests"
          value={stats.failedExecutions}
          subtitle="Require attention"
          icon={FiXCircle}
          color="danger"
        />
        <StatCard
          title="Running Now"
          value={stats.runningExecutions + Array.from(runningJobs.values()).length}
          subtitle="Active executions"
          icon={FiClock}
          color="warning"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Suite Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Test Suites</span>
              <span className="font-semibold">{testSuites.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Agents</span>
              <span className="font-semibold">{new Set(testSuites.map(s => s.agent)).size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Products Covered</span>
              <span className="font-semibold">
                {new Set(testSuites.flatMap(s => s.products.map(p => p.value))).size}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Environments</span>
              <span className="font-semibold">
                {new Set(testSuites.flatMap(s => s.environments.map(e => e.value))).size}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {executions.slice(0, 5).map((execution) => (
              <div key={execution.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={execution.status} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{execution.testSuiteName}</p>
                    <p className="text-xs text-gray-500">{execution.product} • {execution.environment}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))}
            {executions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No recent executions</p>
            )}
          </div>
        </Card>
      </div>

      {/* Executions Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Test Executions</h3>
          
          <div className="flex items-center space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedFilters.product}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, product: e.target.value }))}
            >
              <option value="">All Products</option>
              {filterOptions.products.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedFilters.environment}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, environment: e.target.value }))}
            >
              <option value="">All Environments</option>
              {filterOptions.environments.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedFilters.status}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {paginatedExecutions.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No executions found</p>
            <p className="text-gray-400">Start by triggering some test suites</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Execution ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Test Suite</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Environment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Agent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Triggered By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Start Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExecutions.map((execution) => (
                    <motion.tr
                      key={execution.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-gray-600">
                          {execution.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{execution.testSuiteName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{execution.product}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{execution.environment}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 capitalize">
                          {execution.agent.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={execution.status} />
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{execution.triggeredBy}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">
                          {format(new Date(execution.startTime || execution.createdAt), 'MMM dd, HH:mm')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button icon={FiEye} variant="outline" size="sm">
                          Details
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredExecutions.length)} of {filteredExecutions.length} results
                </p>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            page === currentPage
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;