-- Audit table for movement status changes
CREATE TABLE IF NOT EXISTS public.movement_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'status_change', 'approved', 'rejected'
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.movement_audit ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.movement_audit
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger to log creation
CREATE OR REPLACE FUNCTION public.log_movement_creation()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.movement_audit (movement_id, action, new_status, changed_by, notes)
  VALUES (NEW.id, 'created', NEW.status, auth.uid(), 'Initial record creation');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_movement_created
  AFTER INSERT ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.log_movement_creation();
