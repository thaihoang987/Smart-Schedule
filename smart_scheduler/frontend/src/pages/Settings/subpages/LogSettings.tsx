import { History } from "../../History/History";
import { SubpageHeader } from "../SubpageHeader";
import { tr } from "../../../i18n";

export function LogSettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="page">
      <SubpageHeader title={tr("Nhật ký", "Log")} onBack={onBack} />
      <History />
    </div>
  );
}
