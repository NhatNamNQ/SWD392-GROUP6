import { requireAuthSession } from "@/features/auth/server/require-session";
import { CoursesPage } from "@/features/course-management/courses-page";

export default async function Page() {
  await requireAuthSession("/admin/courses");

  return <CoursesPage />;
}
