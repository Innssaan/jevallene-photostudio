import type { TemplateCategory, TemplateDocument, TemplateTheme } from "./template.js";

export type AppLocale = "id" | "en";
export type ThemeMode = "light" | "dark" | "system";
export type UserRole = "guest" | "user" | "superadmin";
export type Visibility = "private" | "unlisted" | "public";
export type SyncStatus = "local_only" | "pending_sync" | "synced" | "conflict";

export type SupportedFormat = "jpg" | "jpeg" | "png" | "webp" | "heic" | "mp4" | "pdf";
export type ExportResolution = "standard" | "high" | "original";

export interface ProfileRecord {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_locale: AppLocale;
  preferred_theme: ThemeMode;
  cloud_quota_bytes: number;
  cloud_used_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  slug: string;
  name_id: string;
  name_en: string;
  kind: "category" | "theme";
  sort_order: number;
  created_at: string;
}

export interface AssetRecord {
  id: string;
  kind: "image" | "font" | "sticker" | "frame" | "background" | "video";
  name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  license_name: string;
  license_source: string;
  commercial_allowed: boolean;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TemplateRecord {
  id: string;
  slug: string;
  title_id: string;
  title_en: string;
  category: TemplateCategory;
  theme: TemplateTheme;
  status: "draft" | "scheduled" | "published" | "archived";
  current_version: number;
  thumbnail_path: string | null;
  popularity_score: number;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersionRecord {
  id: string;
  template_id: string;
  version: number;
  document: TemplateDocument;
  created_by: string | null;
  created_at: string;
}

export interface ProjectRecord {
  id: string;
  user_id: string | null;
  template_id: string | null;
  title: string;
  mode: "template" | "free_edit";
  editor_state: Record<string, unknown>;
  version: number;
  sync_status: SyncStatus;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
}

export interface ShareLinkRecord {
  id: string;
  owner_id: string;
  gallery_item_id: string;
  token: string;
  visibility: Visibility;
  can_view: boolean;
  can_download: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface TimelineRecord {
  id: string;
  user_id: string;
  event_type: "created" | "edited" | "downloaded" | "template_used" | "session";
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
