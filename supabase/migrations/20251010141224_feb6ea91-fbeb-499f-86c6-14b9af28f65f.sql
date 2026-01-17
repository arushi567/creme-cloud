-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Only admins can manage products (we'll handle admin check in the app)
CREATE POLICY "Authenticated users can manage products"
  ON public.products FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Delivered', 'Cancelled')),
  order_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for their orders
CREATE POLICY "Users can view their order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items
CREATE POLICY "Users can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create feedback table
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can view feedback
CREATE POLICY "Anyone can view feedback"
  ON public.feedback FOR SELECT
  USING (true);

-- Users can create feedback
CREATE POLICY "Users can create feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert products with proper pricing, categories, stock, descriptions, and images
INSERT INTO public.products (name, category, price, stock, description, image) VALUES
  ('Vanilla Bean Cupcake', 'Cupcakes', 300.00, 50, 'Classic vanilla cupcake with a rich bean-flavored frosting', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdL1ctRaQKLsSe9MG8uJl0yeCQq5GgpppU9sHu_WfzLsKxTzRjclSlos9XOyEMesOPJHrrFQF5ww0lAJx0zOZnkux4afsBRKXHOM0borfEA8j9sObHdpLQrICW0KiWY_hMCOjgHUTSGnhO9ZIJo6L2cqWL0uYvFbqduanrM_MzOWFO-_obTaVIaZvYDtuuhoqJQ8fqFemVpB3JabuACzllUfT_Lng-ssGPiOm_C4ZVTnXeb8-ZKiKe1gUCjh-4iOdqlNsuU64Akwzm'),
  ('Caramel Brownies', 'Brownies', 250.00, 60, 'Rich chocolate brownies with a gooey caramel layer', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5POB1x0d3SvrDPC953oDROkE8YUACF9ykJ5bBfaj880WoBlC4nS77ANRkzPjhavICOM1ddGmkfW4HWM2RNdVyAUa60oEG-10rFU2ud4wOtf7zpwb7DypFG2EMkfwyO6jbGxU0g1apI3sysmm-Cf3jjYKDOIe8WkbqGBwgLpxbpdPRUTg_tgayDsLODLDiZXIWqv9K7TIAQTk0Ua8nWTfisfab_EoVgAqN7a5yBDFPbfOlAZ_onBZ-wTZ7xx-Tk0P0fa3HQrEbG-yP'),
  ('Almond Croissant', 'Pastries', 200.00, 40, 'Flaky buttery croissant filled with almond paste', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt8xAaHe6vYrIRfOrFjUY7Lfdx9DditX_SVz_7yE3OMfjP_x6ZaioSwAiBSoCGYyx6NRb5lA1fzBMjEObzy_Msa9jy_Lrpown7tWyES3YcjQwezUePV5bIIXh31Z0p7AQYAaxIHCM6bo1BJBqaGzz8A3GadPdffszmAKphSbwc76iSbND5IaEh64RVdPt9ZoQrLDOD-wmytqxLMQJoXNdpTQ5PNhC6ikbD0UQK8GvmIvFQbZdEb1dPJUHYkuH8KEHfjmdvnfzVzUdJ'),
  ('Raspberry Macarons', 'Macarons', 280.00, 70, 'Delicate raspberry-flavored French macarons', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZkM9sfNE24ZWEbUor7J0Nq0c90b60sKnVlHDdJ-dJJlWcyZHrzolL-04cbbaQ6safS4iJD3mRldpfSRqbnddlpHglKr_UlvAV2FJmCx-iN7M8M-3e09ZqjHV2hS9wg90nv__iHNRrjO2qTL2ss07AQ_jD0a3M006T_QgJnxGNZsl0OIT6g1lOdYWC0sowMFeoF_rCo0-CkGVa8IeiQ4oQb2Vop0Jm5Zp-KHQwFwNe-nx--r6DQbCyqdrfvgayWq5HR6nS4fFiteDA'),
  ('Blueberry Muffins', 'Muffins', 320.00, 50, 'Soft and fluffy blueberry muffins loaded with fresh berries', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj-tcHgf1gOXdcLFNvFXexN7JuYdzrCQRvqlZvrsH6Tn2cvjCl7S4rdBMpqDPd92m2IMDDL0RjYfDYp9iy9llp8yUzRZCbWy11N_gJjLL2RGclGtxIy6GmA0iau8FxGAOZ01Q4kaYo_I2kLCqL4zvV5N99K5x-NUHm_5IEqY1i_MqSNdY6ZQ43NCJ-QH4E8eopmnqEZk5IunzYXP6TmgbiYNfLVNKKhw5sx-KOlwFVzmJ7RE7mMyqgjh48Ix2v8uN3Vy-Td4zbhqgV'),
  ('Strawberry Cheesecake', 'Cakes', 450.00, 30, 'Creamy cheesecake topped with fresh strawberries', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGZw5FyGp7jZMg1QzifnnNTIJ-i35nxCfuhO-KYSi38rCAHGKV5A3iOg3AiVZIF82zDCupVk50S9o6n_rYR-eaGc-0Px6k60iJY8xumgZdaub3deKLSfCdF29SG22Okxd8JCvYf8_tE9itL3JpyjFI9zUJNZc7ZwIJA-GQzaRmBZ2WuWgLTB86zaX0oPW3ZMDPSKSVclTWTFnvEfNaFXsnclZItfzUhdJk3d86VI-ITl3X2P-0xFWQXb_hR5qvm2eTrkPgo_WI35ZU'),
  ('Red Velvet Cupcake', 'Cupcakes', 350.00, 60, 'Rich red velvet cupcake with cream cheese frosting', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400'),
  ('Lemon Tart', 'Tarts', 400.00, 25, 'Zesty lemon tart with a crisp pastry shell', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB5xIO-6RdxN4j_l3zMEGpZsMYPl-xmCQscyt7-DKM7nBsfllURr8W9gRvmX8pW650Ukl183QL6LGGsN-w60R2g3QEjKVKx1Asp_GrZ1lw5IthKYFouNt2bZu71sPOWj23IiY_Swikvx3pJYGugLsYpcDLamdEvRMPq0se9ZkC2DRdPc-wOZr-uIp0QDQ0xtMMjlxJRoHGQYpVU4m-8G18rA35_BE-tHmQ46eJehjUF0wBsitWBuKnKpC1OmiRGMXVrn6pD5FEhw3D'),
  ('Strawberry Tart', 'Tarts', 450.00, 30, 'Mini strawberry tartlets with fresh fruit and custard', 'https://sundaytable.co/wp-content/uploads/2025/04/the-best-mini-strawberry-custard-tartlets.jpg'),
  ('Rose Macarons', 'Macarons', 280.00, 50, 'Delicate rose-flavored macarons with soft filling', 'https://www.piesandtacos.com/wp-content/uploads/2022/02/Rose-macarons-3.jpg'),
  ('Lavender Macarons', 'Macarons', 280.00, 50, 'Elegant lavender macarons with honey filling', 'https://www.piesandtacos.com/wp-content/uploads/2021/04/Lavender-Macarons-7-683x1024.jpg'),
  ('Tiramisu', 'Cakes', 500.00, 40, 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone', 'https://www.cookingclassy.com/wp-content/uploads/2022/08/tiramisu-17.jpg'),
  ('Chocolate Chip Cookie', 'Cookies', 200.00, 100, 'Soft-baked cookie loaded with chocolate chips', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'),
  ('Chocolate Fudge Cake', 'Cakes', 1500.00, 20, 'Rich and moist chocolate fudge cake', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9m0ayUSSdOFTFksuJhBo7fY4XVCskxyevr5D_Lh9q7uNfABtWAhVpj_FxlbM9Ci-dkf-C5-6_HAC0tEs8bUirvdugMMPA4O25jwliruw863UAbspeQeEFQWHyBaAvEuSGeh0quj4EJY6B5NOhFsCrU8Zej9KqHa10hJBCOzJocruDozzWMB9oCeRRdjdXVIxVH0drH0FbzD7qOASyZIK7JPWddG__QohWMZKoAq444MUR58PoCZj3zun4CFrTZdloSnnxl47hG2KZ');