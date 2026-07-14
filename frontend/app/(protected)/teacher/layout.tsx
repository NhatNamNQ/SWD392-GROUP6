import { requireAuthSession } from "@/features/auth/server/require-session";
import { TeacherLayout } from "@/features/teacher/components/teacher-layout";
import { UploadProgressProvider } from "@/features/knowledge-base/context/UploadProgressContext";

export default async function TeacherProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuthSession("/teacher", { role: "LECTURER" });

  return (
    <UploadProgressProvider>
      <TeacherLayout user={session.user}>{children}</TeacherLayout>
    </UploadProgressProvider>
  );
}
