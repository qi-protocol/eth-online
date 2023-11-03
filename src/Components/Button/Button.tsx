// Button.tsx

import React from "react";
import './Button.css';

// Define the type for the props
type ButtonProps = {
  type: 'add' | 'remove' | 'checkout';
  title: string;
  disable?: boolean; // Optional prop, use '?' to indicate that the prop may not be provided
  onClick: () => void;
};

const Button: React.FC<ButtonProps> = ({ type, title, disable = false, onClick }) => {
    return (
        <button className={`btn ${
            type === 'add' && 'add' ||
            type === 'remove' && 'remove' || 
            type === 'checkout' && 'checkout'
        }`}
        disabled={disable}
        onClick={onClick}
        >
            {title}
        </button>
    );
};

export default Button;
