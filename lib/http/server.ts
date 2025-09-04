import axios, { AxiosInstance } from "axios";

let serverClient: AxiosInstance | null = null;

/**
 * Axios instance for server-side calls to the backend.
 * Uses env alias BACKEND_URL as requested.
 */
export function backend(): AxiosInstance {
  if (serverClient) return serverClient;

  const baseURL = process.env.BACKEND_URL;
  if (!baseURL) {
    throw new Error(
      "BACKEND_URL is not set. Add it to your environment or .env.local"
    );
  }

  serverClient = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { "Content-Type": "application/json" },
  });

  return serverClient;
}
