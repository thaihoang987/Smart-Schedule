import { ALL_DAYS, WEEKDAY_LABELS_VI, WEEKDAYS, WEEKEND } from "../../types";
import { appLanguage, tr } from "../../i18n";

const arraysEqual = (a: number[], b: number[]) => a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");

export function DaySelector({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
  const preset = arraysEqual(value, ALL_DAYS)
    ? "daily"
    : arraysEqual(value, WEEKDAYS)
      ? "weekdays"
      : arraysEqual(value, WEEKEND)
        ? "weekend"
        : "custom";

  function toggleDay(day: number) {
    if (value.includes(day)) onChange(value.filter((d) => d !== day));
    else onChange([...value, day].sort());
  }

  return (
    <div className="day-selector">
      <div className="day-selector__presets">
        <button className={preset === "daily" ? "chip chip--active" : "chip"} onClick={() => onChange(ALL_DAYS)}>
          {tr("Hàng ngày", "Every day")}
        </button>
        <button className={preset === "weekdays" ? "chip chip--active" : "chip"} onClick={() => onChange(WEEKDAYS)}>
          {tr("Ngày thường", "Weekdays")}
        </button>
        <button className={preset === "weekend" ? "chip chip--active" : "chip"} onClick={() => onChange(WEEKEND)}>
          {tr("Cuối tuần", "Weekends")}
        </button>
      </div>
      <div className="day-selector__days">
        {(appLanguage() === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : WEEKDAY_LABELS_VI).map((label, idx) => (
          <button
            key={label}
            className={value.includes(idx) ? "day-pill day-pill--active" : "day-pill"}
            onClick={() => toggleDay(idx)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
