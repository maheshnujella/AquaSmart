import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Your Cart</h2>
              <p className="text-xs text-slate-400 font-medium">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pb-20">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black text-lg">Cart is empty</p>
              <p className="text-slate-400 font-medium text-sm">Add products from Feed or Medicine sections</p>
              <button
                onClick={() => { onClose(); navigate('/feed'); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition"
              >
                Shop Now
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemId = item._id || item.id;
              return (
                <div key={itemId} className="flex gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <ShoppingCart className="w-7 h-7 text-slate-300 m-auto mt-4" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">{item.name}</h3>
                    <p className="text-blue-600 font-black">₹{Number(item.price).toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(itemId, item.qty - 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-black text-slate-900 w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(itemId, item.qty + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-slate-400 ml-auto font-bold">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-white space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Delivery</span>
                <span className="text-green-600 font-bold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-lg pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-blue-600">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-200"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={clearCart}
              className="w-full text-slate-400 hover:text-red-500 py-2 text-sm font-bold transition"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
