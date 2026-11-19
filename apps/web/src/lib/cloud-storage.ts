"use client";

import { getSupabaseClient } from "@/lib/auth";

export const CLOUD_BUCKET = "photostudio-renders";
export const CLOUD_QUOTA_BYTES = 100 * 1024 * 1024; // 100 MB per user
export const CLOUD_UPDATED_EVENT = "ps-cloud-updated";

export interface CloudRenderItem {
  id: string;
  user_id: string;
  title: string;
  source: "photobox" | "editor";
  storage_path: string;
  public_url: string;
  bytes: number;
  created_at: string;
}

export interface CloudUsageStats {
  usedBytes: number;
  quotaBytes: number;
  percentage: number;
  count: number;
}

export function formatCloudBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function notifyCloudUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CLOUD_UPDATED_EVENT));
  }
}

export async function listCloudRenders(): Promise<CloudRenderItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return [];

  const { data, error } = await supabase
    .from("cloud_renders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CloudRenderItem[];
}

export async function getCloudUsage(): Promise<CloudUsageStats> {
  const items = await listCloudRenders();
  const usedBytes = items.reduce((sum, item) => sum + Number(item.bytes || 0), 0);
  const percentage = Math.min(100, Number(((usedBytes / CLOUD_QUOTA_BYTES) * 100).toFixed(1)));
  return {
    usedBytes,
    quotaBytes: CLOUD_QUOTA_BYTES,
    percentage,
    count: items.length,
  };
}

export async function uploadRenderToCloud(params: {
  title: string;
  source: "photobox" | "editor";
  dataUrl: string;
}): Promise<{ item?: CloudRenderItem; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase belum dikonfigurasi." };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    return { error: "Silakan masuk (Sign In) terlebih dahulu untuk menyimpan ke Cloud." };
  }

  const blob = dataUrlToBlob(params.dataUrl);
  const usage = await getCloudUsage();
  if (usage.usedBytes + blob.size > CLOUD_QUOTA_BYTES) {
    return { error: "Kuota Cloud 100 MB sudah penuh. Hapus beberapa file lama terlebih dahulu." };
  }

  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext =
    blob.type === "image/gif"
      ? "gif"
      : blob.type === "image/jpeg"
        ? "jpg"
        : blob.type === "image/webp"
          ? "webp"
          : "png";
  const storagePath = `${user.id}/${Date.now()}-${uniqueId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CLOUD_BUCKET)
    .upload(storagePath, blob, {
      contentType: blob.type || "image/png",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from(CLOUD_BUCKET).getPublicUrl(storagePath);

  const { data: inserted, error: insertError } = await supabase
    .from("cloud_renders")
    .insert({
      user_id: user.id,
      title: params.title || "PhotoStudio Render",
      source: params.source,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      bytes: blob.size,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(CLOUD_BUCKET).remove([storagePath]);
    return { error: insertError.message };
  }

  notifyCloudUpdated();
  return { item: inserted as CloudRenderItem };
}

export async function deleteCloudRender(item: CloudRenderItem): Promise<{ error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Supabase belum dikonfigurasi." };

  const { error: storageErr } = await supabase.storage
    .from(CLOUD_BUCKET)
    .remove([item.storage_path]);
  if (storageErr) {
    return { error: storageErr.message };
  }

  const { error: dbErr } = await supabase.from("cloud_renders").delete().eq("id", item.id);
  if (dbErr) {
    return { error: dbErr.message };
  }

  notifyCloudUpdated();
  return {};
}
