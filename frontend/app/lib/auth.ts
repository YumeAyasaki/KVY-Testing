export const TOKEN_KEY = 'kvy_token';

function base64UrlDecode(input: string) {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    return atob(str);
  } catch (err) {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getPayload() {
  const token = getToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 1) return null;
  const decoded = base64UrlDecode(parts[0]);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}
