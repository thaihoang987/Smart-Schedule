import { useEffect, useState } from "react";
import { api } from "../../services/api";
import type { HistoryEntry } from "../../types";
import { appLocale, storedText, tr } from "../../i18n";

function statusLabel(status: string): string {
  return ({ success: "✓", error: "✕", skipped_missed: tr("⚠ bỏ qua (lỡ giờ)", "⚠ skipped (missed)"), skipped_once: tr("⏭ bỏ qua (thủ công)", "⏭ skipped (manual)"), skipped_condition: tr("⚠ bỏ qua (điều kiện)", "⚠ skipped (condition)"), skipped_expired: tr("⚠ bỏ qua (hết khung)", "⚠ skipped (expired)"), verify_failed: tr("⚠ sai trạng thái", "⚠ state mismatch") } as Record<string, string>)[status] || status;
}

export function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [range, setRange] = useState<"today" | "7d" | "30d">("7d");

  useEffect(() => {
    api.listHistory(500).then(setEntries);
  }, []);

  const cutoff = { today: 1, "7d": 7, "30d": 30 }[range];
  const cutoffDate = new Date(Date.now() - cutoff * 86400000);
  const filtered = entries.filter((e) => new Date(e.executed_at) >= cutoffDate);

  return (
    <div className="page">
      <div className="chip-row">
        {(["today", "7d", "30d"] as const).map((r) => (
          <button key={r} className={range === r ? "chip chip--active" : "chip"} onClick={() => setRange(r)}>
            {{ today: tr("Hôm nay", "Today"), "7d": tr("7 ngày", "7 days"), "30d": tr("30 ngày", "30 days") }[r]}
          </button>
        ))}
      </div>
      <div className="history-list">
        {filtered.length === 0 && <div className="empty-hint">{tr("Chưa có lịch sử.", "No history yet.")}</div>}
        {filtered.map((e) => (
          <div key={e.id} className="history-row">
            <span className={`history-row__status history-row__status--${e.status}`}>{statusLabel(e.status)}</span>
            <div className="history-row__body">
              <div className="history-row__name">
                {storedText(e.schedule_name) || tr("(đã xóa)", "(deleted)")} {e.manual && <span className="badge">{tr("thủ công", "manual")}</span>}
              </div>
              <div className="history-row__time">{new Date(e.executed_at).toLocaleString(appLocale())}</div>
              {e.message && <div className="history-row__message">{storedText(e.message)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
