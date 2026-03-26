import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Use /tmp for App Engine (read-only filesystem), local 'logs' dir for development
const isProduction = process.env.NODE_ENV === 'production';
const logDir = isProduction ? '/tmp/logs' : 'logs';

const dailyRotateFileOptions = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
};

// Build transports array
const transports: winston.transport[] = [
  new winston.transports.Console({
    level: isProduction ? 'http' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];

// Only add file transports in development (App Engine uses Cloud Logging)
if (!isProduction) {
  transports.push(
    new DailyRotateFile({
      ...dailyRotateFileOptions,
      dirname: `${logDir}/info`,
      filename: `%DATE%.log`,
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new DailyRotateFile({
      ...dailyRotateFileOptions,
      dirname: `${logDir}/warn`,
      filename: `%DATE%.log`,
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new DailyRotateFile({
      ...dailyRotateFileOptions,
      dirname: `${logDir}/error`,
      filename: `%DATE%.log`,
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  );
}

export const winstonConfig: WinstonModuleOptions = {
  transports,
};
