import LocalLog from './localLog';

let log: Logs;

if (process.env.NODE_ENV === 'production') {
  log = new LocalLog();
} else {
  log = new LocalLog();
}

export default log;
