import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">About Crème Cloud</h1>
            <p className="text-xl text-muted-foreground">
              A dreamy digital patisserie where every dessert is made with love and lightness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6 hover-glow">
              <div className="text-4xl mb-4">🎂</div>
              <h3 className="text-xl font-semibold mb-2">Our Story</h3>
              <p className="text-muted-foreground">
                Founded with a passion for creating delightful pastries, Crème Cloud brings together
                traditional French techniques with modern creativity. Every creation tells a story of
                dedication and artistry.
              </p>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-2">Expert Craftsmanship</h3>
              <p className="text-muted-foreground">
                Our team of skilled pastry chefs brings decades of combined experience, ensuring each
                dessert meets the highest standards of quality and taste.
              </p>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Quality Ingredients</h3>
              <p className="text-muted-foreground">
                We source only the finest ingredients, from premium Belgian chocolate to fresh organic
                fruits, ensuring every bite is a moment of pure indulgence.
              </p>
            </Card>

            <Card className="p-6 hover-glow">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
              <p className="text-muted-foreground">
                Each pastry is handcrafted with care and attention to detail, transforming simple
                ingredients into edible works of art that bring joy to every occasion.
              </p>
            </Card>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              To create delightful moments through exceptional pastries that are as beautiful as they
              are delicious. We believe that every dessert should be a celebration, a memory, and a
              testament to the art of pastry making.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;