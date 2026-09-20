// jsdom has no matchMedia. next-themes uses it to read prefers-color-scheme,
// so tests that render <Providers> call this to simulate the OS setting.
export function mockPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-color-scheme: dark") && prefersDark,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}
