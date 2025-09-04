"use client";

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setAccessToken } from "../auth/tokenStore";
import type { RefreshResp } from "../../types/auth";

let browserClient: AxiosInstance | null = null;

export function createBrowserClient(): AxiosInstance {
  if (browserClient) return browserClient;

  const instance = axios.create({
    baseURL: "/api",
    withCredentials: true, // send HttpOnly refresh cookie to our Next API when needed
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request: inject Authorization from in-memory store
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      if (!("Authorization" in config.headers)) {
        (config.headers as any)["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  });

  install401RefreshInterceptor(instance);

  browserClient = instance;
  return instance;
}

// Shared refresh orchestration
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const pendingQueue: Array<{
  resolve: (value: AxiosRequestConfig) => void;
  reject: (error: unknown) => void;
  config: AxiosRequestConfig & { _retry?: boolean };
}> = [];

function runQueue(error: unknown, token: string | null) {
  while (pendingQueue.length) {
    const { resolve, reject, config } = pendingQueue.shift()!;
    if (error) {
      reject(error);
      continue;
    }
    // Update header with new token (if any)
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    resolve(config);
  }
}

function requestRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  isRefreshing = true;

  // Use a minimal axios instance to avoid interceptor recursion.
  const naked = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  refreshPromise = naked
    .post<RefreshResp>("/auth/refresh")
    .then((resp: AxiosResponse<RefreshResp>) => {
      const token = resp.data?.accessToken ?? null;
      setAccessToken(token);
      return token;
    })
    .catch((err: unknown) => {
      setAccessToken(null);
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise!;
}

export function install401RefreshInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (r: AxiosResponse) => r,
    async (error: AxiosError) => {
      const response = error.response;
      const originalConfig = (error.config || {}) as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (response?.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        if (isRefreshing) {
          // Queue the request until refresh resolves
          return new Promise((resolve, reject) => {
            pendingQueue.push({
              resolve: (cfg) => resolve(instance.request(cfg)),
              reject,
              config: originalConfig,
            });
          });
        }

        try {
          const newToken = await requestRefresh();
          runQueue(null, newToken);
          // Replay the original request with updated token header
          originalConfig.headers = originalConfig.headers ?? {};
          if (newToken) {
            (originalConfig.headers as any)["Authorization"] =
              `Bearer ${newToken}`;
          } else {
            if (originalConfig.headers) {
              delete (originalConfig.headers as any)["Authorization"];
            }
          }
          return instance.request(originalConfig);
        } catch (refreshErr) {
          runQueue(refreshErr, null);
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    }
  );
}
