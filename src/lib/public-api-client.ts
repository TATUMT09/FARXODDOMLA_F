import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getTestTakerAccessToken,
  setTestTakerAccessToken,
} from "./test-taker-token-store";

export const publicApiClient = axios.create({
  baseURL: "/api/v1/public",
  withCredentials: true,
});

publicApiClient.interceptors.request.use((config) => {
  const token = getTestTakerAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ accessToken: string }>(
        "/api/v1/public/refresh",
        {},
        { withCredentials: true },
      )
      .then((res) => {
        setTestTakerAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .catch(() => {
        setTestTakerAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

publicApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const isAuthEndpoint =
      config?.url?.includes("/login") || config?.url?.includes("/refresh");

    if (
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !isAuthEndpoint
    ) {
      config._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return publicApiClient(config);
      }
    }

    return Promise.reject(error);
  },
);
