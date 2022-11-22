import winston from "winston";

/**
 * Create a winston logger with settings suitable for this project
 * The level can be set later...
 */
function createMyWinstonLogger() {
  // base format for all transports; can be set as format outside transports
  const myFormatCommon = winston.format.combine(
    winston.format.errors({stack: true}),
    winston.format.splat());

  // nice format for a console transport:
  const myFormatNice = winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({level, message, timestamp}) => {
      return `${timestamp} ${level}: ${message}`;
    }));

  // nice format for a transport whose output will be used to compare different runs:
  // const myFormatDeterministic = winston.format.printf(({level, message, timestamp}) => {
  //   return `${level}: ${message}`;
  // });

  return winston.createLogger({
    exitOnError: false,
    format: myFormatCommon,
    transports: [
      new winston.transports.Console({
        format: myFormatNice
      })
    ]
  });
}

// will instantiate only one logger (an implicit singleton):
const myWinstonLogger = createMyWinstonLogger();

export { myWinstonLogger as logger };
