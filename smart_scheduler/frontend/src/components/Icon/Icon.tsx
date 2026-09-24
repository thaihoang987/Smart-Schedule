/** Wrapper mong quanh @mdi/js (chi lay path SVG, tree-shakeable) - dung
 * Material Design Icons cho production thay vi emoji (muc 10 SPEC_UI.md). */
export function Icon({ path, size = 24, className }: { path: string; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path fill="currentColor" d={path} />
    </svg>
  );
}
