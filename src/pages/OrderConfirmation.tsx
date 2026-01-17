import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      navigate('/');
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price, image)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2 font-dancing">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received it and will process it soon.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 mb-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.products?.name} × {item.quantity}</span>
                  <span className="font-semibold">
                    ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">₹{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/order-history')} variant="outline">
              View Order History
            </Button>
            <Button onClick={() => navigate('/menu')}>
              Continue Shopping
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
