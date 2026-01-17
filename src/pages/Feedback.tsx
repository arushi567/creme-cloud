import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

const Feedback = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    rating: 5,
    comment: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchFeedback();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name').limit(20);
    setProducts(data || []);
  };

  const fetchFeedback = async () => {
    const { data } = await supabase
      .from('feedback')
      .select(`
        *,
        profiles (name),
        products (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    setFeedbackList(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast.error('Please login to submit feedback');
      navigate('/auth');
      return;
    }

    try {
      feedbackSchema.parse({ rating: formData.rating, comment: formData.comment });
      setLoading(true);

      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        product_id: formData.productId || null,
        rating: formData.rating,
        comment: formData.comment,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setFormData({ productId: '', rating: 5, comment: '' });
      fetchFeedback();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to submit feedback');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Customer Feedback</h1>
            <p className="text-xl text-muted-foreground">
              Share your experience and help us improve
            </p>
          </div>

          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Leave Your Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product (Optional)</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= formData.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Feedback</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us about your experience..."
                  rows={5}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                />
                {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </Card>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Feedback</h2>
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <Card key={feedback.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{feedback.profiles?.name || 'Anonymous'}</p>
                      {feedback.products && (
                        <p className="text-sm text-muted-foreground">{feedback.products.name}</p>
                      )}
                    </div>
                    <div className="flex">
                      {Array.from({ length: feedback.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{feedback.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </p>
                </Card>
              ))}

              {feedbackList.length === 0 && (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No feedback yet. Be the first to share!</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Feedback;