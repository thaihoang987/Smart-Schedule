/** Danh sach mui gio cho o chon trong Cai dat -> Scheduler (phan hoi
 * 2026-09-24 "chọn timezone theo list +00..."). Lay tu trinh duyet
 * (Intl.supportedValuesOf) - day la ten IANA hop le ma backend (zoneinfo)
 * hieu duoc; trinh duyet cu khong ho tro thi dung danh sach du phong. */
const FALLBACK_ZONES = [
  "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles", "America/Denver", "America/Chicago",
  "America/New_York", "America/Sao_Paulo", "UTC", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Europe/Moscow", "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok",
  "Asia/Ho_Chi_Minh", "Asia/Jakarta", "Asia/Singapore", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei",
  "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney", "Pacific/Auckland",
];

export interface TimezoneOption {
  zone: string;
  offsetMinutes: number;
  label: string; // "UTC+07:00 · Asia/Ho_Chi_Minh"
}

/** Do lech so voi UTC TAI THOI DIEM `at` (co tinh gio mua he). */
function offsetMinutesOf(zone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

let cache: TimezoneOption[] | null = null;

export function timezoneOptions(): TimezoneOption[] {
  if (cache) return cache;
  const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
  let zones: string[] = FALLBACK_ZONES;
  try {
    if (supported) zones = supported("timeZone");
  } catch {
    /* dung danh sach du phong */
  }
  // Gop them danh sach du phong: nhieu trinh duyet chi liet ke ten cu
  // (vd "Asia/Saigon") ma bo qua "Asia/Ho_Chi_Minh" - ca 2 deu hop le.
  zones = [...new Set([...zones, ...FALLBACK_ZONES])];
  const now = new Date();
  const options: TimezoneOption[] = [];
  for (const zone of zones) {
    try {
      const offsetMinutes = offsetMinutesOf(zone, now);
      options.push({ zone, offsetMinutes, label: `${formatOffset(offsetMinutes)} · ${zone.replace(/_/g, " ")}` });
    } catch {
      /* bo qua ten trinh duyet khong nhan */
    }
  }
  cache = options.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.zone.localeCompare(b.zone));
  return cache;
}
