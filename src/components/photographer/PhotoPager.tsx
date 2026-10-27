"use client";

const PAGE_SIZE = 10;

export { PAGE_SIZE };

export function PhotoPager({
  page,
  pageSize = PAGE_SIZE,
  total,
  onChange,
  disabled,
}: {
  page: number;
  pageSize?: number;
  total: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) {
    return total > 0 ? (
      <p className="pt-2 text-center text-xs text-slate-400">
        {total} ảnh
      </p>
    ) : null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
      <p className="text-xs text-slate-500">
        Trang {page}/{totalPages} · {total} ảnh
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Trước
        </button>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
