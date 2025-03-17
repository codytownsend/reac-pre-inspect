// src/components/Card.jsx
import React from 'react';

const Card = ({ children, onClick, className = '' }) => {
  const cardClass = `card ${className} ${onClick ? 'cursor-pointer' : ''}`;
  
  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;