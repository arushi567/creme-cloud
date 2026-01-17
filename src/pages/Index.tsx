import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowRight, Sparkles } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBanner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
          </div>
          
          <div className="container relative mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Fresh Daily Delights
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Delights as light as a <span className="text-primary">cloud</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl">
                Crafted with cream and love, each pastry is a dreamy escape into sweetness.
              </p>
              
              <div className="flex gap-4">
                <Link to="/menu">
                  <Button size="lg" className="gap-2 hover-glow">
                    Shop Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="hover-glow">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose Crème Cloud?</h2>
              <p className="text-muted-foreground text-lg">
                Experience the magic of artisanal pastries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-3xl bg-card hover-glow">
                <div className="text-4xl">🥐</div>
                <h3 className="text-xl font-semibold">Fresh Daily</h3>
                <p className="text-muted-foreground">
                  All our pastries are baked fresh every morning with premium ingredients
                </p>
              </div>

              <div className="text-center space-y-4 p-6 rounded-3xl bg-card hover-glow">
                <div className="text-4xl">✨</div>
                <h3 className="text-xl font-semibold">Handcrafted</h3>
                <p className="text-muted-foreground">
                  Each dessert is carefully crafted by our expert pastry chefs
                </p>
              </div>

              <div className="text-center space-y-4 p-6 rounded-3xl bg-card hover-glow">
                <div className="text-4xl">🎁</div>
                <h3 className="text-xl font-semibold">Custom Orders</h3>
                <p className="text-muted-foreground">
                  We create custom cakes and desserts for your special occasions
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;