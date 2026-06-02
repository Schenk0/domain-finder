import type { SearchResponse } from "@/app/types";

const DB_NAME = "domain-finder";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

export type StoredSession = {
  projectName: string;
  description: string;
  response: SearchResponse;
  starredDomains: string[];
  savedAt: number;
};

function sessionKey(projectName: string, description: string) {
  return `${projectName.trim().toLowerCase()}::${description.trim().toLowerCase()}`;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSession(session: StoredSession) {
  const key = sessionKey(session.projectName, session.description);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(session, key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Storage failures are non-critical
  }
}

export async function loadSession(
  projectName: string,
  description: string
): Promise<StoredSession | null> {
  const key = sessionKey(projectName, description);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    const result = await new Promise<StoredSession | null>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function clearSession(projectName: string, description: string) {
  const key = sessionKey(projectName, description);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Non-critical
  }
}
