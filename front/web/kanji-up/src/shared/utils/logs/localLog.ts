export default class LocalLog implements Logs {
  log(message: string, payload?: unknown) {
    return console.log(message, payload);
  }

  info(message: string, payload?: unknown) {
    return console.info(message, payload);
  }

  warn(message: string, payload?: unknown) {
    return console.warn(message, payload);
  }

  error(error: string, payload?: unknown) {
    return console.error(error, payload);
  }
}
