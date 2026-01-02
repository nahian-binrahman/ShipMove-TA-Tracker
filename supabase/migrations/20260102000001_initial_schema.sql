-- Core Schema for ShipMove TA Tracker

-- 1. Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'data_entry', 'viewer')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Soldiers (Personnel) Table
CREATE TABLE IF NOT EXISTS public.soldiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  unit TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Movements Table
CREATE TABLE IF NOT EXISTS public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  soldier_id UUID NOT NULL REFERENCES public.soldiers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  transport_mode TEXT NOT NULL,
  ta_amount DECIMAL(10,2) DEFAULT 0,
  movement_fingerprint TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view soldiers." ON public.soldiers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Data entry and admins can manage soldiers." ON public.soldiers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'data_entry')
  )
);

CREATE POLICY "Authenticated users can view movements." ON public.movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert movements." ON public.movements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins and data entry can update movements." ON public.movements FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'data_entry')
  )
);
