import type { ClimateAttrs } from "../../types";
import { hvacModeIsTemperatureless, hvacModeLabel } from "../../utils/scheduleRange";
import { tr } from "../../i18n";

const FALLBACK_MODES = ["off", "cool", "heat", "auto", "dry", "fan_only"];
const DEFAULT_MIN = 16;
const DEFAULT_MAX = 30;
const DEFAULT_STEP = 1;

/** Chon hvac_mode + nhiet do dich cho hanh dong "Dat che do" (climate_set) -
 * thay TimeWheelPicker/action chip thuong khi target_entities toan la
 * domain "climate" (xem ScheduleEditor.tsx). Tham khao UX cua
 * custom:scheduler-card: 1 hanh dong = 1 mode + 1 nhiet do, khong tach
 * rieng 2 buoc "bat" va "chinh nhiet do". */
export function ClimateActionEditor({
  climate,
  mode,
  temperature,
  onChange,
}: {
  climate: ClimateAttrs | null;
  mode: string | null;
  temperature: number | null;
  onChange: (mode: string | null, temperature: number | null) => void;
}) {
  const modes = climate?.hvac_modes?.length ? climate.hvac_modes : FALLBACK_MODES;
  const min = climate?.min_temp ?? DEFAULT_MIN;
  const max = climate?.max_temp ?? DEFAULT_MAX;
  const step = climate?.temp_step ?? DEFAULT_STEP;
  const showTemp = !hvacModeIsTemperatureless(mode);
  const temp = temperature ?? Math.round((min + max) / 2 / step) * step;

  function selectMode(next: string) {
    onChange(next, hvacModeIsTemperatureless(next) ? null : (temperature ?? temp));
  }

  function clampTemp(v: number) {
    return Math.max(min, Math.min(max, Math.round(v / step) * step));
  }

  return (
    <div className="climate-action">
      <label className="field-label">{tr("Chế độ", "Mode")}</label>
      <div className="chip-row">
        {modes.map((m) => (
          <button key={m} className={mode === m ? "chip chip--active" : "chip"} onClick={() => selectMode(m)}>
            {hvacModeLabel(m)}
          </button>
        ))}
      </div>

      {showTemp && (
        <>
          <label className="field-label">{tr("Nhiệt độ", "Temperature")}</label>
          <div className="offset-stepper">
            <button type="button" className="offset-stepper__btn" onClick={() => onChange(mode, clampTemp(temp - step))} aria-label={tr("Giảm", "Decrease")}>
              −
            </button>
            <div className="offset-stepper__value">
              <div className="offset-stepper__minutes">{temp}°C</div>
            </div>
            <button type="button" className="offset-stepper__btn" onClick={() => onChange(mode, clampTemp(temp + step))} aria-label={tr("Tăng", "Increase")}>
              +
            </button>
          </div>
        </>
      )}
    </div>
  );
}
