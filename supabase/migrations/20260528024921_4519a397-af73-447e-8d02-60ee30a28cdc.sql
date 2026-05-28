
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Update handle_new_user to also grant admin role to the admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, coins)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)), 1000)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  IF NEW.email = 'mopiticher@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- If admin user already exists, backfill the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'mopiticher@gmail.com'
ON CONFLICT DO NOTHING;

-- model_url columns
ALTER TABLE public.boosters ADD COLUMN IF NOT EXISTS model_url text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS model_url text;

-- Admins can update boosters/cards (to set model_url)
GRANT UPDATE ON public.boosters TO authenticated;
GRANT UPDATE ON public.cards TO authenticated;

CREATE POLICY "admins update boosters" ON public.boosters
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update cards" ON public.cards
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for 3D models
INSERT INTO storage.buckets (id, name, public) VALUES ('models', 'models', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "models public read" ON storage.objects FOR SELECT USING (bucket_id = 'models');
CREATE POLICY "admins upload models" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'models' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update models" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'models' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete models" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'models' AND public.has_role(auth.uid(), 'admin'));
