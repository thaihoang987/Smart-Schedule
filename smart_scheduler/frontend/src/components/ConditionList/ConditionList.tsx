import type { ConditionOperator, EntitySummary, ScheduleCondition } from "../../types";
import { conditionStateOptions, operatorLabel, operatorsFor } from "../../utils/conditionStates";
import { tr } from "../../i18n";

/** Danh sach dieu kien cua 1 moc (Bat hoac Tat) trong ScheduleEditor - tach
 * thanh component rieng tu v0.5.35 de "Khung gio" co 2 danh sach doc lap
 * (moc Bat va moc Tat), truoc day dung chung 1 danh sach cho ca 2 moc. */
export function ConditionList({
  label,
  conditions,
  entities,
  nameFor,
  onChange,
  onAdd,
}: {
  label: string;
  conditions: ScheduleCondition[];
  entities: EntitySummary[];
  nameFor: (entityId: string) => string;
  onChange: (conditions: ScheduleCondition[]) => void;
  /** Mo EntityPicker (nam o ScheduleEditor, ngoai BottomSheet) de chon thiet bi cho dieu kien moi. */
  onAdd: () => void;
}) {
  const update = (index: number, patch: Partial<ScheduleCondition>) => onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const remove = (index: number) => onChange(conditions.filter((_, i) => i !== index));

  return (
    <>
      <label className="field-label">{label}</label>
      {conditions.map((cond, i) => {
        const entity = entities.find((e) => e.entity_id === cond.entity_id);
        const options = conditionStateOptions(entity);
        const operator = cond.operator ?? "eq";
        const numeric = operator !== "eq" && operator !== "ne";
        return (
          <div key={cond.entity_id} className="condition-row">
            <span className="condition-row__entity">{nameFor(cond.entity_id)}</span>
            <div className="condition-row__controls">
              <select
                className="input condition-row__op"
                value={operator}
                onChange={(e) => update(i, { operator: e.target.value as ConditionOperator })}
                aria-label={tr("Phép so sánh", "Comparison operator")}
              >
                {operatorsFor(entity).map((op) => (
                  <option key={op} value={op}>
                    {operatorLabel(op)}
                  </option>
                ))}
              </select>
              {options && !numeric ? (
                <select className="input condition-row__state" value={cond.state} onChange={(e) => update(i, { state: e.target.value })}>
                  {/* Giu gia tri cu neu khong nam trong danh sach (lich tao
                      truoc khi co danh sach xo xuong, hoac thiet bi doi mode). */}
                  {!options.some((o) => o.value === cond.state) && <option value={cond.state}>{cond.state}</option>}
                  {options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input condition-row__state"
                  value={cond.state}
                  inputMode={numeric ? "decimal" : undefined}
                  onChange={(e) => update(i, { state: e.target.value })}
                  placeholder={numeric ? "60" : entity?.state || "on"}
                />
              )}
              <button className="condition-row__remove" onClick={() => remove(i)} aria-label={tr("Xoá điều kiện", "Remove condition")}>
                ×
              </button>
            </div>
            {entity && <div className="condition-row__now">{tr("Hiện tại", "Current")}: {entity.state}</div>}
          </div>
        );
      })}
      <button className="input input--button" onClick={onAdd}>
        + {tr("Thêm điều kiện", "Add condition")}
      </button>
    </>
  );
}
