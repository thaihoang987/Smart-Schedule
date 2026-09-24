/** Hien thi "HH:MM:SS" (luu 24h trong DB) theo tuy chon 24h/12h cua nguoi dung
 * (Cai dat -> Giao dien -> Dinh dang gio). Wheel picker chinh sua VAN giu
 * 24h de tranh phuc tap them AM/PM vao logic cuon (da vua sua 1 bug wheel
 * picker nghiem trong, tranh dong tiep vao do ngay sau). */
export function formatTimeDisplay(time: string, format: "24h" | "12h"): string {
  const [hStr = "00", mStr = "00", sStr = "00"] = time.split(":");
  if (format === "24h") return `${hStr}:${mStr}:${sStr}`;
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "CH" : "SA"; // Chieu / Sang
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr}:${sStr} ${period}`;
}
