export const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  debug: (message: string) => {
      if (process.env.NODE_ENV !== 'production') {
          console.debug(`[DEBUG] ${message}`);
      }
  },
  backend: (message: string) => console.log(`[BACKEND] ${message}`),
  xmpp: (message: string) => console.log(`[XMPP] ${message}`),
};
