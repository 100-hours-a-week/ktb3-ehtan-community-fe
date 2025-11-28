const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const defaultOptions = {
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
};

export const createApiClient = ({ baseUrl = DEFAULT_BASE_URL } = {}) => {
  const request = async (path, { method = "GET", headers = {}, body, signal } = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      ...defaultOptions,
      method,
      headers: {
        ...defaultOptions.headers,
        ...headers,
      },
      body,
      signal,
    });

    return response;
  };

  return { request, baseUrl };
};

export const apiClient = createApiClient();
