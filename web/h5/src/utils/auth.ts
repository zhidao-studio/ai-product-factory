/** H5 产品用户 Token，与 Admin 及其他端的会话隔离。 */
const TOKEN_KEY = 'Client-H5-Token';

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
