// Centralized auth-related types and helpers

export type AccessToken = string;
export type RefreshToken = string;

export interface ErrorEnvelope {
  code?: string | number;
  message: string;
  details?: unknown;
}

export interface User {
  id?: string | number;
  email: string;
  name?: string;
  [k: string]: unknown;
}

export interface LoginReq {
  email: string;
  password: string;
}

export interface LoginResp {
  accessToken: AccessToken;
  refreshToken?: RefreshToken;
  user?: User;
}

export interface RegisterReq {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResp extends LoginResp {}

export interface RefreshReq {
  refreshToken: RefreshToken;
}

export interface RefreshResp {
  accessToken: AccessToken;
  refreshToken?: RefreshToken;
}

/**
 * Accepts mixed-case token fields from backend responses and normalizes them.
 * Supports accessToken/access_token and refreshToken/refresh_token.
 */
export function normalizeTokens(input: unknown): {
  accessToken?: AccessToken;
  refreshToken?: RefreshToken;
} {
  if (!input || typeof input !== "object") return {};
  const obj = input as Record<string, unknown>;
  const accessToken =
    (obj["accessToken"] as string | undefined) ??
    (obj["access_token"] as string | undefined) ??
    (obj["token"] as string | undefined);
  const refreshToken =
    (obj["refreshToken"] as string | undefined) ??
    (obj["refresh_token"] as string | undefined) ??
    (obj["rt"] as string | undefined);
  return { accessToken, refreshToken };
}

/**
 * Attempt to parse a backend envelope that might look like:
 * { data: {...}, error?: {...} } or plain object.
 */
export function unwrapEnvelope<T = unknown>(
  input: any
): {
  data?: T;
  error?: ErrorEnvelope;
} {
  if (input && typeof input === "object") {
    if ("error" in input || "data" in input) {
      return {
        data: input.data as T | undefined,
        error: input.error as ErrorEnvelope | undefined,
      };
    }
  }
  return { data: input as T };
}
