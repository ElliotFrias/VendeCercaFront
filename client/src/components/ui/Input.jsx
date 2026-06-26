import { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {Icon && <Icon className="input-icon" size={18} />}
        <input 
          ref={ref}
          className={`input-field ${Icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
