import "@testing-library/jest-dom/vitest";

// jsdom has no elementFromPoint; input-otp (the verification code boxes)
// calls it on a timer after focus and would crash the test run.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}
