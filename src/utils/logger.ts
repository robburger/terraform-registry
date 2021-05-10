export interface ILogger {
  trace(message: string, ...supportingData: unknown[]): void
  debug(message: string, ...supportingData: unknown[]): void
  info(message: string, ...supportingData: unknown[]): void
  warn(message: string, ...supportingData: unknown[]): void
  error(message: string, ...supportingData: unknown[]): void
}

export class Logger implements ILogger {
  /**
   * Prints to `stderr` the message and stack trace to the current position in the code.
   */
  public trace(message: string, ...supportingData: unknown[]): void {
    this.emitLog('trace', message, supportingData)
  }

  /**
   * Prints to `stdout` the message and any supporting data.
   */
  public debug(message: string, ...supportingData: unknown[]): void {
    this.emitLog('debug', message, supportingData)
  }

  /**
   * Prints to `stdout` the message and any supporting data.
   */
  public info(message: string, ...supportingData: unknown[]): void {
    this.emitLog('info', message, supportingData)
  }

  /**
   * Prints to `stderr` the message and any supporting data.
   */
  public warn(message: string, ...supportingData: unknown[]): void {
    this.emitLog('warn', message, supportingData)
  }

  /**
   * Prints to `stderr` the message and any supporting data.
   */
  public error(message: string, ...supportingData: unknown[]): void {
    this.emitLog('error', message, supportingData)
  }

  private emitLog(level: 'trace' | 'debug' | 'info' | 'warn' | 'error', message: string, supportingData: unknown[]) {
    if (supportingData.length > 0) {
      console[level](message, supportingData)
    } else {
      console[level](message)
    }
  }
}
