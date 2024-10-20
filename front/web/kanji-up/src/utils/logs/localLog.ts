export default class LocalLog implements Logs {
  log(message: string) {
    return console.log(message);
  }

  info(message: string) {
    return console.info(message);
  }

  warn(message: string) {
    return console.warn(message);
  }

  error(error: string) {
    return console.error(error);
  }
}
