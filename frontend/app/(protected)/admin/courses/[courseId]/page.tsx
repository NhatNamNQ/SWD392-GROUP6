import { CourseDetailPage } from "@/features/course-management/course-detail-page";
import { requireAuthSession } from "@/features/auth/server/require-session";

type PageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { courseId } = await params;
  await requireAuthSession(`/admin/courses/${courseId}`, { role: "ADMIN" });

  return <CourseDetailPage courseId={courseId} />;
}
