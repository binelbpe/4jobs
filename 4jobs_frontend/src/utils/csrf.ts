export const getCsrfToken = (): string | null => {
  // Try to get from cookie first
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('x-csrf-token='));
  if (csrfCookie) {
    return csrfCookie.split('=')[1];
  }

  // Fallback to localStorage
  return localStorage.getItem('csrfToken');
};

export const setCsrfToken = (token: string) => {
  localStorage.setItem('csrfToken', token);
};

export const clearCsrfToken = () => {
  localStorage.removeItem('csrfToken');
}; 