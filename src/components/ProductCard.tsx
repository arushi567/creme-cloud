import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  onAddToCart?: (id: string) => void;
}

export const ProductCard = ({ id, name, description, price, image, stock, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover-glow border-border/50">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image || 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400'}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">₹{price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          disabled={stock === 0}
          onClick={() => onAddToCart?.(id)}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};