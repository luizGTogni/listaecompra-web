import "@testing-library/jest-dom/vitest";
import { FakeEventSource } from "@/test/event-source";

// jsdom has no EventSource either: every test gets the fake by default, so
// any component that opens one (real-time list updates) does not crash even
// when the test itself has no reason to care. `beforeEach`, not a one-time
// stub: a test's own `afterEach(() => vi.unstubAllGlobals())` would otherwise
// remove it for every test that runs after it in the same file. A test that
// does care about the instances calls `installFakeEventSource()` again for a
// clean `.instances` list.
beforeEach(() => {
  vi.stubGlobal("EventSource", FakeEventSource);
});

// jsdom has no elementFromPoint; input-otp (the verification code boxes)
// calls it on a timer after focus and would crash the test run.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}

// jsdom does not implement scrolling.
window.scrollTo = () => {};
