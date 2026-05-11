import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";

//? Access Token Cookie
export const setAccessTokenCookie = (accessToken: string) => {
  Cookie.set("access_token", accessToken, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(new Date().getTime() + 60 * 15 * 1000),
    // expires: new Date(new Date().getTime() + 60 * 2 * 1000),
  });
};

export const getAccessTokenCookie = () => {
  return Cookie.get("access_token");
};
export const getRefreshTokenCookie = () => {
  return Cookie.get("refresh_token");
};

export const setTokens = (access_token: string, refresh_token: string) => {
  Cookie.set("access_token", access_token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(new Date().getTime() + 60 * 15 * 1000),
  });
  Cookie.set("refresh_token", refresh_token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 7),
  });
};

export const removeAccessTokenCookie = () => {
  Cookie.remove("access_token");
};

//? Refresh Token Cookie
export const setRefreshTokenCookie = (refreshToken: string) => {
  Cookie.set("refresh_token", refreshToken, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(new Date().getTime() + 60 * 60 * 1000 * 24 * 7),
  });
};

export const removeRefreshTokenCookie = () => {
  Cookie.remove("refresh_token");
};

export const getDataFromToken = (token: string) => {
  return jwtDecode(token);
};
