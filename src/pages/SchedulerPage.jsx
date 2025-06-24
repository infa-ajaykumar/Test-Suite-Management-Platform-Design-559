import React, { useState } from 'react';
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
import { format, addDays, addWeeks, addMonths } from 'date-fns';

const { FiPlus, FiClock, FiPlay, FiPause, FiEdit, FiTrash2, FiCalendar } = FiIcons;

const SchedulerPage = () => {
  const { testSuites, schedules, addSchedule, updateSchedule, deleteSchedule } = useTestSuite();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    products: [],
    cloudProviders: [],
    environments: [],
    podNames: [],
    testSuiteType: '',
    scheduleType: 'cron',
    cronExpression: '0 9 * * 1', // Every Monday at 9 AM
    interval: 'daily',
    time: '09:00',
    timezone: 'UTC',
    active: true
  });

  const [errors, setErrors] = useState({});

  // Get unique values for filter options
  const getFilterOptions = () => {
    const products = [...new Set(testSuites.flatMap(suite => suite.products.map(p => p.value)))];
    const cloudProviders = [...new Set(testSuites.flatMap(suite => suite.cloudProviders.map(cp => cp.value)))];
    const environments = [...new Set(testSuites.flatMap(suite => suite.environments.map(e => e.value)))];
    const podNames = [...new Set(testSuites.flatMap(suite => suite.podNames.map(p => p.value)))];
    const testSuiteTypes = [...new Set(testSuites.map(suite => suite.testSuiteType))];

    return {
      products: products.map(product => ({ value: product, label: product })),
      cloudProviders: cloudProviders.map(cp => ({ value: cp, label: cp })),
      environments: environments.map(env => ({ value: env, label: env })),
      podNames: podNames.map(pod => ({ value: pod, label: pod })),
      testSuiteTypes: testSuiteTypes.map(type => ({ value: type, label: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
    };
  };

  const filterOptions = getFilterOptions();

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Asia/Tokyo', label: 'Tokyo' }
  ];

  const intervalOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const predefinedCronOptions = [
    { value: '0 9 * * 1', label: 'Every Monday at 9:00 AM' },
    { value: '0 9 * * *', label: 'Every day at 9:00 AM' },
    { value: '0 9 * * 1-5', label: 'Every weekday at 9:00 AM' },
    { value: '0 0 1 * *', label: 'First day of every month at midnight' },
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 0 * * 0', label: 'Every Sunday at midnight' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Schedule name is required';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'At least one product must be selected';
    }

    if (formData.environments.length === 0) {
      newErrors.environments = 'At least one environment must be selected';
    }

    if (formData.scheduleType === 'cron' && !formData.cronExpression.trim()) {
      newErrors.cronExpression = 'Cron expression is required';
    }

    if (formData.scheduleType === 'interval' && !formData.time) {
      newErrors.time = 'Time is required for interval scheduling';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNextRun = (schedule) => {
    const now = new Date();
    
    if (schedule.scheduleType === 'interval') {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      let nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      if (nextRun <= now) {
        switch (schedule.interval) {
          case 'daily':
            nextRun = addDays(nextRun, 1);
            break;
          case 'weekly':
            nextRun = addWeeks(nextRun, 1);
            break;
          case 'monthly':
            nextRun = addMonths(nextRun, 1);
            break;
        }
      }
      
      return nextRun;
    }
    
    // For cron expressions, we'll simulate the next run
    return addDays(now, 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const scheduleData = {
        ...formData,
        nextRun: calculateNextRun(formData).toISOString()
      };

      if (editingSchedule) {
        updateSchedule(editingSchedule.id, scheduleData);
        toast.success('Schedule updated successfully!');
        setEditingSchedule(null);
      } else {
        addSchedule(scheduleData);
        toast.success('Schedule created successfully!');
      }
      
      setShowCreateForm(false);
      setFormData({
        name: '',
        products: [],
        cloudProviders: [],
        environments: [],
        podNames: [],
        testSuiteType: '',
        scheduleType: 'cron',
        cronExpression: '0 9 * * 1',
        interval: 'daily',
        time: '09:00',
        timezone: 'UTC',
        active: true
      });
      setErrors({});

    } catch (error) {
      toast.error('Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setShowCreateForm(true);
  };

  const handleDelete = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      deleteSchedule(scheduleId);
      toast.success('Schedule deleted successfully');
    }
  };

  const toggleScheduleStatus = (schedule) => {
    updateSchedule(schedule.id, { active: !schedule.active });
    toast.success(`Schedule ${schedule.active ? 'paused' : 'activated'}`);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Suite Scheduler
          </h1>
          <p className="text-gray-600">
            Schedule automatic triggers for test suites per product and environment.
          </p>
        </div>
        
        <Button
          icon={FiPlus}
          onClick={() => {
            setShowCreateForm(true);
            setEditingSchedule(null);
            setFormData({
              name: '',
              products: [],
              cloudProviders: [],
              environments: [],
              podNames: [],
              testSuiteType: '',
              scheduleType: 'cron',
              cronExpression: '0 9 * * 1',
              interval: 'daily',
              time: '09:00',
              timezone: 'UTC',
              active: true
            });
          }}
        >
          Create Schedule
        </Button>
      </motion.div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Schedule Name"
              required
              error={errors.name}
            >
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter schedule name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Products"
                required
                error={errors.products}
              >
                <MultiSelect
                  options={filterOptions.products}
                  value={formData.products}
                  onChange={(selected) => setFormData(prev => ({ ...prev, products: selected || [] }))}
                  placeholder="Select products..."
                />
              </FormField>

              <FormField
                label="Environments"
                required
                error={errors.environments}
              >
                <MultiSelect
                  options={filterOptions.environments}
                  value={formData.environments}
                  onChange={(selected) => setFormData(prev => ({ ...prev, environments: selected || [] }))}
                  placeholder="Select environments..."
                />
              </FormField>

              <FormField
                label="Cloud Providers"
              >
                <MultiSelect
                  options={filterOptions.cloudProviders}
                  value={formData.cloudProviders}
                  onChange={(selected) => setFormData(prev => ({ ...prev, cloudProviders: selected || [] }))}
                  placeholder="Select cloud providers..."
                />
              </FormField>

              <FormField
                label="POD Names"
              >
                <MultiSelect
                  options={filterOptions.podNames}
                  value={formData.podNames}
                  onChange={(selected) => setFormData(prev => ({ ...prev, podNames: selected || [] }))}
                  placeholder="Select POD names..."
                />
              </FormField>
            </div>

            <FormField
              label="Test Suite Type"
            >
              <select
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.testSuiteType}
                onChange={(e) => setFormData(prev => ({ ...prev, testSuiteType: e.target.value }))}
              >
                <option value="">All types</option>
                {filterOptions.testSuiteTypes.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Schedule Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Schedule Type"
                >
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="cron"
                        checked={formData.scheduleType === 'cron'}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduleType: e.target.value }))}
                        className="mr-2"
                      />
                      Cron Expression
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="interval"
                        checked={formData.scheduleType === 'interval'}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduleType: e.target.value }))}
                        className="mr-2"
                      />
                      Simple Interval
                    </label>
                  </div>
                </FormField>

                <FormField
                  label="Timezone"
                >
                  <select
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    {timezoneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              {formData.scheduleType === 'cron' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    label="Cron Expression"
                    error={errors.cronExpression}
                    description="Format: minute hour day month day-of-week"
                  >
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0 9 * * 1"
                      value={formData.cronExpression}
                      onChange={(e) => setFormData(prev => ({ ...prev, cronExpression: e.target.value }))}
                    />
                  </FormField>

                  <FormField
                    label="Predefined Options"
                  >
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          setFormData(prev => ({ ...prev, cronExpression: e.target.value }));
                        }
                      }}
                    >
                      <option value="">Select a predefined schedule...</option>
                      {predefinedCronOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    label="Interval"
                  >
                    <select
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.interval}
                      onChange={(e) => setFormData(prev => ({ ...prev, interval: e.target.value }))}
                    >
                      {intervalOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Time"
                    error={errors.time}
                  >
                    <input
                      type="time"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </FormField>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingSchedule(null);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Schedules List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Schedules ({schedules.filter(s => s.active).length})
          </h3>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiClock} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No schedules created</p>
            <p className="text-gray-400 mb-4">Create your first schedule to automate test execution</p>
            <Button
              icon={FiPlus}
              onClick={() => setShowCreateForm(true)}
            >
              Create Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${schedule.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                    <StatusBadge status={schedule.active ? 'success' : 'pending'} />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      icon={schedule.active ? FiPause : FiPlay}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleScheduleStatus(schedule)}
                    >
                      {schedule.active ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      icon={FiEdit}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(schedule)}
                    >
                      Edit
                    </Button>
                    <Button
                      icon={FiTrash2}
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Products:</span> {schedule.products.map(p => p.label).join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Environments:</span> {schedule.environments.map(e => e.label).join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Schedule:</span> {
                      schedule.scheduleType === 'cron' 
                        ? schedule.cronExpression 
                        : `${schedule.interval} at ${schedule.time}`
                    }
                  </div>
                </div>
                
                {schedule.nextRun && (
                  <div className="mt-3 text-sm text-gray-500">
                    <SafeIcon icon={FiCalendar} className="inline w-4 h-4 mr-1" />
                    Next run: {format(new Date(schedule.nextRun), 'MMM dd, yyyy HH:mm')} ({schedule.timezone})
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SchedulerPage;