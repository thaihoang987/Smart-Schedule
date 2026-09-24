import type { FanAttrs } from "../../types";
import { tr } from "../../i18n";

/** Chon toc do % hoac che do dung san (preset_mode) cho hanh dong "Dat toc
 * do" (fan_set) - CHI 1 trong 2 co hieu luc tai 1 thoi diem, giong hanh vi
 * thuc te cua quat (dang preset "Ngu"/"Turbo" thi khong con la % tho nua). */
export function FanActionEditor({
  fan,
  percentage,
  presetMode,
  onChange,
}: {
  fan: FanAttrs | null;
  percentage: number | null;
  presetMode: string | null;
  onChange: (percentage: number | null, presetMode: string | null) => void;
}) {
  const presets = fan?.preset_modes ?? [];
  const pct = percentage ?? 50;

  return (
    <div className="climate-action">
      <label className="field-label">{tr("Tốc độ", "Speed")}</label>
      <input type="range" className="light-range" min={0} max={100} step={10} value={presetMode ? 0 : pct} onChange={(e) => onChange(Number(e.target.value), null)} />
      <div className="light-range__labels">
        <span>{tr("Tắt", "Off")}</span>
        <span className="light-range__current">{presetMode ? "—" : `${pct}%`}</span>
        <span>{tr("Mạnh", "High")}</span>
      </div>

      {presets.length > 0 && (
        <>
          <label className="field-label">{tr("Chế độ dựng sẵn", "Preset mode")}</label>
          <div className="chip-row">
            <button className={!presetMode ? "chip chip--active" : "chip"} onClick={() => onChange(pct, null)}>
              {tr("Theo tốc độ %", "Percentage speed")}
            </button>
            {presets.map((p) => (
              <button key={p} className={presetMode === p ? "chip chip--active" : "chip"} onClick={() => onChange(null, p)}>
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
