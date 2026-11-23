export default function RouteLoading() {
  return (
    <div
      className="flex min-h-48 items-center justify-center text-sm text-[var(--text-secondary)]"
      role="status"
      aria-live="polite"
    >
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-orange-500" />
      Đang tải trang…
    </div>
  );
}
