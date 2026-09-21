import { act, renderHook } from "@testing-library/react";
import { useSecondsUntil } from "./use-countdown";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useSecondsUntil", () => {
  it("is 0 without a deadline", () => {
    const { result } = renderHook(() => useSecondsUntil(null));

    expect(result.current).toBe(0);
  });

  it("counts down to zero and stops", () => {
    const deadline = Date.now() + 3000;
    const { result } = renderHook(() => useSecondsUntil(deadline));
    expect(result.current).toBe(3);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(2);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
  });

  it("restarts when the deadline moves", () => {
    const { result, rerender } = renderHook(
      ({ deadline }) => useSecondsUntil(deadline),
      { initialProps: { deadline: Date.now() + 1000 } },
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(0);

    rerender({ deadline: Date.now() + 5000 });
    expect(result.current).toBe(5);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(4);
  });
});
