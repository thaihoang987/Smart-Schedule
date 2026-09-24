import { serverNow } from "../../utils/serverTime";
import { useEffect, useState } from "react";
import { tr } from "../../i18n";

function remainingLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function OnTimeProgress({ startAt, endAt }: { startAt: string; endAt: string }) {
  const [now, setNow] = useState(serverNow());

  useEffect(() => {
    const id = window.setInterval(() => setNow(serverNow()), 1000);
    return () => window.clearInterval(id);
  }, [startAt, endAt]);

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const duration = end - start;
  const remaining = end - now;
  if (!Number.isFinite(duration) || duration <= 0 || remaining <= 0) return null;
  const percent = Math.max(0, Math.min(100, ((now - start) / duration) * 100));

  return (
    <div className="on-time" aria-label={tr(`Thời gian bật còn ${remainingLabel(remaining)}`, `On time remaining ${remainingLabel(remaining)}`)}>
      <div className="on-time__labels">
        <span>{tr("Đang bật", "On")}</span>
        <span>{tr(`Còn ${remainingLabel(remaining)}`, `${remainingLabel(remaining)} remaining`)}</span>
      </div>
      <div className="on-time__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
        <div className="on-time__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
