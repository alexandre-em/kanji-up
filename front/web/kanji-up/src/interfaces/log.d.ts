interface Logs {
  log: (message: string, payload?: unknown) => void;
  info: (message: string, payload?: unknown) => void;
  warn: (message: string, payload?: unknown) => void;
  error: (error: string, payload?: unknown) => void;
}
