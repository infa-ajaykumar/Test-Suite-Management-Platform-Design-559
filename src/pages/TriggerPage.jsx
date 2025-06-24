import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import { useTestSuite } from '../context/TestSuiteContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import MultiSelect from '../components/MultiSelect';
import StatusBadge from '../components/StatusBadge';
import SafeIcon from '../common/SafeIcon';
import { generateId } from '../utils/helpers';

const { FiPlay, FiSquare, FiRefreshCw, FiEye, FiFilter } = FiIcons;

const TriggerPage = () => {
  const { testSuites, addExecution, runningJobs, addRunningJob, updateRunningJob, removeRunningJob } = useTestSuite();
  const [filters, setFilters] = useState({
    agent: null,
    products: [],
    cloudProviders: [],
    environments: [],
    podNames: [],
    testSuiteType: null
  });
  const [triggerMode, setTriggerMode] = useState('filtered'); // 'all', 'filtered', 'single'
  const [selectedSuites, setSelectedSuites] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  // Get unique values for filter options
  const getFilterOptions = () => {
    const agents = [...new Set(testSuites.map(suite => suite.agent))];
    const products = [...new Set(testSuites.flatMap(suite => suite.products.map(p => p.value)))];
    const cloudProviders = [...new Set(testSuites.flatMap(suite => suite.cloudProviders.map(cp => cp.value)))];
    const environments = [...new Set(testSuites.flatMap(suite => suite.environments.map(e => e.value)))];
    const podNames = [...new Set(testSuites.flatMap(suite => suite.podNames.map(p => p.value)))];
    const testSuiteTypes = [...new Set(testSuites.map(suite => suite.testSuiteType))];

    return {
      agents: agents.map(agent => ({ value: agent, label: agent.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
      products: products.map(product => ({ value: product, label: product })),
      cloudProviders: cloudProviders.map(cp => ({ value: cp, label: cp })),
      environments: environments.map(env => ({ value: env, label: env })),
      podNames: podNames.map(pod => ({ value: pod, label: pod })),
      testSuiteTypes: testSuiteTypes.map(type => ({ value: type, label: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
    };
  };

  const filterOptions = getFilterOptions();

  // Filter test suites based on current filters
  const getFilteredSuites = () => {
    return testSuites.filter(suite => {
      if (filters.agent && suite.agent !== filters.agent.value) return false;
      if (filters.products.length > 0 && !filters.products.some(p => suite.products.some(sp => sp.value === p.value))) return false;
      if (filters.cloudProviders.length > 0 && !filters.cloudProviders.some(cp => suite.cloudProviders.some(scp => scp.value === cp.value))) return false;
      if (filters.environments.length > 0 && !filters.environments.some(e => suite.environments.some(se => se.value === e.value))) return false;
      if (filters.podNames.length > 0 && !filters.podNames.some(p => suite.podNames.some(sp => sp.value === p.value))) return false;
      if (filters.testSuiteType && suite.testSuiteType !== filters.testSuiteType.value) return false;
      return true;
    });
  };

  const filteredSuites = getFilteredSuites();

  const simulateJobExecution = async (suite) => {
    const jobId = generateId();
    const jobData = {
      id: jobId,
      suiteId: suite.id,
      suiteName: suite.name,
      product: suite.products[0]?.label || 'Unknown',
      environment: suite.environments[0]?.label || 'Unknown',
      agent: suite.agent,
      status: 'running',
      startTime: new Date().toISOString(),
      logs: ['Job started...', 'Initializing test environment...']
    };

    addRunningJob(jobId, jobData);
    addExecution({
      testSuiteId: suite.id,
      testSuiteName: suite.name,
      product: suite.products[0]?.label || 'Unknown',
      environment: suite.environments[0]?.label || 'Unknown',
      agent: suite.agent,
      testSuiteType: suite.testSuiteType,
      triggeredBy: 'Manual',
      status: 'running',
      startTime: new Date().toISOString()
    });

    // Simulate job progress
    const steps = [
      'Setting up test environment...',
      'Running health checks...',
      'Executing test cases...',
      'Collecting results...',
      'Generating reports...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      updateRunningJob(jobId, {
        logs: [...jobData.logs, steps[i]]
      });
    }

    // Final result (random success/failure)
    const success = Math.random() > 0.3;
    const finalStatus = success ? 'success' : 'failure';
    const endTime = new Date().toISOString();

    updateRunningJob(jobId, {
      status: finalStatus,
      endTime,
      logs: [...jobData.logs, ...steps, success ? 'Test completed successfully!' : 'Test failed with errors.']
    });

    // Remove from running jobs after a delay
    setTimeout(() => {
      removeRunningJob(jobId);
    }, 10000);

    return { jobId, success };
  };

  const handleTrigger = async (mode = triggerMode) => {
    let suitesToTrigger = [];

    switch (mode) {
      case 'all':
        suitesToTrigger = testSuites;
        break;
      case 'filtered':
        suitesToTrigger = filteredSuites;
        break;
      case 'single':
        suitesToTrigger = selectedSuites;
        break;
    }

    if (suitesToTrigger.length === 0) {
      toast.error('No test suites to trigger');
      return;
    }

    toast.success(`Triggering ${suitesToTrigger.length} test suite(s)...`);

    // Trigger all suites concurrently
    const promises = suitesToTrigger.map(suite => simulateJobExecution(suite));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      toast.error('Some jobs failed to trigger');
    }
  };

  const cancelJob = (jobId) => {
    updateRunningJob(jobId, {
      status: 'cancelled',
      endTime: new Date().toISOString()
    });
    
    setTimeout(() => {
      removeRunningJob(jobId);
    }, 2000);
    
    toast.success('Job cancelled');
  };

  const runningJobsArray = Array.from(runningJobs.values());

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trigger Test Suites
          </h1>
          <p className="text-gray-600">
            Trigger one or multiple pipelines/tests based on onboarded configurations.
          </p>
        </div>
        
        <Button
          icon={FiFilter}
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Selection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormField label="Agent">
              <MultiSelect
                options={filterOptions.agents}
                value={filters.agent}
                onChange={(selected) => setFilters(prev => ({ ...prev, agent: selected }))}
                placeholder="Select agent..."
                isMulti={false}
              />
            </FormField>

            <FormField label="Products">
              <MultiSelect
                options={filterOptions.products}
                value={filters.products}
                onChange={(selected) => setFilters(prev => ({ ...prev, products: selected || [] }))}
                placeholder="Select products..."
              />
            </FormField>

            <FormField label="Environments">
              <MultiSelect
                options={filterOptions.environments}
                value={filters.environments}
                onChange={(selected) => setFilters(prev => ({ ...prev, environments: selected || [] }))}
                placeholder="Select environments..."
              />
            </FormField>

            <FormField label="Cloud Providers">
              <MultiSelect
                options={filterOptions.cloudProviders}
                value={filters.cloudProviders}
                onChange={(selected) => setFilters(prev => ({ ...prev, cloudProviders: selected || [] }))}
                placeholder="Select cloud providers..."
              />
            </FormField>

            <FormField label="POD Names">
              <MultiSelect
                options={filterOptions.podNames}
                value={filters.podNames}
                onChange={(selected) => setFilters(prev => ({ ...prev, podNames: selected || [] }))}
                placeholder="Select POD names..."
              />
            </FormField>

            <FormField label="Test Suite Type">
              <MultiSelect
                options={filterOptions.testSuiteTypes}
                value={filters.testSuiteType}
                onChange={(selected) => setFilters(prev => ({ ...prev, testSuiteType: selected }))}
                placeholder="Select type..."
                isMulti={false}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredSuites.length} test suite(s) match current filters
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({
                  agent: null,
                  products: [],
                  cloudProviders: [],
                  environments: [],
                  podNames: [],
                  testSuiteType: null
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Trigger Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trigger Options</h3>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button
            icon={FiPlay}
            onClick={() => handleTrigger('all')}
            disabled={testSuites.length === 0}
          >
            Trigger All ({testSuites.length})
          </Button>
          
          <Button
            icon={FiPlay}
            variant="secondary"
            onClick={() => handleTrigger('filtered')}
            disabled={filteredSuites.length === 0}
          >
            Trigger Filtered ({filteredSuites.length})
          </Button>
        </div>
      </Card>

      {/* Running Jobs */}
      {runningJobsArray.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Running Jobs ({runningJobsArray.length})
            </h3>
            <Button
              icon={FiRefreshCw}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>
          
          <div className="space-y-4">
            {runningJobsArray.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={job.status} />
                    <div>
                      <h4 className="font-medium text-gray-900">{job.suiteName}</h4>
                      <p className="text-sm text-gray-500">
                        {job.product} • {job.environment} • {job.agent}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      icon={FiEye}
                      variant="outline"
                      size="sm"
                    >
                      View Logs
                    </Button>
                    {job.status === 'running' && (
                      <Button
                        icon={FiSquare}
                        variant="danger"
                        size="sm"
                        onClick={() => cancelJob(job.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  Started: {new Date(job.startTime).toLocaleString()}
                  {job.endTime && ` • Ended: ${new Date(job.endTime).toLocaleString()}`}
                </div>
                
                <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                  <div className="font-mono text-xs space-y-1">
                    {job.logs.map((log, index) => (
                      <div key={index} className="text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Available Test Suites */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Test Suites</h3>
        
        {filteredSuites.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No test suites match the current filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuites.map((suite) => (
              <motion.div
                key={suite.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{suite.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {suite.products.map(p => p.label).join(', ')} • 
                    {suite.environments.map(e => e.label).join(', ')} • 
                    {suite.agent.replace('-', ' ')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <StatusBadge status={suite.testSuiteType.replace('-', ' ')} />
                  <Button
                    icon={FiPlay}
                    size="sm"
                    onClick={() => simulateJobExecution(suite)}
                  >
                    Trigger
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TriggerPage;