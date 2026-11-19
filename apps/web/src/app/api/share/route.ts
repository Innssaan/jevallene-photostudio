import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface StoredShare {
  buffer: Buffer;
  mime: string;
  filename: string;
  expiresAt: number;
}

const SHARE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_STORED = 50;
const CLOUD_BUCKET = "photostudio-renders";

const globalStore = globalThis as unknown as {
  __psShareStore?: Map<string, StoredShare>;
};

function getStore(): Map<string, StoredShare> {
  if (!globalStore.__psShareStore) {
    globalStore.__psShareStore = new Map();
  }
  const now = Date.now();
  for (const [key, entry] of globalStore.__psShareStore.entries()) {
    if (entry.expiresAt <= now) {
      globalStore.__psShareStore.delete(key);
    }
  }
  return globalStore.__psShareStore;
}

function getAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { dataUrl?: string; title?: string };
    const dataUrl = body.dataUrl;
    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json({ error: "Missing dataUrl" }, { status: 400 });
    }

    const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image dataUrl" }, { status: 400 });
    }

    const mime = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const ext =
      mime === "image/jpeg"
        ? "jpg"
        : mime === "image/webp"
          ? "webp"
          : mime === "image/gif"
            ? "gif"
            : "png";
    const safeTitle =
      (body.title || "jevallene-photo")
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || "jevallene-photo";

    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    // Upload to Supabase Storage so QR links work reliably across all serverless instances
    const supabase = getAnonSupabase();
    if (supabase) {
      const storagePath = `shares/${id}-${safeTitle}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(CLOUD_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: false,
        });

      if (!uploadErr) {
        const { data: pubData } = supabase.storage
          .from(CLOUD_BUCKET)
          .getPublicUrl(storagePath);
        if (pubData?.publicUrl) {
          return NextResponse.json({ id, url: pubData.publicUrl, storagePath });
        }
      }
    }

    // Fallback in-memory store (local dev when Supabase isn't configured)
    const store = getStore();
    while (store.size >= MAX_STORED) {
      const oldestKey = store.keys().next().value;
      if (!oldestKey) break;
      store.delete(oldestKey);
    }

    store.set(id, {
      buffer,
      mime,
      filename: `${safeTitle}.${ext}`,
      expiresAt: Date.now() + SHARE_TTL_MS,
    });

    return NextResponse.json({ id, url: `/api/share?id=${encodeURIComponent(id)}` });
  } catch {
    return NextResponse.json({ error: "Failed to store share image" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const store = getStore();
  const entry = store.get(id);
  if (!entry) {
    return NextResponse.json({ error: "Share link expired or not found" }, { status: 404 });
  }

  const download = req.nextUrl.searchParams.get("download") === "1";
  return new NextResponse(new Uint8Array(entry.buffer), {
    status: 200,
    headers: {
      "Content-Type": entry.mime,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${entry.filename}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
