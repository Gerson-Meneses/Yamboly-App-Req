import type { Catalogos, Registro, Apertura } from '../types';
import { seedCatalogos } from '../data/seed';

const CATALOGOS_KEY = 'krq.catalogos.v1';
const REGISTROS_KEY = 'krq.registros.v1';
const APERTURAS_KEY = 'krq.aperturas.v1';
const THEME_KEY = 'krq.theme.v1';

export function loadCatalogos(): Catalogos {
  try {
    const raw = localStorage.getItem(CATALOGOS_KEY);
    if (raw) return JSON.parse(raw) as Catalogos;
  } catch {
    // ignore corrupt data
  }
  const seeded = seedCatalogos();
  saveCatalogos(seeded);
  return seeded;
}

export function saveCatalogos(catalogos: Catalogos) {
  localStorage.setItem(CATALOGOS_KEY, JSON.stringify(catalogos));
}

export function loadRegistros(): Registro[] {
  try {
    const raw = localStorage.getItem(REGISTROS_KEY);
    if (raw) return JSON.parse(raw) as Registro[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

export function saveRegistros(registros: Registro[]) {
  localStorage.setItem(REGISTROS_KEY, JSON.stringify(registros));
}

export function loadAperturas(): Apertura[] {
  try {
    const raw = localStorage.getItem(APERTURAS_KEY);
    if (raw) return JSON.parse(raw) as Apertura[];
  } catch {
    // ignore corrupt data
  }
  return [];
}

export function saveAperturas(aperturas: Apertura[]) {
  localStorage.setItem(APERTURAS_KEY, JSON.stringify(aperturas));
}

export function loadTheme(): 'light' | 'dark' {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: 'light' | 'dark') {
  localStorage.setItem(THEME_KEY, theme);
}

export function clearAllData() {
  localStorage.removeItem(CATALOGOS_KEY);
  localStorage.removeItem(REGISTROS_KEY);
  localStorage.removeItem(APERTURAS_KEY);
}
