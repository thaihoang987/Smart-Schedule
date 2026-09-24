import { tr } from "../../i18n";

/** Chon vi tri dong/mo (0-100%) cho hanh dong "Dat vi tri" (cover_set) - rem/
 * cua cuon/cong. 0 = dong hoan toan, 100 = mo hoan toan (dung quy uoc cua
 * HA `cover.set_cover_position`). */
export function CoverActionEditor({ position, onChange }: { position: number | null; onChange: (position: number) => void }) {
  const value = position ?? 100;
  return (
    <div className="climate-action">
      <label className="field-label">{tr("Vị trí", "Position")}</label>
      <input type="range" className="light-range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="light-range__labels">
        <span>{tr("Đóng", "Closed")}</span>
        <span className="light-range__current">{value}%</span>
        <span>{tr("Mở", "Open")}</span>
      </div>
    </div>
  );
}
