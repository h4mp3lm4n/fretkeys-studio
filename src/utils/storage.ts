// Centralized localStorage User Preset Store for FretKeys Studio

export interface SavedPreset<T> {
  id: string;
  name: string;
  createdAt: string;
  data: T;
}

export function loadUserPresets<T>(storageKey: string): SavedPreset<T>[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedPreset<T>[]) : [];
  } catch {
    return [];
  }
}

export function saveUserPreset<T>(storageKey: string, name: string, data: T): SavedPreset<T>[] {
  const existing = loadUserPresets<T>(storageKey);
  const trimmed = name.trim() || `Preset ${existing.length + 1}`;
  const entry: SavedPreset<T> = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    data,
  };
  const next = [entry, ...existing];
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
  return next;
}

export function deleteUserPreset<T>(storageKey: string, id: string): SavedPreset<T>[] {
  const next = loadUserPresets<T>(storageKey).filter(p => p.id !== id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
  return next;
}

export const PRESET_KEYS = {
  FRETBOARD_LAYERS: 'fk_presets_fretboard_v1',
  PROGRESSIONS: 'fk_presets_progressions_v1',
  DRUM_GROOVES: 'fk_presets_drums_v1',
} as const;
