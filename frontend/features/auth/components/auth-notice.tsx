import type { AuthNotice } from "@/features/auth/model/forms";

type AuthNoticeProps = {
  notice: AuthNotice | null;
};

export function AuthNoticeBanner({ notice }: AuthNoticeProps) {
  if (!notice) {
    return null;
  }

  const toneClasses =
    notice.tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : notice.tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <div className={`rounded-md border px-4 py-3 text-sm font-semibold ${toneClasses}`}>
      {notice.message}
    </div>
  );
}
