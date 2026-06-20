import { requireAuthSession } from "@/features/auth/server/require-session";
import { TeacherCoursesPage } from "@/features/teacher/teacher-courses-page";

export default async function TeacherCoursesRoute() {
  const session = await requireAuthSession("/teacher/courses", { role: "LECTURER" });

  return <TeacherCoursesPage user={session.user} />;
}
