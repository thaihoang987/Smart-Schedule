import { useSyncExternalStore } from "react";

/** Toan bo ~7000 icon MDI (dung ten "mdi:..." giong Home Assistant) - phan
 * hoi 2026-09-24 "cho thêm 1 ô để copy icon tuỳ ý vào". Nap LUOI bang
 * dynamic import() thanh 1 chunk rieng, chi tai khi co icon nao ngoai
 * ICON_CHOICES can hien (hoac nguoi dung go vao o nhap), nen lan mo app binh
 * thuong khong nang them. */
let all: Record<string, string> | null = null;
let loading: Promise<void> | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function loadAllMdi(): Promise<void> {
  if (!loading) {
    // Duong dan commonjs RIENG (khong phai "@mdi/js"): "@mdi/js" da duoc
    // import tinh o nhieu noi, Rollup se gop ca 7000 icon vao bundle chinh
    // neu dynamic import cung module do - khac file thi moi tach chunk.
    loading = import("@mdi/js/commonjs/mdi.js")
      .then((mod) => {
        all = ((mod as { default?: unknown }).default ?? mod) as Record<string, string>;
        version++;
        listeners.forEach((l) => l());
      })
      .catch(() => {
        loading = null; // cho thu lai lan sau (vd mat mang qua Ingress)
      });
  }
  return loading;
}

/** "mdi:water-pump" / "hass:water-pump" / "water-pump" -> "mdi:water-pump". */
export function normalizeIconKey(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s) return "";
  const name = s.replace(/^(mdi|hass):/, "");
  return `mdi:${name}`;
}

/** Path SVG cho key "mdi:..."; undefined neu chua nap xong hoac khong ton tai.
 * Goi ham nay se tu kich hoat nap thu vien day du lan dau. */
export function lookupMdi(key: string): string | undefined {
  const m = /^(?:mdi|hass):([a-z0-9-]+)$/.exec(key);
  if (!m) return undefined;
  if (!all) {
    void loadAllMdi();
    return undefined;
  }
  const exportName = "mdi" + m[1].split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  return all[exportName];
}

export function isMdiLoaded(): boolean {
  return all !== null;
}

/** Component nao dung visualFor() goi hook nay de tu render lai khi thu vien
 * icon day du nap xong (luc dau tam hien icon mac dinh). */
export function useMdiIcons(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => version,
  );
}
