import { toJavaErrorResponse, requireJavaRequestSession } from "@/features/java-api/server/java-api";
import { requestBackend } from "@/features/auth/server/backend";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireJavaRequestSession(request);
    const { id } = await context.params;

    const backendResponse = await requestBackend(`/api/documents/${id}/file`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      return new Response("Failed to fetch PDF", { status: backendResponse.status });
    }

    // Stream the PDF bytes directly to the browser
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": backendResponse.headers.get("Content-Disposition") ?? "inline",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return toJavaErrorResponse(error);
  }
}
