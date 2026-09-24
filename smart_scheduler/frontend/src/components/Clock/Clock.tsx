import { useEffect, useState } from "react";
import { formatTimeDisplay } from "../../utils/formatTime";
import { isTimeSynced, serverNow, syncServerTime } from "../../utils/serverTime";
import { tr } from "../../i18n";

export function Clock({ timeFormat, timezone }: { timeFormat: "24h" | "12h"; timezone: string }) {
  const [now, setNow] = useState(serverNow);
  const [available, setAvailable] = useState(isTimeSynced);
  useEffect(() => {
    let live = true;
    let syncing = false;
    async function sync() {
      if (syncing) return;
      syncing = true;
      try { await syncServerTime(); if (live) { setAvailable(true); setNow(serverNow()); } }
      catch { if (live) setAvailable(false); }
      finally { syncing = false; }
    }
    void sync();
    const ticker = window.setInterval(() => setNow(serverNow()), 250);
    const refresh = window.setInterval(() => void sync(), 30000);
    const visible = () => { if (!document.hidden) void sync(); };
    document.addEventListener("visibilitychange", visible);
    return () => { live = false; clearInterval(ticker); clearInterval(refresh); document.removeEventListener("visibilitychange", visible); };
  }, []);
  if (!available) return <span className="home-clock">{tr("Chưa đồng bộ giờ HA", "HA time not synced")}</span>;
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(now);
  return <span className="home-clock" title={tr("Đồng bộ với giờ backend lập lịch", "Synced with scheduler backend time")}>{formatTimeDisplay(time, timeFormat)}</span>;
}
