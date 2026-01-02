-- SHIPMOVE TA TRACKER : COMPREHENSIVE SCHEMA DEPLOYMENT
-- USE THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX "MISSING TABLE" ERRORS

-- 1. Profiles & Extension Setup
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  rank TEXT,
  organization TEXT DEFAULT 'Bangladesh Navy',
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'data_entry', 'viewer')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Personnel Database
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

-- 3. Tactical Movements
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
  attachment_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Audit Trail
CREATE TABLE IF NOT EXISTS public.movement_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  action TEXT NOT NULL, 
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Unified Audit Trigger Function
CREATE OR REPLACE FUNCTION public.handle_movement_audit()
RETURNS trigger AS $$
DECLARE
    audit_action TEXT;
    old_status_val TEXT := NULL;
    new_status_val TEXT := NULL;
    audit_notes TEXT := NULL;
    diff_data JSONB := '{}'::jsonb;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        audit_action := 'created';
        new_status_val := NEW.status;
        audit_notes := 'Initial tactical record creation';
        diff_data := jsonb_build_object(
            'to', NEW.to_location,
            'from', NEW.from_location,
            'type', NEW.movement_type
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            audit_action := CASE 
                WHEN NEW.status = 'approved' THEN 'approved'
                WHEN NEW.status = 'rejected' THEN 'rejected'
                ELSE 'status_change'
            END;
            old_status_val := OLD.status;
            new_status_val := NEW.status;
            audit_notes := 'Status transition from ' || OLD.status || ' to ' || NEW.status;
        ELSE
            audit_action := 'updated';
            audit_notes := 'Operational record details updated';
        END IF;

        IF OLD.from_location IS DISTINCT FROM NEW.from_location THEN 
            diff_data := diff_data || jsonb_build_object('from', jsonb_build_object('old', OLD.from_location, 'new', NEW.from_location)); 
        END IF;
        IF OLD.to_location IS DISTINCT FROM NEW.to_location THEN 
            diff_data := diff_data || jsonb_build_object('to', jsonb_build_object('old', OLD.to_location, 'new', NEW.to_location)); 
        END IF;
    END IF;

    IF audit_action IS NOT NULL THEN
        INSERT INTO public.movement_audit (movement_id, action, old_status, new_status, changed_by, notes, metadata)
        VALUES (NEW.id, audit_action, old_status_val, new_status_val, auth.uid(), audit_notes, diff_data);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Activate Trigger
DROP TRIGGER IF EXISTS on_movement_change ON public.movements;
CREATE TRIGGER on_movement_change
  AFTER INSERT OR UPDATE ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_movement_audit();

-- 7. Profile Auth Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Tactical User'), 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soldiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_audit ENABLE ROW LEVEL SECURITY;

-- 9. Basic Access Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can view soldiers." ON public.soldiers;
CREATE POLICY "Authenticated users can view soldiers." ON public.soldiers FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view movements." ON public.movements;
CREATE POLICY "Authenticated users can view movements." ON public.movements FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read access for all users" ON public.movement_audit;
CREATE POLICY "Enable read access for all users" ON public.movement_audit FOR SELECT USING (auth.role() = 'authenticated');

-- 10. User Management & Auditing
CREATE TABLE IF NOT EXISTS public.user_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id),
    target_user_id UUID NOT NULL,
    action TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all user audits" ON public.user_audit;
CREATE POLICY "Admins can view all user audits" ON public.user_audit
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role = 'admin'
        )
    );
