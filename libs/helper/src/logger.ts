import { ConsoleLogger } from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import { getLog } from 'nestjs-log';

/*
log.verbose(`msg`)
log.debug(`msg`)
log.info(`msg`)
log.warn(`msg`)
log.error(`msg`)
 */

/*
Retain the nestjs logger, but inject file logger
 */
export class AppLogger extends ConsoleLogger {
  fileLogger: any;

  // constructor();
  // constructor(context: string);
  constructor(
    context: string = undefined,
    options: ConsoleLoggerOptions = undefined,
  ) {
    super(context, options);
    // this.setLogLevels(['error']);
    this.fileLogger = getLog(context ?? 'app');
  }

  // setContext(context: string) {
  //   super.setContext(context);
  //   // regenerate file logger
  //   this.fileLogger = getLog(context ?? 'app');
  // }

  log(message: any, context?: string) {
    // eslint-disable-next-line prefer-rest-params
    super.log.apply(this, arguments);

    // eslint-disable-next-line
    this.fileLogger.info.apply(this.fileLogger, arguments);
  }

  error(message: any, stack?: string, context?: string) {
    // console.log('{AppLogger.log} this: ', this);

    // eslint-disable-next-line prefer-rest-params
    super.error.apply(this, arguments);

    // eslint-disable-next-line
    this.fileLogger.error.apply(this.fileLogger, arguments);
  }

  warn(message: any, context?: string) {
    // eslint-disable-next-line prefer-rest-params
    super.warn.apply(this, arguments);

    // eslint-disable-next-line
    this.fileLogger.warn.apply(this.fileLogger, arguments);
  }

  debug(message: any, context?: string) {
    // eslint-disable-next-line prefer-rest-params
    super.debug.apply(this, arguments);

    // eslint-disable-next-line
    this.fileLogger.debug.apply(this.fileLogger, arguments);
  }

  verbose(message: any, context?: string) {
    // eslint-disable-next-line prefer-rest-params
    super.verbose.apply(this, arguments);

    // eslint-disable-next-line
    this.fileLogger.verbose.apply(this.fileLogger, arguments);
  }
}
