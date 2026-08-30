import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('apex_cart', JSON.stringify(items));
  }, [items]);

  function addItem(product, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.product_images?.[0]?.url || '',
        quantity
      }];
    });
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) return removeItem(productId);
    setItems(prev =>
      prev.map(i => i.product_id === productId ? { ...i, quantity } : i)
    );
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}
