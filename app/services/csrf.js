const CSRF_TOKEN_KEY = "XSRF-TOKEN";

const needsCsrf = ({ method, path }) => {
  if (!method) return false;
  const csrfMethods = ["POST", "PATCH", "PUT", "DELETE"];
  const safePaths = ["/csrf", "/auth/signup", "/auth/login"];
  return csrfMethods.includes(method.toUpperCase()) && !safePaths.includes(path);
};

const readCookie = (name) => {
  const entries = document.cookie.split("; ").filter(Boolean);
  const match = entries.find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1]);
};

export async function ensureCsrfToken(api) {
  const existing = readCookie(CSRF_TOKEN_KEY);
  if (existing) return existing;

  await api.request("/csrf", { method: "POST" });
  return readCookie(CSRF_TOKEN_KEY);
}

export const withCsrf = async (api, path, options = {}) => {
  const method = options.method ?? "GET";
  const shouldAttach = needsCsrf({ method, path });
  if (!shouldAttach) return options;

  const csrfToken = await ensureCsrfToken(api);
  if (!csrfToken) return options;
  return {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      "X-XSRF-TOKEN": csrfToken,
    },
  };
};
