import type { FilterPreset, TemplateDocument } from "@photostudio/shared-types";
import type { ColorAdjustments } from "./template-renderer";
import { clearStudioIdb, loadProjectsFromIdb, saveProjectsToIdb } from "./draft-store";

export interface LocalProject {
  id: string;
  title: string;
  templateId: string;
  document: TemplateDocument;
  slotImages: (string | null)[];
  filter: FilterPreset;
  adjustments?: ColorAdjustments;
  caption: string;
  thumbnailDataUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalTimelineEntry {
  id: string;
  eventType: "session" | "created" | "downloaded" | "template_used";
  title: string;
  templateId?: string;
  thumbnailDataUrl?: string;
  createdAt: string;
}

const FAVORITES_KEY = "ps-favorites";
const PROJECTS_KEY = "ps-local-projects";
const TIMELINE_KEY = "ps-local-timeline";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getFavoriteTemplateIds(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteTemplateId(id: string): string[] {
  const current = getFavoriteTemplateIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }
  return next;
}

export function getLocalProjects(): LocalProject[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as LocalProject[]) : [];
  } catch {
    return [];
  }
}

export function getLocalProjectById(id: string): LocalProject | undefined {
  return getLocalProjects().find((p) => p.id === id);
}

export function deleteLocalProject(id: string): void {
  if (!isBrowser()) return;
  const next = getLocalProjects().filter((p) => p.id !== id);
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  void loadProjectsFromIdb<LocalProject>().then((idbList) =>
    saveProjectsToIdb(idbList.filter((p) => p.id !== id))
  );
}

export async function getAllLocalProjectsAsync(): Promise<LocalProject[]> {
  if (!isBrowser()) return [];
  const lsList = getLocalProjects();
  const idbList = await loadProjectsFromIdb<LocalProject>();
  const map = new Map<string, LocalProject>();
  for (const item of [...idbList, ...lsList]) {
    const prev = map.get(item.id);
    if (!prev || new Date(item.updatedAt).getTime() >= new Date(prev.updatedAt).getTime()) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function deleteLocalProjectAsync(id: string): Promise<LocalProject[]> {
  if (!isBrowser()) return [];
  const all = (await getAllLocalProjectsAsync()).filter((p) => p.id !== id);
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(all.slice(0, 12)));
  } catch {
    // ignore
  }
  await saveProjectsToIdb(all);
  return all;
}

export function clearLocalTimeline(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TIMELINE_KEY);
}

export function clearAllLocalData(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(FAVORITES_KEY);
  window.localStorage.removeItem(PROJECTS_KEY);
  window.localStorage.removeItem(TIMELINE_KEY);
  window.localStorage.removeItem("ps-editor-draft-v1");
  void clearStudioIdb();
}

export function saveLocalProject(project: LocalProject): boolean {
  if (!isBrowser()) return false;
  const existing = getLocalProjects().filter((p) => p.id !== project.id);
  // Keep the 12 most recent local projects in localStorage and up to 40 in IndexedDB
  const next = [project, ...existing].slice(0, 12);

  void loadProjectsFromIdb<LocalProject>().then((idbList) => {
    const merged = [project, ...idbList.filter((p) => p.id !== project.id)].slice(0, 40);
    return saveProjectsToIdb(merged);
  });

  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next));
    return true;
  } catch {
    // Retry keeping fewer items if quota exceeded
    try {
      window.localStorage.setItem(PROJECTS_KEY, JSON.stringify([project, ...existing].slice(0, 4)));
      return true;
    } catch {
      try {
        window.localStorage.setItem(PROJECTS_KEY, JSON.stringify([project]));
        return true;
      } catch {
        return false;
      }
    }
  }
}

export function getLocalTimeline(): LocalTimelineEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(TIMELINE_KEY);
    return raw ? (JSON.parse(raw) as LocalTimelineEntry[]) : [];
  } catch {
    return [];
  }
}

export function addLocalTimelineEntry(entry: Omit<LocalTimelineEntry, "id" | "createdAt">): void {
  if (!isBrowser()) return;
  const current = getLocalTimeline();
  const next: LocalTimelineEntry[] = [
    {
      ...entry,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, 50);

  try {
    window.localStorage.setItem(TIMELINE_KEY, JSON.stringify(next));
  } catch {
    // Strip thumbnails from older entries if quota is tight so the latest entry always saves
    try {
      const compact = next.slice(0, 20).map((item, idx) =>
        idx < 5 ? item : { ...item, thumbnailDataUrl: undefined }
      );
      window.localStorage.setItem(TIMELINE_KEY, JSON.stringify(compact));
    } catch {
      try {
        window.localStorage.setItem(
          TIMELINE_KEY,
          JSON.stringify(next.slice(0, 10).map((item) => ({ ...item, thumbnailDataUrl: undefined })))
        );
      } catch {
        // Ignore storage quota errors
      }
    }
  }
}
