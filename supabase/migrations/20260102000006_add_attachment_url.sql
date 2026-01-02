-- Add attachment_url to movements if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movements' AND column_name='attachment_url') THEN
        ALTER TABLE public.movements ADD COLUMN attachment_url TEXT;
    END IF;
END $$;
