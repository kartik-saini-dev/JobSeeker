import { NextResponse } from "next/server";

// Define protected routes for recruiters
const recruiterRoutes = ["/manage", "/conversation", "/create", "/checkout", "/applications"];
const userRoutes = ["/checkout"];

export async function middleware(request) {
  const { pathname } = request.nextUrl; // Get the requested path
  const token = request.cookies.get("my-cookie"); // Extract token from cookies

  // Check if the route matches the protected recruiter or user routes
  if (
    recruiterRoutes.some((route) => pathname.startsWith(route)) || 
    userRoutes.includes(pathname)
  ) {
    if (!token) {
      // Redirect if no token is present
      return NextResponse.redirect(new URL("/unauthorized-page", request.url));
    }

    try {
      // Validate the token via API call
      const response = await fetch(`${request.nextUrl.origin}/api/auth/validate`, {
        method: "GET",
        headers: { cookie: `my-cookie=${token.value}` },
      });

      const data = await response.json();

      // If validation fails or the user type is not recruiter, redirect
      if (!data.success || data.userType !== "recruiter") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Allow access for all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manage",
    "/conversation",
    "/create",
    "/checkout",
    "/applications/:path*", // Match `/applications` and any subpath
  ],
};
