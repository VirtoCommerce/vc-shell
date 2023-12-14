/* eslint-disable @typescript-eslint/no-explicit-any */
const { fetch: originalFetch } = window;

/**
 * Overrides the global `fetch` function to handle API calls in demo mode.
 * If `window.__DEMO_MODE__` is true, the fetch is cancelled and a warning is logged.
 * Otherwise, the original `fetch` function is called.
 * @param args - The arguments passed to the `fetch` function.
 * @returns A promise that resolves to the response from the API call.
 */
window.fetch = async (...args) => {
  if (window.__DEMO_MODE__) {
    console.warn("CANCELLED FETCH WHILE IN __DEMO_MODE__: ", ...args);
    console.warn("Please logout and add APP_PLATFORM_URL into .env file of your application to enable API calls");
    return new Promise((resolve: any) => {
      resolve({
        status: 200,
        text: async () => JSON.stringify({}),
      });
    });
  } else {
    return await originalFetch(...args);
  }
};
