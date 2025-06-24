import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import { useTestSuite } from '../context/TestSuiteContext';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField from '../components/FormField';
import MultiSelect from '../components/MultiSelect';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiUpload, FiCheck } = FiIcons;

const OnboardingPage = () => {
  const { addTestSuite } = useTestSuite();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    agent: '',
    targetUrl: '',
    products: [],
    cloudProviders: [],
    environments: [],
    podNames: [],
    testSuiteType: '',
    notificationEmails: '',
    notificationConditions: [],
    retryPolicy: 3,
    timeoutMinutes: 30,
    documentation: ''
  });

  const [errors, setErrors] = useState({});

  const agentOptions = [
    { value: 'harness-delegator', label: 'Harness Delegator' },
    { value: 'temporal-agent', label: 'Temporal Agent' },
    { value: 'default-agent', label: 'Default Agent' }
  ];

  const productOptions = [
    { value: 'MDM', label: 'MDM' },
    { value: 'CAI', label: 'CAI' },
    { value: 'TASKFLOW', label: 'TASKFLOW' },
    { value: 'ANALYTICS', label: 'Analytics' },
    { value: 'PLATFORM', label: 'Platform' }
  ];

  const cloudProviderOptions = [
    { value: 'AWS', label: 'AWS' },
    { value: 'AZURE', label: 'Azure' },
    { value: 'GCP', label: 'Google Cloud' },
    { value: 'ORACLE', label: 'Oracle Cloud' }
  ];

  const environmentOptions = [
    { value: 'PROD', label: 'Production' },
    { value: 'STAGING', label: 'Staging' },
    { value: 'PREVIEW', label: 'Preview' },
    { value: 'DEV', label: 'Development' }
  ];

  const podNameOptions = [
    { value: 'usw1', label: 'US West 1' },
    { value: 'usw3', label: 'US West 3' },
    { value: 'usw5', label: 'US West 5' },
    { value: 'use2', label: 'US East 2' },
    { value: 'use4', label: 'US East 4' },
    { value: 'use6', label: 'US East 6' },
    { value: 'apse1', label: 'Asia Pacific SE 1' }
  ];

  const testSuiteTypeOptions = [
    { value: 'health-check', label: 'Health Check Only' },
    { value: 'functional', label: 'Functional' },
    { value: 'full-test', label: 'Full Test' }
  ];

  const notificationConditionOptions = [
    { value: 'success', label: 'Success' },
    { value: 'failure', label: 'Failure' },
    { value: 'on-trigger', label: 'On Trigger' },
    { value: 'all', label: 'All' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Test suite name is required';
    }

    if (!formData.agent) {
      newErrors.agent = 'Agent selection is required';
    }

    if (!formData.targetUrl.trim()) {
      newErrors.targetUrl = 'Target URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.targetUrl)) {
      newErrors.targetUrl = 'Please enter a valid URL';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }

    if (formData.environments.length === 0) {
      newErrors.environments = 'At least one environment must be selected';
    }

    if (!formData.testSuiteType) {
      newErrors.testSuiteType = 'Test suite type is required';
    }

    if (formData.notificationEmails.trim()) {
      const emails = formData.notificationEmails.split(',').map(e => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        newErrors.notificationEmails = 'Please enter valid email addresses';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSuite = addTestSuite({
        ...formData,
        notificationEmails: formData.notificationEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email)
      });

      toast.success('Test suite onboarded successfully!');
      
      // Reset form
      setFormData({
        name: '',
        agent: '',
        targetUrl: '',
        products: [],
        cloudProviders: [],
        environments: [],
        podNames: [],
        testSuiteType: '',
        notificationEmails: '',
        notificationConditions: [],
        retryPolicy: 3,
        timeoutMinutes: 30,
        documentation: ''
      });

    } catch (error) {
      toast.error('Failed to onboard test suite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Test Suite Onboarding
        </h1>
        <p className="text-gray-600">
          Register and configure test suites with all necessary metadata and connection details.
        </p>
      </motion.div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Test Suite Name"
              required
              error={errors.name}
            >
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter test suite name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </FormField>

            <FormField
              label="Agent Selection"
              required
              error={errors.agent}
            >
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.agent}
                onChange={(e) => setFormData(prev => ({ ...prev, agent: e.target.value }))}
              >
                <option value="">Select an agent</option>
                {agentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label="Target URL"
            required
            error={errors.targetUrl}
            description="URL where pipeline/test trigger requests will be sent"
          >
            <input
              type="url"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/api/trigger"
              value={formData.targetUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
            />
          </FormField>

          {/* Mapping Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapping Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Products"
                required
                error={errors.products}
              >
                <MultiSelect
                  options={productOptions}
                  value={formData.products}
                  onChange={(selected) => setFormData(prev => ({ ...prev, products: selected || [] }))}
                  placeholder="Select products..."
                />
              </FormField>

              <FormField
                label="Cloud Service Providers"
                error={errors.cloudProviders}
              >
                <MultiSelect
                  options={cloudProviderOptions}
                  value={formData.cloudProviders}
                  onChange={(selected) => setFormData(prev => ({ ...prev, cloudProviders: selected || [] }))}
                  placeholder="Select cloud providers..."
                />
              </FormField>

              <FormField
                label="Environments"
                required
                error={errors.environments}
              >
                <MultiSelect
                  options={environmentOptions}
                  value={formData.environments}
                  onChange={(selected) => setFormData(prev => ({ ...prev, environments: selected || [] }))}
                  placeholder="Select environments..."
                />
              </FormField>

              <FormField
                label="POD Names"
                error={errors.podNames}
              >
                <MultiSelect
                  options={podNameOptions}
                  value={formData.podNames}
                  onChange={(selected) => setFormData(prev => ({ ...prev, podNames: selected || [] }))}
                  placeholder="Select POD names..."
                />
              </FormField>
            </div>

            <FormField
              label="Test Suite Type"
              required
              error={errors.testSuiteType}
              className="mt-6"
            >
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.testSuiteType}
                onChange={(e) => setFormData(prev => ({ ...prev, testSuiteType: e.target.value }))}
              >
                <option value="">Select test suite type</option>
                {testSuiteTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Notification Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Notification Emails"
                error={errors.notificationEmails}
                description="Comma-separated email addresses"
              >
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="user1@example.com, user2@example.com"
                  value={formData.notificationEmails}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationEmails: e.target.value }))}
                />
              </FormField>

              <FormField
                label="Notification Conditions"
              >
                <MultiSelect
                  options={notificationConditionOptions}
                  value={formData.notificationConditions}
                  onChange={(selected) => setFormData(prev => ({ ...prev, notificationConditions: selected || [] }))}
                  placeholder="Select conditions..."
                />
              </FormField>
            </div>
          </div>

          {/* Additional Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Retry Policy"
                description="Number of retry attempts"
              >
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.retryPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, retryPolicy: parseInt(e.target.value) || 0 }))}
                />
              </FormField>

              <FormField
                label="Timeout (Minutes)"
                description="Test execution timeout"
              >
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.timeoutMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeoutMinutes: parseInt(e.target.value) || 30 }))}
                />
              </FormField>
            </div>

            <FormField
              label="Documentation URL"
              description="Link to test suite documentation or scripts"
              className="mt-6"
            >
              <input
                type="url"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://docs.example.com/test-suite"
                value={formData.documentation}
                onChange={(e) => setFormData(prev => ({ ...prev, documentation: e.target.value }))}
              />
            </FormField>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: '',
                    agent: '',
                    targetUrl: '',
                    products: [],
                    cloudProviders: [],
                    environments: [],
                    podNames: [],
                    testSuiteType: '',
                    notificationEmails: '',
                    notificationConditions: [],
                    retryPolicy: 3,
                    timeoutMinutes: 30,
                    documentation: ''
                  });
                  setErrors({});
                }}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={FiCheck}
              >
                Onboard Test Suite
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingPage;