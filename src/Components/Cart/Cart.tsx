// Cart.tsx

import React from 'react';
import './Cart.css';
import Button from '../Button/Button';

// Define the shape of a cart item
type CartItem = {
  price: number;
  quantity: number;
  // You can add other properties that a cart item might have, like id, name, etc.
};

// Define the props type
type CartProps = {
  cartItems: CartItem[];
  onCheckout: () => void; // Assuming onCheckout is a function that takes no arguments
};

function Cart({ cartItems, onCheckout }: CartProps) {
  const totalPrice = cartItems.reduce((a, c) => a + c.price * c.quantity, 0);

  return (
    <div className="cart_container"> {/* Corrected className */}
      {cartItems.length === 0 ? "No items in cart" : ""}
      <br /> <span className="">Total Price: ${totalPrice.toFixed(2)}</span>
      <Button
        title={`${cartItems.length === 0 ? 'Order!' : 'Checkout'}`}
        type={"checkout"}
        disable={cartItems.length === 0}
        onClick={onCheckout}
      />
    </div>
  );
}

export default Cart;
