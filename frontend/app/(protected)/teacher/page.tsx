import { TeacherHomePage } from "@/features/teacher/teacher-home-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

export default async function TeacherRoute() {
  const session = await requireAuthSession("/teacher", { role: "LECTURER" });

  return <TeacherHomePage user={session.user} />;
}
