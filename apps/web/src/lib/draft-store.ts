/**
 * Lightweight IndexedDB persistence for the active Editor draft AND Album projects
 * so large photos survive tab switches, refreshes, and saving without hitting
 * localStorage's 5MB limit.
 */

const DB_NAME = "jevallene-photostudio-db";
const DB_VERSION = 2;
const DRAFT_STORE = "drafts";
const PROJECTS_STORE = "projects";
const DRAFT_KEY = "editor-active-draft";
const PROJECTS_KEY = "album-projects-list";

function openStudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE);
      }
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open error"));
  });
}

export async function saveEditorDraft<T>(draft: T): Promise<void> {
  try {
    const db = await openStudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(DRAFT_STORE, "readwrite");
      tx.objectStore(DRAFT_STORE).put(draft, DRAFT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Draft write failed"));
    });
    db.close();
  } catch {
    try {
      window.localStorage.setItem("ps-editor-draft-v1", JSON.stringify(draft));
    } catch {
      // ignore fallback quota error
    }
  }
}

export async function loadEditorDraft<T>(): Promise<T | null> {
  try {
    const db = await openStudioDb();
    const res = await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(DRAFT_STORE, "readonly");
      const req = tx.objectStore(DRAFT_STORE).get(DRAFT_KEY);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => reject(req.error || new Error("Draft read failed"));
    });
    db.close();
    if (res) return res;
  } catch {
    // fallback to localStorage
  }

  try {
    const raw = window.localStorage.getItem("ps-editor-draft-v1");
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveProjectsToIdb<T>(projects: T[]): Promise<void> {
  try {
    const db = await openStudioDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, "readwrite");
      tx.objectStore(PROJECTS_STORE).put(projects, PROJECTS_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Projects write failed"));
    });
    db.close();
  } catch {
    // ignore
  }
}

export async function loadProjectsFromIdb<T>(): Promise<T[]> {
  try {
    const db = await openStudioDb();
    const res = await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, "readonly");
      const req = tx.objectStore(PROJECTS_STORE).get(PROJECTS_KEY);
      req.onsuccess = () => resolve((req.result as T[] | undefined) ?? []);
      req.onerror = () => reject(req.error || new Error("Projects read failed"));
    });
    db.close();
    return res;
  } catch {
    return [];
  }
}

export async function clearEditorDraft(): Promise<void> {
  try {
    window.localStorage.removeItem("ps-editor-draft-v1");
  } catch {
    // ignore
  }
  try {
    const db = await openStudioDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(DRAFT_STORE, "readwrite");
      tx.objectStore(DRAFT_STORE).delete(DRAFT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }
}

export async function clearStudioIdb(): Promise<void> {
  try {
    window.localStorage.removeItem("ps-editor-draft-v1");
  } catch {
    // ignore
  }
  try {
    const db = await openStudioDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction([DRAFT_STORE, PROJECTS_STORE], "readwrite");
      tx.objectStore(DRAFT_STORE).clear();
      tx.objectStore(PROJECTS_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // ignore
  }
}
