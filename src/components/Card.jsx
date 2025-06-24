import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const paddingClasses = padding ? 'p-6' : '';
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${paddingClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;