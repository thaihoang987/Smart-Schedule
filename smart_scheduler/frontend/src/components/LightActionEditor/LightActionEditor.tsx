import type { LightAttrs } from "../../types";
import { tr } from "../../i18n";

const DEFAULT_MIN_KELVIN = 2000;
const DEFAULT_MAX_KELVIN = 6500;
const PRESET_COLORS: [number, number, number][] = [
  [255, 255, 255],
  [255, 214, 170],
  [255, 90, 90],
  [90, 200, 255],
  [120, 255, 120],
  [255, 120, 255],
];

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Chon do sang + nhiet mau + mau cho hanh dong "Dat den" (light_set) - thay
 * TimeWheelPicker/action chip thuong khi target_entities toan la domain
 * "light" (xem ScheduleEditor.tsx). Chi hien tung phan neu entity thuc su ho
 * tro (doc tu `supported_color_modes` that, giong cach ClimateActionEditor
 * doc hvac_modes that). */
export function LightActionEditor({
  light,
  brightnessPct,
  colorTempKelvin,
  rgbColor,
  onChange,
}: {
  light: LightAttrs | null;
  brightnessPct: number | null;
  colorTempKelvin: number | null;
  rgbColor: [number, number, number] | null;
  onChange: (brightnessPct: number | null, colorTempKelvin: number | null, rgbColor: [number, number, number] | null) => void;
}) {
  const modes = light?.supported_color_modes ?? [];
  const supportsColorTemp = modes.includes("color_temp");
  const supportsColor = modes.some((m) => ["rgb", "rgbw", "rgbww", "hs", "xy"].includes(m));
  const minK = light?.min_color_temp_kelvin ?? DEFAULT_MIN_KELVIN;
  const maxK = light?.max_color_temp_kelvin ?? DEFAULT_MAX_KELVIN;
  const brightness = brightnessPct ?? 100;

  return (
    <div className="climate-action">
      <label className="field-label">{tr("Độ sáng", "Brightness")}</label>
      <div className="offset-stepper">
        <button type="button" className="offset-stepper__btn" onClick={() => onChange(Math.max(1, brightness - 10), colorTempKelvin, rgbColor)} aria-label={tr("Giảm", "Decrease")}>
          −
        </button>
        <div className="offset-stepper__value">
          <div className="offset-stepper__minutes">{brightness}%</div>
        </div>
        <button type="button" className="offset-stepper__btn" onClick={() => onChange(Math.min(100, brightness + 10), colorTempKelvin, rgbColor)} aria-label={tr("Tăng", "Increase")}>
          +
        </button>
      </div>

      {supportsColorTemp && (
        <>
          <label className="field-label">{tr("Nhiệt độ màu (K)", "Color temperature (K)")}</label>
          <input
            type="range"
            className="light-range light-range--temp"
            min={minK}
            max={maxK}
            step={100}
            value={colorTempKelvin ?? Math.round((minK + maxK) / 2)}
            onChange={(e) => onChange(brightnessPct, Number(e.target.value), null)}
          />
          <div className="light-range__labels">
            <span>{tr("Ấm", "Warm")} ({minK}K)</span>
            <span>{tr("Lạnh", "Cool")} ({maxK}K)</span>
          </div>
        </>
      )}

      {supportsColor && (
        <>
          <label className="field-label">{tr("Màu sắc", "Color")}</label>
          <div className="chip-row">
            {PRESET_COLORS.map((c) => (
              <button
                key={rgbToHex(c)}
                className="light-color-swatch"
                style={{ background: rgbToHex(c) }}
                onClick={() => onChange(brightnessPct, null, c)}
                aria-label={`${tr("Chọn màu", "Select color")} ${rgbToHex(c)}`}
              />
            ))}
            <input
              type="color"
              className="light-color-picker"
              value={rgbColor ? rgbToHex(rgbColor) : "#ffffff"}
              onChange={(e) => onChange(brightnessPct, null, hexToRgb(e.target.value))}
              aria-label={tr("Chọn màu tùy chỉnh", "Select custom color")}
            />
          </div>
        </>
      )}
    </div>
  );
}
