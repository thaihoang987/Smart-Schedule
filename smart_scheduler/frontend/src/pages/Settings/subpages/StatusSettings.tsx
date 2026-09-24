import type { DeviceGroup, HealthStatus, Schedule } from "../../../types";
import { SubpageHeader } from "../SubpageHeader";
import { tr } from "../../../i18n";

export function StatusSettings({
  schedules,
  groups,
  haConnected,
  haConnectionMode,
  onBack,
}: {
  schedules: Schedule[];
  groups: DeviceGroup[];
  haConnected: boolean;
  haConnectionMode: HealthStatus["ha_connection_mode"];
  onBack: () => void;
}) {
  const nextSoon = schedules
    .filter((s) => s.enabled && !s.skip_once && s.next_run)
    .sort((a, b) => (a.next_run! < b.next_run! ? -1 : 1))[0];

  return (
    <div className="page">
      <SubpageHeader title={tr("Trạng thái", "Status")} onBack={onBack} />

      <div className="settings-section">
        <label className="settings-row">
          <span>Scheduler</span>
          <span className="status-text status-text--on">● {tr("Đang hoạt động", "Running")}</span>
        </label>
        <label className="settings-row">
          <span>Home Assistant</span>
          <span className={`status-text ${haConnected ? "status-text--on" : "status-text--off"}`}>
            {haConnected ? tr("● Đã kết nối", "● Connected") : tr("⚠ Chưa kết nối được", "⚠ Not connected")}
          </span>
        </label>
        <label className="settings-row">
          <span>{tr("Kết nối", "Connection")}</span>
          <span className="status-text">
            {haConnectionMode === "supervisor_proxy"
              ? tr("Supervisor nội bộ", "Internal Supervisor")
              : haConnectionMode === "direct_core_fallback"
                ? tr("Core API dự phòng", "Core API fallback")
                : tr("Chưa có thông tin", "Unavailable")}
          </span>
        </label>
        <label className="settings-row">
          <span>{tr("Thiết bị", "Devices")}</span>
          <span>{groups.length}</span>
        </label>
        <label className="settings-row">
          <span>{tr("Lịch", "Schedules")}</span>
          <span>{schedules.length}</span>
        </label>
        <label className="settings-row">
          <span>{tr("Lần chạy tiếp theo", "Next run")}</span>
          <span>{nextSoon ? `${nextSoon.time} · ${nextSoon.name}` : "—"}</span>
        </label>
      </div>
    </div>
  );
}
