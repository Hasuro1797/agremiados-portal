import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { privateRoutes, publicAuthRoutes, routes } from "./lib/routes";
import { JWTData } from "./types/auth.type";

export async function middleware(request: NextRequest) {
  console.log("Middleware ejecutado para:", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;

  if (privateRoutes.some((route) => pathname.startsWith(route))) {
    const accessTokenCookie = request.cookies.get("access_token");
    const refreshTokenCookie = request.cookies.get("refresh_token");
    if (!accessTokenCookie && !refreshTokenCookie) {
      const url = request.nextUrl.clone();
      url.pathname = routes.autorization.signIn;
      url.search = `p=${pathname}`;
      return NextResponse.redirect(url);
    }

    if (!accessTokenCookie && refreshTokenCookie) {
      try {
        const gqlUrl = `${process.env.NEXT_PUBLIC_URL_SERVER}/graphql`;
        const res = await fetch(gqlUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${refreshTokenCookie.value}`,
          },
          body: JSON.stringify({
            query: `mutation RefreshToken { refreshTokens { access_token refresh_token } }`,
          }),
        });
        const json = await res.json();
        const tokens = json?.data?.refreshTokens;
        if (tokens?.access_token && tokens?.refresh_token) {
          const response = NextResponse.next();
          const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
          const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          response.cookies.set("access_token", tokens.access_token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: accessExpiry,
          });
          response.cookies.set("refresh_token", tokens.refresh_token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: refreshExpiry,
          });
          return response;
        }
      } catch {}
      const url = request.nextUrl.clone();
      url.pathname = routes.autorization.signIn;
      url.search = `p=${pathname}`;
      return NextResponse.redirect(url);
    }

    if (routes.privates.updateData === pathname) {
      const accessToken = request.cookies.get("access_token");
      const token = accessToken;
      if (token) {
        const { sub } = jwtDecode(token.value) as JWTData;
        try {
          const gqlUrl = `${process.env.NEXT_PUBLIC_URL_SERVER}/graphql`;
          const res = await fetch(gqlUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({
              query: `query IsMemberRegistered { isMemberRegistered }`,
            }),
          });
          const json = await res.json();
          const id_person = json?.data?.getProfile?.id_person;
          if (id_person === sub) {
            return NextResponse.next();
          }
        } catch {}
      } else {
        return NextResponse.redirect(
          new URL(routes.autorization.signIn, request.nextUrl),
        );
      }
    }
  }

  if (
    publicAuthRoutes.some((route) => pathname.startsWith(route)) &&
    (request.cookies.get("access_token") ||
      request.cookies.get("refresh_token"))
  ) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/update-data",
    "/sign-in",
    "/sign-up",
    "/calendario",
    "/forgot-password",
    "/reset-password",
    "/update-data",
    "/anuncios",
    "/convenios/:path*",
    "/espacios/:path*",
    "/mis-reservas",
    "/espacios/:path*",
    "/actividades/:path*",
    "/convenios/:path*",
    "/comunicados",
    "/encuestas",
    "/encuestas/:path*",
    "/checkout/:path*",
    "/((?!.*\\..*|_next).*)",
    "/(api|trpc)(.*)",
  ],
};
