export const env = {
  isDev: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  appName: import.meta.env.VITE_APP_NAME ?? 'movilesFinal'
};
