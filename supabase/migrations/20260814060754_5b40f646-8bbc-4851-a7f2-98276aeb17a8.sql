CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL,
  content text NOT NULL DEFAULT '',
  source_url text,
  source_name text,
  publication_date date,
  image_path text,
  prediction text NOT NULL CHECK (prediction IN ('REAL','FAKE','UNCERTAIN')),
  confidence numeric NOT NULL DEFAULT 0,
  risk_score numeric NOT NULL DEFAULT 0,
  text_score numeric,
  image_score numeric,
  evidence_score numeric,
  source_score numeric,
  explanation text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_mode text NOT NULL DEFAULT 'full',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.analyses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Public can create analyses" ON public.analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete analyses" ON public.analyses FOR DELETE USING (true);

CREATE INDEX analyses_created_at_idx ON public.analyses (created_at DESC);