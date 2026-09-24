import { api } from "../../services/api";
import type { EntitySummary, PresenceStatus, Settings } from "../../types";
import { entityNames } from "../../utils/groupSchedules";
import { appLocale, tr } from "../../i18n";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(appLocale(), { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

/** Cac bang thong bao dau trang Nha: dang tam dung lich, dang gia lap co
 * nguoi. Lich loi/bi bo qua CHI ghi o Cai dat -> Nhat ky, khong dua ra Nha
 * (phan hoi 2026-09-24, bo banner "lịch cần chú ý" co tu v0.5.32). */
export function HomeBanners({
  settings,
  entities,
  presence,
  reload,
}: {
  settings: Settings;
  entities: EntitySummary[];
  presence: PresenceStatus | null;
  reload: () => void;
}) {
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

    </>
  );
}
