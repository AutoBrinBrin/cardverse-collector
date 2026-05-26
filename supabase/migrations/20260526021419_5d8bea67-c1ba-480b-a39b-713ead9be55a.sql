
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  coins INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, coins)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), 1000);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cards master catalog (public read)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common','rare','epic','legendary')),
  element TEXT NOT NULL,
  power INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  art_color TEXT NOT NULL DEFAULT '#7c3aed'
);
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards public read" ON public.cards FOR SELECT USING (true);

-- Boosters (products, public read)
CREATE TABLE public.boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pack','box')),
  price INTEGER NOT NULL,
  pack_count INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL,
  image_key TEXT NOT NULL
);
ALTER TABLE public.boosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boosters public read" ON public.boosters FOR SELECT USING (true);

-- Inventory: unopened packs owned by user
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booster_id UUID NOT NULL REFERENCES public.boosters(id),
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv own select" ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inv own insert" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inv own update" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "inv own delete" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

-- User collected cards
CREATE TABLE public.user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards(id),
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uc own select" ON public.user_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uc own insert" ON public.user_cards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed cards
INSERT INTO public.cards (name, rarity, element, power, description, art_color) VALUES
('Pyromancer Ash','common','fire',12,'Lança chamas ardentes.','#ef4444'),
('Stone Sentinel','common','earth',14,'Guardião imóvel das montanhas.','#a16207'),
('Tide Whisperer','common','water',11,'Sussurra aos oceanos.','#0ea5e9'),
('Gale Sprite','common','air',10,'Espírito veloz dos ventos.','#22d3ee'),
('Forest Druid','common','earth',13,'Protetor da floresta antiga.','#16a34a'),
('Ember Wolf','common','fire',13,'Lobo flamejante caçador.','#f97316'),
('Frost Archer','rare','water',18,'Flechas de gelo perfurante.','#38bdf8'),
('Storm Knight','rare','air',20,'Cavaleiro envolto em raios.','#7dd3fc'),
('Magma Golem','rare','fire',22,'Forjado em rios de lava.','#dc2626'),
('Verdant Witch','rare','earth',19,'Domina raízes e venenos.','#15803d'),
('Astral Mage','epic','arcane',28,'Manipula constelações.','#a855f7'),
('Inferno Lord','epic','fire',32,'Soberano das chamas eternas.','#b91c1c'),
('Leviathan','epic','water',34,'Coloso das profundezas.','#0369a1'),
('Celestial Phoenix','legendary','fire',48,'Renasce em luz dourada.','#fbbf24'),
('World Dragon','legendary','arcane',55,'Forjou os primeiros céus.','#7c3aed');

INSERT INTO public.boosters (name, kind, price, pack_count, theme, image_key) VALUES
('Mystic Pack','pack',100,1,'mystic','booster-mystic'),
('Inferno Pack','pack',100,1,'inferno','booster-inferno'),
('Emerald Booster Box','box',900,10,'emerald','booster-box-emerald');
