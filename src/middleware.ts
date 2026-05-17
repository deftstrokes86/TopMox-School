import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type DashboardRole = "ADMIN" | "PARENT" | "TUTOR";

const protectedDashboardRoutes: Array<{
  prefix: string;
  role: DashboardRole;
  dashboardPath: string;
}> = [
  { prefix: "/admin", role: "ADMIN", dashboardPath: "/admin" },
  { prefix: "/parent", role: "PARENT", dashboardPath: "/parent" },
  { prefix: "/tutor", role: "TUTOR", dashboardPath: "/tutor" }
];

function getProtectedRoute(pathname: string) {
  return protectedDashboardRoutes.find(
    (route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)
  );
}

function getDashboardPathForRole(role: unknown): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PARENT":
      return "/parent";
    case "TUTOR":
      return "/tutor";
    default:
      return "/login";
  }
}

function buildLoginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );
  return url;
}

export async function middleware(request: NextRequest) {
  const protectedRoute = getProtectedRoute(request.nextUrl.pathname);

  if (!protectedRoute) {
    return NextResponse.next();
  }

  let token: Awaited<ReturnType<typeof getToken>> = null;

  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Dashboard middleware token lookup failed:", error);
    }
  }

  if (!token) {
    return NextResponse.redirect(buildLoginRedirect(request));
  }

  if (token.role !== protectedRoute.role) {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardPathForRole(token.role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/parent/:path*", "/tutor/:path*"]
};
