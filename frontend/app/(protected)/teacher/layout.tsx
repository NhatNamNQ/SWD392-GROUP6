import { requireAuthSession } from "@/features/auth/server/require-session";
import { TeacherLayout } from "@/features/teacher/components/teacher-layout";

export default async function TeacherProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuthSession("/teacher", { role: "LECTURER" });

  return <TeacherLayout user={session.user}>{children}</TeacherLayout>;
}
