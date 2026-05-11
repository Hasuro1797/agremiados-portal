import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  removeAccessTokenCookie,
  removeRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/cookies";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { REFRESH_TOKEN_MUTATION } from "./mutation/auth.mutation";
import { jwtDecode } from "jwt-decode";

export const operationsList = ["SignInMember", "RefreshToken"];

const GRAHQL_URL = process.env.NEXT_PUBLIC_URL_SERVER;

let refreshPromise: Promise<void> | null = null;

//CONFIGURATION HHTP LINK
const httpLink = createUploadLink({
  uri: `${GRAHQL_URL}/graphql`,
});

export const refreshAccessTokenReq = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh_token = getRefreshTokenCookie();
      try {
        const { data } = await client.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
          context: {
            headers: {
              authorization: `Bearer ${refresh_token}`,
            },
          },
        });

        if (
          data?.refreshTokens?.access_token &&
          data?.refreshTokens?.refresh_token
        ) {
          const { access_token, refresh_token } = data.refreshTokens;
          setAccessTokenCookie(access_token);
          setRefreshTokenCookie(refresh_token);
        } else {
          throw new Error("No se pudo refrescar el token");
        }
      } catch (error) {
        console.error("Error al refrescar el token", error);
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

const authLink = setContext(async (operation, previousContext) => {
  const operationName = operation.operationName;
  if (operationName && operationsList.includes(operationName)) {
    return {
      ...previousContext,
      headers: {
        ...previousContext?.headers,
      },
    };
  }

  const alreadyHasAuth = Boolean(previousContext?.headers?.authorization);
  const token = getAccessTokenCookie();

  if (token) {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      if (exp * 1000 - Date.now() < 60 * 1000) {
        await refreshAccessTokenReq();
      }
    } catch {
      // token invalid, following the flow without token, the request will fail and trigger the refresh token logic in errorLink
    }
  }

  return {
    ...previousContext,
    headers: {
      ...previousContext?.headers,
      ...(!alreadyHasAuth && token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  const unauthError = graphQLErrors.find(
    ({ path, message }) =>
      message?.includes("Unauthorized") &&
      path &&
      !path.includes("refreshTokens"),
  );

  if (!unauthError) return;

  return new Observable((observer) => {
    (async () => {
      try {
        await refreshAccessTokenReq();

        const newAccessToken = getAccessTokenCookie();
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${newAccessToken}`,
          },
        }));

        const subscriber = {
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        };

        forward(operation).subscribe(subscriber);
      } catch (err) {
        removeAccessTokenCookie();
        removeRefreshTokenCookie();
        window.location.href = "/sign-in";
        observer.error(err);
      }
    })();
  });
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
