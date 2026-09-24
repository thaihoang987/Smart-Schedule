import {
  mdiAirConditioner,
  mdiAirPurifier,
  mdiAlarm,
  mdiBell,
  mdiBlindsHorizontal,
  mdiCctv,
  mdiCeilingFan,
  mdiCeilingLight,
  mdiClockOutline,
  mdiCoffeeMaker,
  mdiCurtains,
  mdiDeskLamp,
  mdiDesktopTowerMonitor,
  mdiDevices,
  mdiDoor,
  mdiDoorbell,
  mdiEvStation,
  mdiFan,
  mdiFlower,
  mdiFountain,
  mdiFridge,
  mdiGarage,
  mdiGate,
  mdiKettle,
  mdiLamp,
  mdiLedStrip,
  mdiLightbulb,
  mdiLightningBolt,
  mdiLock,
  mdiOutdoorLamp,
  mdiPaletteOutline,
  mdiPool,
  mdiPowerPlug,
  mdiPowerSocketEu,
  mdiPump,
  mdiRadiator,
  mdiRouterWireless,
  mdiScriptTextOutline,
  mdiShieldHomeOutline,
  mdiSpeaker,
  mdiSprinkler,
  mdiSprinklerVariant,
  mdiTelevision,
  mdiThermometer,
  mdiTimerOutline,
  mdiWallSconce,
  mdiWashingMachine,
  mdiWater,
  mdiWaterBoiler,
  mdiWaterPump,
} from "@mdi/js";
import { tr } from "../i18n";
import { lookupMdi } from "./mdiIcons";

interface DomainVisual {
  icon: string;
  color: string; // dung lam accent cho icon-circle + status dot (muc 58 SPEC_UI.md)
}

const DOMAIN_VISUALS: Record<string, DomainVisual> = {
  light: { icon: mdiLightbulb, color: "#f5b301" },
  switch: { icon: mdiPowerPlug, color: "#0a84ff" },
  climate: { icon: mdiAirConditioner, color: "#32ade6" },
  fan: { icon: mdiFan, color: "#5ac8fa" },
  cover: { icon: mdiCurtains, color: "#8e8e93" },
  lock: { icon: mdiLock, color: "#30d158" },
  script: { icon: mdiScriptTextOutline, color: "#bf5af2" },
  scene: { icon: mdiPaletteOutline, color: "#ff9f0a" },
  input_boolean: { icon: mdiPowerPlug, color: "#0a84ff" },
  alarm_control_panel: { icon: mdiShieldHomeOutline, color: "#ff453a" },
  water_heater: { icon: mdiThermometer, color: "#ff9f0a" },
};

// Tu khoa trong ten thiet bi/entity_id de bat "bom nuoc" thanh icon nuoc du
// domain van la switch (muc 6/10 SPEC_UI.md - nguoi dung khong thay
// domain/entity_id, chi thay icon dung ngu canh).
const NAME_HINTS: [RegExp, DomainVisual][] = [
  [/bom|pump|giếng|nước/i, { icon: mdiPump, color: "#32ade6" }],
];

/** Bo icon cho nguoi dung tu chon trong Cai dat -> Thiet bi (phan hoi
 * 2026-09-24 "cho phép đổi icon timer dùng trong app"). Key dung dinh dang
 * "mdi:ten-icon" giong HA, luu vao cot `icon` cua entity_aliases - nen icon
 * dat san trong HA (attributes.icon) trung ten o day cung tu duoc dung. */
export const ICON_CHOICES: { key: string; path: string; label: string }[] = [
  { key: "mdi:lightbulb", path: mdiLightbulb, label: "Bóng đèn" },
  { key: "mdi:ceiling-light", path: mdiCeilingLight, label: "Đèn trần" },
  { key: "mdi:lamp", path: mdiLamp, label: "Đèn cây" },
  { key: "mdi:desk-lamp", path: mdiDeskLamp, label: "Đèn bàn" },
  { key: "mdi:wall-sconce", path: mdiWallSconce, label: "Đèn tường" },
  { key: "mdi:outdoor-lamp", path: mdiOutdoorLamp, label: "Đèn sân" },
  { key: "mdi:led-strip", path: mdiLedStrip, label: "Đèn LED dây" },
  { key: "mdi:power-plug", path: mdiPowerPlug, label: "Phích cắm" },
  { key: "mdi:power-socket-eu", path: mdiPowerSocketEu, label: "Ổ cắm" },
  { key: "mdi:lightning-bolt", path: mdiLightningBolt, label: "Điện / CB" },
  { key: "mdi:air-conditioner", path: mdiAirConditioner, label: "Máy lạnh" },
  { key: "mdi:fan", path: mdiFan, label: "Quạt" },
  { key: "mdi:ceiling-fan", path: mdiCeilingFan, label: "Quạt trần" },
  { key: "mdi:air-purifier", path: mdiAirPurifier, label: "Lọc không khí" },
  { key: "mdi:radiator", path: mdiRadiator, label: "Sưởi" },
  { key: "mdi:water-boiler", path: mdiWaterBoiler, label: "Bình nóng lạnh" },
  { key: "mdi:thermometer", path: mdiThermometer, label: "Nhiệt độ" },
  { key: "mdi:pump", path: mdiPump, label: "Bơm" },
  { key: "mdi:water-pump", path: mdiWaterPump, label: "Máy bơm nước" },
  { key: "mdi:water", path: mdiWater, label: "Nước" },
  { key: "mdi:sprinkler", path: mdiSprinkler, label: "Tưới cây" },
  { key: "mdi:sprinkler-variant", path: mdiSprinklerVariant, label: "Phun sương" },
  { key: "mdi:fountain", path: mdiFountain, label: "Đài phun" },
  { key: "mdi:flower", path: mdiFlower, label: "Cây / Vườn" },
  { key: "mdi:pool", path: mdiPool, label: "Hồ bơi" },
  { key: "mdi:curtains", path: mdiCurtains, label: "Rèm" },
  { key: "mdi:blinds-horizontal", path: mdiBlindsHorizontal, label: "Rèm lá" },
  { key: "mdi:garage", path: mdiGarage, label: "Cửa cuốn" },
  { key: "mdi:gate", path: mdiGate, label: "Cổng" },
  { key: "mdi:door", path: mdiDoor, label: "Cửa" },
  { key: "mdi:lock", path: mdiLock, label: "Khoá" },
  { key: "mdi:doorbell", path: mdiDoorbell, label: "Chuông cửa" },
  { key: "mdi:bell", path: mdiBell, label: "Chuông" },
  { key: "mdi:alarm", path: mdiAlarm, label: "Báo thức" },
  { key: "mdi:cctv", path: mdiCctv, label: "Camera" },
  { key: "mdi:television", path: mdiTelevision, label: "TV" },
  { key: "mdi:speaker", path: mdiSpeaker, label: "Loa" },
  { key: "mdi:router-wireless", path: mdiRouterWireless, label: "Wifi" },
  { key: "mdi:desktop-tower-monitor", path: mdiDesktopTowerMonitor, label: "Máy tính" },
  { key: "mdi:washing-machine", path: mdiWashingMachine, label: "Máy giặt" },
  { key: "mdi:fridge", path: mdiFridge, label: "Tủ lạnh" },
  { key: "mdi:kettle", path: mdiKettle, label: "Ấm đun" },
  { key: "mdi:coffee-maker", path: mdiCoffeeMaker, label: "Máy pha cà phê" },
  { key: "mdi:ev-station", path: mdiEvStation, label: "Sạc xe điện" },
  { key: "mdi:timer-outline", path: mdiTimerOutline, label: "Hẹn giờ" },
  { key: "mdi:clock-outline", path: mdiClockOutline, label: "Đồng hồ" },
];

export function iconChoiceLabel(choice: (typeof ICON_CHOICES)[number]): string {
  const english = choice.key
    .replace(/^mdi:/, "")
    .split("-")
    .map((part, index) => index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(" ");
  return tr(choice.label, english);
}

const ICON_BY_KEY = new Map(ICON_CHOICES.map((c) => [c.key, c.path]));

/** Icon mac dinh (theo ten/domain) - dung cho o "Mặc định" trong bo chon icon. */
export function defaultVisualFor(domain: string, name: string): DomainVisual {
  for (const [re, visual] of NAME_HINTS) {
    if (re.test(name)) return visual;
  }
  return DOMAIN_VISUALS[domain] || { icon: mdiDevices, color: "#8e8e93" };
}

/** Path SVG cho 1 key "mdi:..." bat ky: bo chon san truoc, khong co thi tra
 * trong toan bo thu vien MDI (nap luoi - xem mdiIcons.ts). */
export function iconPathFor(icon?: string | null): string | undefined {
  if (!icon) return undefined;
  return ICON_BY_KEY.get(icon) ?? lookupMdi(icon);
}

/** `icon` (tuy chon) = icon nguoi dung chon trong Cai dat ("mdi:..."), uu
 * tien hon icon tu doan theo ten/domain; mau accent van theo domain. Icon
 * ngoai bo chon san (go tay, hoac attributes.icon cua HA) hien icon mac dinh
 * cho toi khi thu vien day du nap xong - component can goi useMdiIcons(). */
export function visualFor(domain: string, name: string, icon?: string | null): DomainVisual {
  const base = defaultVisualFor(domain, name);
  const custom = iconPathFor(icon);
  return custom ? { ...base, icon: custom } : base;
}
