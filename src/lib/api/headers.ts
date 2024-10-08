if (!import.meta.env.VITE_APP_USER_AGENT) {
  throw Error("`VITE_APP_USER_AGENT` environment variable not set.");
}

export const headers = {
  "User-Agent": import.meta.env.VITE_APP_USER_AGENT as string,
};
