// The backend generates 6 characters from A-Z (no I, O) and 2-9.
export const CODE_LENGTH = 6;

// The backend answers 429 (TooManyRequests) to a resend within 60 s of the
// last code, and that includes the code sent at sign-up.
export const RESEND_COOLDOWN_SECONDS = 60;
