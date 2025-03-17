// src/components/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  block = false, 
  onClick, 
  disabled = false 
}) => {
  const classes = `btn btn-${variant} ${block ? 'btn-block' : ''}`;
  
  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;