
-- Create group_views table to track which participants have viewed the group
CREATE TABLE public.group_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.group(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, participant_id)
);

-- Enable RLS on group_views table
ALTER TABLE public.group_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for group_views (public access for now since no auth is implemented)
CREATE POLICY "Allow all operations on group_views" ON public.group_views
FOR ALL USING (true) WITH CHECK (true);
