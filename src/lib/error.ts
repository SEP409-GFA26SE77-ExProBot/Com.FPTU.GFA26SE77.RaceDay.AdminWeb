export function getApiErrorMessage(
  err: unknown,
  fallback: string = "Đã xảy ra lỗi. Vui lòng thử lại."
): string {
  if (!err) return fallback;

  if (typeof err === "string" && err.trim()) return err;

  const anyErr = err as {
    response?: { data?: unknown };
    message?: string;
  };
  const data = anyErr?.response?.data;

  if (data) {
    if (typeof data === "string" && data.trim()) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === "object") {
          return getApiErrorMessage({ response: { data: parsed } }, fallback);
        }
      } catch {
        return data;
      }
      return data;
    }

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      for (const key of [
        "error",
        "message",
        "detail",
        "errorMessage",
        "msg",
        "title",
      ]) {
        if (typeof d[key] === "string" && String(d[key]).trim()) {
          return String(d[key]);
        }
      }
      if (d.errors) {
        if (Array.isArray(d.errors)) {
          const joined = d.errors.filter(Boolean).join("; ");
          if (joined) return joined;
        }
        if (typeof d.errors === "object") {
          const errorList = Object.values(d.errors as object)
            .flat()
            .filter(Boolean);
          if (errorList.length > 0) return errorList.join("; ");
        }
      }
    }
  }

  if (anyErr?.message && typeof anyErr.message === "string") {
    return anyErr.message;
  }

  return fallback;
}
