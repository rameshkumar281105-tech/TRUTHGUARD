DROP POLICY IF EXISTS "Public can delete analyses" ON public.analyses;
DROP POLICY IF EXISTS "Public can create analyses" ON public.analyses;
REVOKE INSERT, UPDATE, DELETE ON public.analyses FROM anon, authenticated;
GRANT SELECT ON public.analyses TO anon, authenticated;
GRANT ALL ON public.analyses TO service_role;