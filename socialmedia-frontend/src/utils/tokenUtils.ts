// Token Utilities

const TOKEN_KEY = "access_token";
export const tokenUtils = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  decode: () => {
    const token = tokenUtils.get();
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },
  isExpired: (): boolean => {
    const decoded = tokenUtils.decode();
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },
};
