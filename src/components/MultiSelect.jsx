import React from 'react';
import Select from 'react-select';

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options...',
  isMulti = true,
  className = '',
  isDisabled = false,
  ...props
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      border: state.isFocused ? '1px solid #3b82f6' : '1px solid #d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        border: state.isFocused ? '1px solid #3b82f6' : '1px solid #9ca3af',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#3730a3',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      '&:hover': {
        backgroundColor: '#c7d2fe',
        color: '#3730a3',
      },
    }),
  };

  return (
    <div className={`react-select-container ${className}`}>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isMulti={isMulti}
        isDisabled={isDisabled}
        styles={customStyles}
        classNamePrefix="react-select"
        {...props}
      />
    </div>
  );
};

export default MultiSelect;