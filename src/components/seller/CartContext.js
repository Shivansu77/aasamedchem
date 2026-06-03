"use client";

import { createContext, useContext, useState } from "react";
import Decimal from "decimal.js";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product, unitId, quantity, unitPrice, subtotal, unitAbbr) => {
    // Check if same product + unit already in cart
    const existingIndex = cartItems.findIndex(
      (item) => item.product_id === product.id && item.unit_id === unitId
    );

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity = new Decimal(updated[existingIndex].quantity).plus(quantity).toFixed();
      updated[existingIndex].subtotal = new Decimal(updated[existingIndex].subtotal).plus(subtotal).toFixed(12);
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          product_id: product.id,
          product_name: product.name,
          sku: product.sku,
          unit_id: unitId,
          unit_abbr: unitAbbr,
          quantity,
          unit_price: unitPrice,
          subtotal,
        },
      ]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
