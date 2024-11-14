export const getCsrfToken = (): string | null => {
  // Try to get from cookie first
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('x-csrf-token'))
    ?.split('=')[1];

  if (token) return token;

  // Fallback to headers if cookie approach doesn't work
  return localStorage.getItem('csrfToken');
};

export const setCsrfToken = (token: string) => {
  localStorage.setItem('csrfToken', token);
}; 