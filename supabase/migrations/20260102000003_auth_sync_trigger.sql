-- 1. CREATE TRIGGER FUNCTION
-- This extracts the full_name from user_metadata and inserts into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Tactical User'),
    'viewer'
  );
  RETURN new; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CREATE THE TRIGGER
-- fires after every insert into auth.users (Supabase managed table)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. COMMENT FOR AUDIT
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a public profile record when a new user signs up.';
