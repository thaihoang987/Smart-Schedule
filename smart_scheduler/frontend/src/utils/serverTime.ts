let anchor: { unixMs: number; monotonicMs: number } | null = null;

export function serverNow(): number {
  return anchor ? anchor.unixMs + performance.now() - anchor.monotonicMs : Date.now();
}

export function isTimeSynced(): boolean { return anchor !== null; }

export async function syncServerTime(): Promise<void> {
  const start = performance.now();
  const response = await fetch("api/time", { cache: "no-store", signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(tr("Không đọc được giờ máy chủ", "Could not read server time"));
  const data = await response.json();
  const end = performance.now();
  if (!Number.isFinite(data.unix_ms)) throw new Error(tr("Giờ máy chủ không hợp lệ", "Invalid server time"));
  // Approximate one-way latency, then advance using a monotonic clock.
  anchor = { unixMs: data.unix_ms + (end - start) / 2, monotonicMs: end };
}
import { tr } from "../i18n";
