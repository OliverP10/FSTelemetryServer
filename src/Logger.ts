import { Logger } from "winston";
import { createLogger, transports, format } from "winston";
const { timestamp, combine, printf, errors, label } = format;

export function BuildLogger(name: string) : Logger {
  const logFormat = printf(({ level, message, label, timestamp, stack }:any) => {
    return `[${timestamp}] [${level}] [${label}] ${stack || message}`;
  });

  return createLogger({
    format: combine(
      format.colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      label({ label: name }),
      logFormat
    ),
    transports: [new transports.Console()],
  });
}
