import type { AppId } from './types';

export type Win = {
  id: number;
  app: AppId;
  title: string;
  path?: string;
  props: Record<string, unknown>;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  fullscreen: boolean;
};

export type OpenSpec = {
  app: AppId;
  title: string;
  path?: string;
  props?: Record<string, unknown>;
  w?: number;
  h?: number;
};

let nextId = 1;

function maxZ(state: Win[]): number {
  if (state.length === 0) return 0;
  return Math.max(...state.map((w) => w.z));
}

export function open(
  state: Win[],
  spec: OpenSpec,
  viewport: { vw: number; vh: number }
): Win[] {
  // Deduplicate by path: if a window with the same path already exists, focus+unminimize it
  if (spec.path !== undefined) {
    const existing = state.find((w) => w.path === spec.path);
    if (existing) {
      const newZ = maxZ(state) + 1;
      return state.map((w) =>
        w.id === existing.id ? { ...w, z: newZ, minimized: false } : w
      );
    }
  }

  const w = spec.w ?? 720;
  const h = spec.h ?? 480;
  const k = state.length;

  // Cascade: x = 80 + 32*k, y = 60 + 32*k, clamped to viewport
  const rawX = 80 + 32 * k;
  const rawY = 60 + 32 * k;
  const x = Math.min(Math.max(rawX, 0), viewport.vw - w);
  const y = Math.min(Math.max(rawY, 24), viewport.vh - h);

  const newWin: Win = {
    id: nextId++,
    app: spec.app,
    title: spec.title,
    path: spec.path,
    props: spec.props ?? {},
    x,
    y,
    w,
    h,
    z: maxZ(state) + 1,
    minimized: false,
    fullscreen: false,
  };

  return [...state, newWin];
}

export function close(state: Win[], id: number): Win[] {
  return state.filter((w) => w.id !== id);
}

export function focus(state: Win[], id: number): Win[] {
  const newZ = maxZ(state) + 1;
  return state.map((w) => (w.id === id ? { ...w, z: newZ } : w));
}

export function minimize(state: Win[], id: number): Win[] {
  return state.map((w) => (w.id === id ? { ...w, minimized: true } : w));
}

export function restore(state: Win[], id: number): Win[] {
  // Unminimize then focus
  const unminimized = state.map((w) =>
    w.id === id ? { ...w, minimized: false } : w
  );
  return focus(unminimized, id);
}

export function toggleFullscreen(state: Win[], id: number): Win[] {
  return state.map((w) =>
    w.id === id ? { ...w, fullscreen: !w.fullscreen } : w
  );
}

export function move(state: Win[], id: number, x: number, y: number): Win[] {
  return state.map((w) => (w.id === id ? { ...w, x, y } : w));
}

export function topWindow(state: Win[]): Win | null {
  const visible = state.filter((w) => !w.minimized);
  if (visible.length === 0) return null;
  return visible.reduce((top, w) => (w.z > top.z ? w : top));
}
