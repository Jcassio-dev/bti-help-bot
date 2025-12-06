import P from "pino";

class LoggerService {
  private static instance: LoggerService;
  private logger: P.Logger;

  private constructor() {
    this.logger = P({
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    });
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public info(obj: object | string, msg?: string): void {
    if (typeof obj === "string") {
      this.logger.info(obj);
    } else {
      this.logger.info(obj, msg);
    }
  }

  public debug(obj: object | string, msg?: string): void {
    if (typeof obj === "string") {
      this.logger.debug(obj);
    } else {
      this.logger.debug(obj, msg);
    }
  }

  public warn(obj: object | string, msg?: string): void {
    if (typeof obj === "string") {
      this.logger.warn(obj);
    } else {
      this.logger.warn(obj, msg);
    }
  }

  public error(obj: object | string, msg?: string): void {
    if (typeof obj === "string") {
      this.logger.error(obj);
    } else {
      this.logger.error(obj, msg);
    }
  }

  public fatal(obj: object | string, msg?: string): void {
    if (typeof obj === "string") {
      this.logger.fatal(obj);
    } else {
      this.logger.fatal(obj, msg);
    }
  }


  public child(bindings: P.Bindings): P.Logger {
    return this.logger.child(bindings);
  }


  public getRawLogger(): P.Logger {
    return this.logger;
  }
}

export const logger = LoggerService.getInstance();
