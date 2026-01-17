import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut, profile } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary
    ${isActive(path) ? 'text-primary' : 'text-foreground/80'}
    after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 
    after:bg-primary after:transition-transform hover:after:scale-x-100
    ${isActive(path) ? 'after:scale-x-100' : ''}`;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-primary">Crème Cloud</h1>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/menu" className={navLinkClass('/menu')}>
            Menu
          </Link>
          <Link to="/about" className={navLinkClass('/about')}>
            About
          </Link>
          <Link to="/feedback" className={navLinkClass('/feedback')}>
            Feedback
          </Link>
          <Link to="/contact" className={navLinkClass('/contact')}>
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {profile?.name || 'User'}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/order-history')}>
                  <Package className="h-4 w-4 mr-2" />
                  Order History
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <User className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t py-4 space-y-3 px-4">
          <Link to="/" className="block hover:text-primary transition-colors">Home</Link>
          <Link to="/menu" className="block hover:text-primary transition-colors">Menu</Link>
          <Link to="/about" className="block hover:text-primary transition-colors">About</Link>
          <Link to="/feedback" className="block hover:text-primary transition-colors">Feedback</Link>
          <Link to="/contact" className="block hover:text-primary transition-colors">Contact</Link>
          <Link to="/cart" className="block hover:text-primary transition-colors">
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <>
              <Link to="/order-history" className="block hover:text-primary transition-colors">
                Order History
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="block hover:text-primary transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')} className="w-full">
              Login
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};