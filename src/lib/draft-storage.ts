const DRAFT_KEY = "impress-blinds-draft-v1";

export function saveDraft<T>(draft: T): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private browsing, quota) — draft safety is best-effort.
  }
}

export function loadDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
