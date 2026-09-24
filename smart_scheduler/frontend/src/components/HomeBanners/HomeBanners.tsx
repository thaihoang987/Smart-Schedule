import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { EntitySummary, HistoryEntry, PresenceStatus, Schedule, Settings } from "../../types";
import { entityNames } from "../../utils/groupSchedules";
import { appLocale, storedText, tr } from "../../i18n";

/** Trang thai lich can nguoi dung de y (thong bao ngay trong add-on, v0.5.32
 * - khong gui ra ngoai HA). */
function alertLabel(status: string): string {
  return ({ error: tr("Lỗi khi chạy", "Execution error"), skipped_condition: tr("Bỏ qua vì điều kiện chưa đúng", "Skipped because conditions did not match"), skipped_missed: tr("Lỡ giờ chạy", "Missed run"), skipped_expired: tr("Bỏ qua vì đã hết khung giờ", "Skipped because the window expired"), verify_failed: tr("Thiết bị không đúng trạng thái sau khi chạy", "Device state did not match after execution") } as Record<string, string>)[status] || status;
}
const ALERT_STATUSES = new Set(["error", "skipped_condition", "skipped_missed", "skipped_expired", "verify_failed"]);

const SEEN_KEY = "smart-scheduler.alerts-seen-at";

function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeSeen(value: string) {
  try {
    localStorage.setItem(SEEN_KEY, value);
  } catch {
    /* trinh duyet chan storage - chi mat ghi nho "da xem" */
  }
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(appLocale(), { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

/** Cac bang thong bao dau trang Nha: dang tam dung lich, dang gia lap co
 * nguoi, va lich loi/bi bo qua gan day (tu Nhat ky, an sau khi bam "Đã xem"). */
export function HomeBanners({
  settings,
  schedules,
  entities,
  presence,
  reload,
}: {
  settings: Settings;
  /** Doi moi khi reload() (vd WebSocket schedule_executed) -> tai lai nhat ky. */
  schedules: Schedule[];
  entities: EntitySummary[];
  presence: PresenceStatus | null;
  reload: () => void;
}) {
  const [alerts, setAlerts] = useState<HistoryEntry[]>([]);
  const [seenAt, setSeenAt] = useState(readSeen);

  useEffect(() => {
    api
      .listHistory(50)
      .then((rows) => setAlerts(rows.filter((r) => ALERT_STATUSES.has(r.status))))
      .catch(() => setAlerts([]));
  }, [schedules]);

  const unseen = alerts.filter((a) => !seenAt || a.executed_at > seenAt);
  const pauseEnd = settings.pause_until ? new Date(settings.pause_until) : null;
  const paused = pauseEnd && pauseEnd.getTime() > Date.now();

  async function resume() {
    await api.updateSettings({ pause_until: "" });
    reload();
  }

  return (
    <>
      {paused && (
        <div className="home-banner home-banner--pause" role="status">
          <span className="home-banner__text">⏸ {tr("Đang tạm dừng mọi lịch đến", "All schedules paused until")} {formatWhen(pauseEnd!.toISOString())}</span>
          <button className="home-banner__btn" onClick={resume}>
            {tr("Tiếp tục", "Resume")}
          </button>
        </div>
      )}

      {presence?.active && (
        <div className="home-banner home-banner--presence" role="status">
          <span className="home-banner__text">
            🏠 {tr("Giả lập có người đang chạy", "Presence simulation is running")}
            {presence.on.length > 0
              ? ` · ${tr("đang bật", "on")}: ${entityNames(presence.on.map((o) => o.entity_id), entities)} ${tr("đến", "until")} ${formatWhen(presence.on[0].off_at).slice(0, 5)}`
              : presence.next_start_at
                ? ` · ${tr("bật tiếp lúc", "next activity at")} ~${formatWhen(presence.next_start_at).slice(0, 5)}`
                : ""}
          </span>
        </div>
      )}

      {unseen.length > 0 && (
        <div className="home-banner home-banner--alert" role="alert">
          <div className="home-banner__text">
            <strong>⚠ {unseen.length} {tr("lịch cần chú ý", "schedules need attention")}</strong>
            {unseen.slice(0, 3).map((a) => (
              <div key={a.id} className="home-banner__line">
                {storedText(a.schedule_name) || tr("(đã xoá)", "(deleted)")} — {alertLabel(a.status)} ({formatWhen(a.executed_at)})
                {(a.status === "error" || a.status === "verify_failed") && a.message ? `: ${storedText(a.message)}` : ""}
              </div>
            ))}
            {unseen.length > 3 && <div className="home-banner__line">… {tr("xem thêm trong Cài đặt → Nhật ký", "see more in Settings → Log")}</div>}
          </div>
          <button
            className="home-banner__btn"
            onClick={() => {
              const latest = unseen[0].executed_at;
              writeSeen(latest);
              setSeenAt(latest);
            }}
          >
            {tr("Đã xem", "Dismiss")}
          </button>
        </div>
      )}
    </>
  );
}
