import { WheelPicker, WheelPickerWrapper, type WheelPickerOption } from "@ncdai/react-wheel-picker";
import { useMemo } from "react";

// Wrapper rieng cua project quanh thu vien ncdai/react-wheel-picker (KHONG
// sua source thu vien - xem SPEC.md muc "Thu vien bat buoc"). Chi style
// bang classNames vi day la headless/unstyled core.
// `value` cua tung option PHAI zero-pad giong het chuoi ta dem so sanh o
// prop `value`/`onValueChange` ("06" chu khong phai "6") - bug thuc te
// 2026-09-22: truoc day option.value khong pad ("6") trong khi ta truyen
// value="06" de dong bo voi schedule.time ("06:00") - 2 chuoi khong khop
// nen thu vien khong tim thay option dung, tu dong roi ve 1 gia tri khac
// (quan sat duoc: luon hien "00:00" bat ke schedule luu gio gi).
function buildHours(): WheelPickerOption[] {
  return Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i).padStart(2, "0") }));
}
function buildMinutes(): WheelPickerOption[] {
  return Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i).padStart(2, "0") }));
}
function buildSeconds(): WheelPickerOption[] {
  return Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i).padStart(2, "0") }));
}

// Phan hoi 2026-09-23 "diem cham scroll kha be": tang tu 30 len 38px - vung
// cham/keo moi so cao hon (gan muc toi thieu 44px khuyen nghi cho ngon tay),
// giam kha nang cham truot ra ngoai wheel roi keo xuong kich hoat pull-to-
// refresh cua trinh duyet (xem them .app-main/body { overscroll-behavior-y }
// trong global.css - do moi la fix chinh cho phan "keo xuong reload trang",
// tang size nay chi giam BOT xac suat cham truot). PHAI khop voi
// `line-height` cua `.time-wheel__item`/`.time-wheel__item--active` trong
// global.css (khong doc duoc bien JS nay tu CSS, sua ca 2 cho dung).
const WHEEL_ITEM_HEIGHT = 38;

// LUU Y: visibleCount KHONG duoc nho hon 5 - thu vien dung cong thuc hinh
// tru 3D voi goc moi item = 360/visibleCount ("S" trong source). Voi
// visibleCount=3, goc = 120 deg, tan(120 deg) am -> chieu cao cot [data-rwp]
// tinh ra am/vo nghia -> cot so bi co ve 0, chi con dau ":" hien thi (bug
// thuc te 2026-09-22, thu gon wheel picker cho mobile lam gay UI). Muon gon
// hon thi giam optionItemHeight, KHONG giam visibleCount.
export function TimeWheelPicker({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [h, m, s] = useMemo(() => {
    const [hh, mm, ss] = value.split(":");
    return [hh ?? "00", mm ?? "00", ss ?? "00"];
  }, [value]);

  // MOI instance cua TimeWheelPicker phai co MANG options RIENG (khong dung
  // chung 1 bien module-level) - khi co 2 TimeWheelPicker cung luc (che do
  // Khung gio), dung chung reference lam thu vien nham lan trang thai giua
  // cac instance, ca 2 wheel bi dinh ve 23:59 bat ke prop `value` truyen vao
  // gi (bug thuc te 2026-09-22, xac nhan bang cach doc [data-rwp-highlight-item]).
  const hours = useMemo(buildHours, []);
  const minutes = useMemo(buildMinutes, []);
  const seconds = useMemo(buildSeconds, []);

  return (
    <WheelPickerWrapper className="time-wheel">
      <WheelPicker
        options={hours}
        value={h}
        onValueChange={(v) => onChange(`${v.padStart(2, "0")}:${m}:${s}`)}
        infinite
        visibleCount={5}
        optionItemHeight={WHEEL_ITEM_HEIGHT}
        classNames={{
          optionItem: "time-wheel__item",
          highlightItem: "time-wheel__item--active",
          highlightWrapper: "time-wheel__highlight",
        }}
      />
      <span className="time-wheel__sep">:</span>
      <WheelPicker
        options={minutes}
        value={m}
        onValueChange={(v) => onChange(`${h}:${v.padStart(2, "0")}:${s}`)}
        infinite
        visibleCount={5}
        optionItemHeight={WHEEL_ITEM_HEIGHT}
        classNames={{
          optionItem: "time-wheel__item",
          highlightItem: "time-wheel__item--active",
          highlightWrapper: "time-wheel__highlight",
        }}
      />
      <span className="time-wheel__sep">:</span>
      <WheelPicker
        options={seconds}
        value={s}
        onValueChange={(v) => onChange(`${h}:${m}:${v.padStart(2, "0")}`)}
        infinite
        visibleCount={5}
        optionItemHeight={WHEEL_ITEM_HEIGHT}
        classNames={{
          optionItem: "time-wheel__item",
          highlightItem: "time-wheel__item--active",
          highlightWrapper: "time-wheel__highlight",
        }}
      />
    </WheelPickerWrapper>
  );
}
