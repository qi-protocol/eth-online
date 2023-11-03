// Card.tsx

import React, { useState } from 'react';
import './Card.css';
import Button from '../Button/Button';

// Define the type for the 'food' object prop
type FoodItem = {
  title: string;
  Image: string; // Make sure the property name matches the actual object's property, JS is case-sensitive
  price: number;
  id: number;
  // Include any other properties that the food object contains
};

// Define the props for the Card component
type CardProps = {
  food: FoodItem;
  onAdd: (food: FoodItem) => void;
  onRemove: (food: FoodItem) => void;
};

const Card: React.FC<CardProps> = ({ food, onAdd, onRemove }) => {
  const [count, setCount] = useState<number>(0);

  const { title, Image, price } = food;

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
    onAdd(food);
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount((prevCount) => prevCount - 1);
      onRemove(food);
    }
  };

  return (
    <div className="card">
      <span className={count !== 0 ? 'card__badge' : 'card__badge--hidden'}>
        {count}
      </span>
      <div className="image__container">
        <img src={Image} alt={title} />
        <h4 className="card__title">
          {title} . <span className="card__price">$ {price.toFixed(2)}</span>
        </h4>

        <div className="btn-container">
          <Button title={"+"} type={'add'} onClick={handleIncrement} />
          {count !== 0 && (
            <Button title={'-'} type={'remove'} onClick={handleDecrement} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
