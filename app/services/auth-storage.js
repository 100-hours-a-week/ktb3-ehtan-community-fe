let accessToken = null;
const USER_KEY = "haru-user";

const safeWindow = typeof window !== "undefined" ? window : undefined;

function readUserFromStorage() {
  if (!safeWindow) return null;
  const raw = safeWindow.sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeUserToStorage(user) {
  if (!safeWindow) return;
  if (!user) {
    safeWindow.sessionStorage.removeItem(USER_KEY);
    return;
  }
  safeWindow.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const authStorage = {
  getToken() {
    return accessToken;
  },
  setToken(token) {
    accessToken = token;
  },
  clear() {
    accessToken = null;
    writeUserToStorage(null);
  },
  saveUser(user) {
    writeUserToStorage(user);
  },
  readUser() {
    return readUserFromStorage();
  },
};
