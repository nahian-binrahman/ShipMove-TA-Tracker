-- Add metadata column for diffs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movement_audit' AND column_name='metadata') THEN
        ALTER TABLE public.movement_audit ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Drop existing restricted trigger
DROP TRIGGER IF EXISTS on_movement_created ON public.movements;
DROP FUNCTION IF EXISTS public.log_movement_creation();

-- Unified Robust Audit Function
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
        -- Check if status changed
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

        -- Capture diff for metadata
        IF OLD.from_location IS DISTINCT FROM NEW.from_location THEN 
            diff_data := diff_data || jsonb_build_object('from', jsonb_build_object('old', OLD.from_location, 'new', NEW.from_location)); 
        END IF;
        IF OLD.to_location IS DISTINCT FROM NEW.to_location THEN 
            diff_data := diff_data || jsonb_build_object('to', jsonb_build_object('old', OLD.to_location, 'new', NEW.to_location)); 
        END IF;
        IF OLD.ta_amount IS DISTINCT FROM NEW.ta_amount THEN 
            diff_data := diff_data || jsonb_build_object('ta_amount', jsonb_build_object('old', OLD.ta_amount, 'new', NEW.ta_amount)); 
        END IF;
        IF OLD.notes IS DISTINCT FROM NEW.notes THEN 
            diff_data := diff_data || jsonb_build_object('notes', 'Content updated'); 
        END IF;
    END IF;

    -- Only insert audit if we have an action
    IF audit_action IS NOT NULL THEN
        INSERT INTO public.movement_audit (
            movement_id, 
            action, 
            old_status, 
            new_status, 
            changed_by, 
            notes, 
            metadata
        )
        VALUES (
            NEW.id, 
            audit_action, 
            old_status_val, 
            new_status_val, 
            auth.uid(), 
            audit_notes, 
            diff_data
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable unified trigger
CREATE TRIGGER on_movement_change
  AFTER INSERT OR UPDATE ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_movement_audit();
