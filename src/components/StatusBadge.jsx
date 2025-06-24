import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiPlay, FiCheck, FiX, FiAlertTriangle } = FiIcons;

const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    pending: {
      icon: FiClock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Pending'
    },
    running: {
      icon: FiPlay,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Running'
    },
    success: {
      icon: FiCheck,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Success'
    },
    failure: {
      icon: FiX,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Failed'
    },
    error: {
      icon: FiAlertTriangle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Error'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <SafeIcon icon={config.icon} className="w-3 h-3 mr-1" />
      {config.label}
    </motion.span>
  );
};

export default StatusBadge;