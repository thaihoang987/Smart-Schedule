/** Don ban sao noi (`.sortable-fallback`) cua SortableJS con sot lai trong
 * `document.body` - xem ghi chu chi tiet o onEnd trong DeviceGrid.tsx/
 * GroupedDeviceGrid.tsx (bug thuc te 2026-09-23 "kéo xong hiện 2 card"). */
export function removeStaleFallbackClones(): void {
  document.querySelectorAll(".sortable-fallback").forEach((el) => el.remove());
}
