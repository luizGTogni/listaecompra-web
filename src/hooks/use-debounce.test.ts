import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDebounce", () => {
  it("starts with the initial value", () => {
    const { result } = renderHook(() => useDebounce("a", 300));

    expect(result.current).toBe("a");
  });

  it("waits for the value to settle", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(200));
    // 400 ms passed, but the value changed 200 ms ago: still the old one.
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});
