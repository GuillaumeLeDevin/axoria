import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {

    // console.log("Middleware: Checking authentication for dashboard access");

    const authCheckUrl = new URL("/api/auth/validateSession", request.url);

    const authResponse = await fetch(authCheckUrl, {
        headers: {
            cookie: (await cookies()).toString()
        },
        cache: "force-cache",
        next: {tags: ["auth-session"]}
    });

    const { authorized } = await authResponse.json();

    if (!authorized) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl.origin));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};