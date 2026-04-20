import { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    // Products from MongoDB use _id, legacy items may use id
    const itemId = product._id || product.id;
    const existItem = cartItems.find((x) => (x._id || x.id) === itemId);

    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          (x._id || x.id) === itemId ? { ...x, qty: x.qty + 1 } : x
        )
      );
      toast.success(`+1 ${product.name}`);
    } else {
      setCartItems([...cartItems, { ...product, qty: 1 }]);
      toast.success(`${product.name} added to cart 🛒`);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((x) => (x._id || x.id) !== id));
    toast.success('Item removed');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems((prev) =>
      prev.map((x) => ((x._id || x.id) === id ? { ...x, qty } : x))
    );
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
