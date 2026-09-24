import { serverNow } from "../../utils/serverTime";
import { useEffect, useState } from "react";
import { tr } from "../../i18n";

function formatCountdown(target: Date, showSeconds: boolean): string {
  const diffMs = target.getTime() - serverNow();
  if (diffMs <= 0) return tr("Đã đến giờ", "Due now");
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return tr(`Còn ${hours} giờ ${minutes} phút`, `${hours} hr ${minutes} min remaining`);
  if (minutes > 0) return showSeconds ? tr(`Còn ${minutes} phút ${seconds} giây`, `${minutes} min ${seconds} sec remaining`) : tr(`Còn ${minutes} phút`, `${minutes} min remaining`);
  return tr(`Còn ${seconds} giây`, `${seconds} sec remaining`);
}

/** Chi component nay tu re-render moi giay (muc 68 SPEC.md: khong render
 * lai toan bo list). */
export function Countdown({ nextRun, showSeconds = false }: { nextRun: string | null; showSeconds?: boolean }) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (!nextRun) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [nextRun]);

  if (!nextRun) return <span className="countdown countdown--none">{tr("Chưa có lần chạy", "No upcoming run")}</span>;
  return <span className="countdown">{formatCountdown(new Date(nextRun), showSeconds)}</span>;
}
