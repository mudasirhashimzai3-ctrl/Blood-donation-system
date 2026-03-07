import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  // Recharts' ResponsiveContainer expects ResizeObserver in test runtime.
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
