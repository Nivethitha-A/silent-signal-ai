CREATE TABLE public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;

ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guardians" ON public.guardians FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add own guardians" ON public.guardians FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own guardians" ON public.guardians FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own guardians" ON public.guardians FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_guardians_user_id ON public.guardians(user_id);