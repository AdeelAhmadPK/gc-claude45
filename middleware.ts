export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/boards/:path*",
    "/api/workspaces/:path*",
    "/api/boards/:path*",
  ],
};
