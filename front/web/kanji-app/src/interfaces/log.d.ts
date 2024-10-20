interface Logs {
  log: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (error: string) => void;
}
