import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view orders');
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 font-dancing">Order History</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here!
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-lg font-bold text-primary">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 border-t pt-3">
                      <img
                        src={item.products?.image || '/placeholder.svg'}
                        alt={item.products?.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistory;
