import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Cakes',
    price: '',
    stock: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (name, email)
      `)
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            category: productForm.category,
            price: parseFloat(productForm.price),
            stock: parseInt(productForm.stock),
            description: productForm.description,
            image: productForm.image,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase.from('products').insert({
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          description: productForm.description,
          image: productForm.image,
        });

        if (error) throw error;
        toast.success('Product added successfully');
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Cakes', price: '', stock: '', description: '', image: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      image: product.image || '',
    });
    setIsDialogOpen(true);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Manage Products</TabsTrigger>
            <TabsTrigger value="orders">View Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ name: '', category: 'Cakes', price: '', stock: '', description: '', image: '' });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cakes">Cakes</SelectItem>
                          <SelectItem value="Cookies">Cookies</SelectItem>
                          <SelectItem value="Cupcakes">Cupcakes</SelectItem>
                          <SelectItem value="Tarts">Tarts</SelectItem>
                          <SelectItem value="Macarons">Macarons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSaveProduct} className="w-full">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>₹{parseFloat(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.profiles?.name || order.profiles?.email}</TableCell>
                      <TableCell>₹{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {orders.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No orders yet
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;