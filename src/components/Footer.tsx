import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Crème Cloud</h3>
            <p className="text-sm text-muted-foreground">
              Delights as light as a cloud, crafted with cream and love.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/menu" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Menu
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Feedback
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contact Info</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Email: hello@cremecloud.com</p>
              <p>Phone: 9876543210</p>
              <p>Hours: Daily 8am - 8pm</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-primary fill-primary" /> by Crème Cloud © 2025
          </p>
        </div>
      </div>
    </footer>
  );
};