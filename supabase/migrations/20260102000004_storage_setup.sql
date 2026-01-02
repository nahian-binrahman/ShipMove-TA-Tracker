-- Create a bucket for movement attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('movement-attachments', 'movement-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Attachments are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'movement-attachments');

CREATE POLICY "Authenticated users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'movement-attachments' 
    AND auth.role() = 'authenticated'
  );
