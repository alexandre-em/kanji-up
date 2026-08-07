// Every axios instance in src/services/ is built without a timeout by default, which lets a
// stalled request (e.g. a flaky connection dropping the response silently) hang forever instead
// of failing — that blocked the onboarding boot gate, which now waits on getUser to settle.
export const API_TIMEOUT_MS = 15000;
