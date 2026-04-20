import React from 'react';

const Card = ({ children, className = '', hover = false, padding = 'md' }) => {
  const baseStyles = 'bg-white rounded-xl shadow-lg border border-gray-200';
  
  const hoverStyles = hover ? 'hover:shadow-xl transition-shadow duration-300' : '';
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
