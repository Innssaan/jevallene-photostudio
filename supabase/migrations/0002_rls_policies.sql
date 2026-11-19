-- PhotoStudio Row Level Security (RLS) Policies
-- Principle: Private by Default, Ownership Isolation, Explicit Share Token Verification

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all 17 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_superadmin());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin roles
CREATE POLICY "Superadmin manages roles" ON public.admin_roles
  FOR ALL USING (public.is_superadmin());
CREATE POLICY "Users read own role" ON public.admin_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Categories & Published Templates (readable by guest & users)
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (TRUE);
CREATE POLICY "Superadmin manages categories" ON public.categories
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Public read public assets" ON public.assets
  FOR SELECT USING (is_public = TRUE OR public.is_superadmin());
CREATE POLICY "Superadmin manages assets" ON public.assets
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Public read published templates" ON public.templates
  FOR SELECT USING (status = 'published' OR public.is_superadmin());
CREATE POLICY "Superadmin manages templates" ON public.templates
  FOR ALL USING (public.is_superadmin());

CREATE POLICY "Public read published template versions" ON public.template_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.templates t
      WHERE t.id = template_id AND (t.status = 'published' OR public.is_superadmin())
    )
  );
CREATE POLICY "Superadmin manages template versions" ON public.template_versions
  FOR ALL USING (public.is_superadmin());

-- User-owned tables (strict ownership isolation)
CREATE POLICY "Users own sessions" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own camera_settings" ON public.camera_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own project_photos" ON public.project_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own albums" ON public.albums
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own gallery_items" ON public.gallery_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own exports" ON public.exports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own share_links" ON public.share_links
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own timeline" ON public.timeline
  FOR ALL USING (auth.uid() = user_id);

-- Audit logs (superadmin only)
CREATE POLICY "Superadmin reads audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_superadmin());
CREATE POLICY "Superadmin inserts audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_superadmin());

-- Secure RPC to verify a QR share token without exposing share_links table
CREATE OR REPLACE FUNCTION public.verify_share_link(p_token TEXT)
RETURNS TABLE (
  gallery_item_id UUID,
  title TEXT,
  storage_path TEXT,
  mime_type TEXT,
  can_view BOOLEAN,
  can_download BOOLEAN,
  visibility TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.title,
    g.storage_path,
    g.mime_type,
    s.can_view,
    s.can_download,
    s.visibility
  FROM public.share_links s
  JOIN public.gallery_items g ON g.id = s.gallery_item_id
  WHERE s.token = p_token
    AND s.revoked_at IS NULL
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
    AND (
      s.visibility IN ('unlisted', 'public')
      OR (s.visibility = 'private' AND auth.uid() = s.owner_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
