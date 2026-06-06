import { AUTH_SESSION_COOKIE, decodeAuthSession } from "@/features/auth/server/session";

export async function readRequestAuthSession(request: Request) {
  const rawCookie = request.headers.get("cookie") ?? "";
  const cookies = new Map(
    rawCookie
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...value] = part.split("=");
        return [name, value.join("=")];
      }),
  );

  return decodeAuthSession(cookies.get(AUTH_SESSION_COOKIE));
}

export function readRequestCookie(request: Request, name: string) {
  const rawCookie = request.headers.get("cookie") ?? "";

  for (const part of rawCookie.split(";")) {
    const trimmed = part.trim();

    if (trimmed.startsWith(`${name}=`)) {
      return trimmed.slice(name.length + 1);
    }
  }

  return null;
}
