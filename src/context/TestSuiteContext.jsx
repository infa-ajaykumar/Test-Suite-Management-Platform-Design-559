import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '../utils/helpers';

const TestSuiteContext = createContext();

export const useTestSuite = () => {
  const context = useContext(TestSuiteContext);
  if (!context) {
    throw new Error('useTestSuite must be used within a TestSuiteProvider');
  }
  return context;
};

export const TestSuiteProvider = ({ children }) => {
  const [testSuites, setTestSuites] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [runningJobs, setRunningJobs] = useState(new Map());

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSuites = localStorage.getItem('testSuites');
    const savedExecutions = localStorage.getItem('executions');
    const savedSchedules = localStorage.getItem('schedules');

    if (savedSuites) {
      setTestSuites(JSON.parse(savedSuites));
    }
    if (savedExecutions) {
      setExecutions(JSON.parse(savedExecutions));
    }
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('testSuites', JSON.stringify(testSuites));
  }, [testSuites]);

  useEffect(() => {
    localStorage.setItem('executions', JSON.stringify(executions));
  }, [executions]);

  useEffect(() => {
    localStorage.setItem('schedules', JSON.stringify(schedules));
  }, [schedules]);

  const addTestSuite = (suite) => {
    const newSuite = {
      ...suite,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTestSuites(prev => [...prev, newSuite]);
    return newSuite;
  };

  const updateTestSuite = (id, updates) => {
    setTestSuites(prev => 
      prev.map(suite => 
        suite.id === id 
          ? { ...suite, ...updates, updatedAt: new Date().toISOString() }
          : suite
      )
    );
  };

  const deleteTestSuite = (id) => {
    setTestSuites(prev => prev.filter(suite => suite.id !== id));
  };

  const addExecution = (execution) => {
    const newExecution = {
      ...execution,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setExecutions(prev => [newExecution, ...prev]);
    return newExecution;
  };

  const updateExecution = (id, updates) => {
    setExecutions(prev => 
      prev.map(execution => 
        execution.id === id 
          ? { ...execution, ...updates, updatedAt: new Date().toISOString() }
          : execution
      )
    );
  };

  const addSchedule = (schedule) => {
    const newSchedule = {
      ...schedule,
      id: generateId(),
      createdAt: new Date().toISOString(),
      active: true
    };
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  };

  const updateSchedule = (id, updates) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === id 
          ? { ...schedule, ...updates, updatedAt: new Date().toISOString() }
          : schedule
      )
    );
  };

  const deleteSchedule = (id) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  const addRunningJob = (jobId, jobData) => {
    setRunningJobs(prev => new Map(prev.set(jobId, jobData)));
  };

  const updateRunningJob = (jobId, updates) => {
    setRunningJobs(prev => {
      const newMap = new Map(prev);
      const existingJob = newMap.get(jobId);
      if (existingJob) {
        newMap.set(jobId, { ...existingJob, ...updates });
      }
      return newMap;
    });
  };

  const removeRunningJob = (jobId) => {
    setRunningJobs(prev => {
      const newMap = new Map(prev);
      newMap.delete(jobId);
      return newMap;
    });
  };

  const value = {
    testSuites,
    executions,
    schedules,
    runningJobs,
    addTestSuite,
    updateTestSuite,
    deleteTestSuite,
    addExecution,
    updateExecution,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    addRunningJob,
    updateRunningJob,
    removeRunningJob
  };

  return (
    <TestSuiteContext.Provider value={value}>
      {children}
    </TestSuiteContext.Provider>
  );
};