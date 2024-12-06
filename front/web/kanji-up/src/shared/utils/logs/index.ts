import LocalLog from './localLog';

let logger: Logs;

if (process.env.NODE_ENV === 'production') {
  logger = new LocalLog();
} else {
  logger = new LocalLog();
}

export default logger;
