// src/pages/Cart.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user, profile } = useAuth(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view cart');
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCheckout = async () => {
    if (!profile) {
      toast.error('User profile not found. Please relog.');
      return;
    }
    if (cartItems.length === 0) {
      toast.info('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check stock availability first
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          toast.error(`Insufficient stock for ${item.product.name}. Only ${item.product.stock} left.`);
          setLoading(false);
          return;
        }
      }

      // Step 2: Create a single order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id, 
          total_amount: getCartTotal(),
          status: 'Pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 3: Create all the order items for this order in one batch
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      // Step 4: Call our database function to update the stock for each product
      const stockUpdatePromises = cartItems.map(item =>
        supabase.rpc('update_product_stock', {
          p_product_id: item.product_id,
          p_quantity_sold: item.quantity
        })
      );
      await Promise.all(stockUpdatePromises);

      // Step 5: Clear the cart and give feedback
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation?orderId=${orderData.id}`);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 font-dancing">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some delicious treats from our menu!
            </p>
            <Button onClick={() => navigate('/menu')}>
              Browse Menu
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.product.image || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                      <p className="text-muted-foreground mb-2">₹{item.product.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0 && val <= item.product.stock) {
                                updateQuantity(item.product_id, val);
                              }
                            }}
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;