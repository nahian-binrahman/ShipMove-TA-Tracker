-- Add rank and organization to profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='rank') THEN
        ALTER TABLE public.profiles ADD COLUMN rank TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organization') THEN
        ALTER TABLE public.profiles ADD COLUMN organization TEXT DEFAULT 'Bangladesh Navy';
    END IF;
END $$;
