import { APIGatewayProxyResult } from 'aws-lambda'
import { STATUS_CODES } from 'http'

enum StatusCode {
  success = 200,
  created = 201,
  noContent = 204,
  bad = 400,
  notFound = 404,
  error = 500,
  notImplemented = 501,
}

class Result {
  private readonly statusCode: number
  private readonly data?: unknown
  private readonly headers?: {
    [header: string]: boolean | number | string
  }

  constructor(statusCode: number, data?: unknown, headers?: { [header: string]: boolean | number | string }) {
    this.statusCode = statusCode
    this.data = data
    this.headers = headers
  }

  bodyToString(): APIGatewayProxyResult {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify(this.data),
      headers: this.headers,
    }
  }
}

export class Message {
  public static success(data: unknown): APIGatewayProxyResult {
    const result = new Result(StatusCode.success, data, { 'content-type': 'application/json' })

    return result.bodyToString()
  }

  public static created(data: Record<string, unknown>): APIGatewayProxyResult {
    const result = new Result(StatusCode.created, data)

    return result.bodyToString()
  }

  public static noContent(headers?: { [header: string]: boolean | number | string }): APIGatewayProxyResult {
    const result = new Result(StatusCode.noContent, '', headers)

    return result.bodyToString()
  }

  public static bad(message: string): APIGatewayProxyResult {
    const result = new Result(
      StatusCode.bad,
      {
        error: message,
      },
      { 'content-type': 'application/json' },
    )

    return result.bodyToString()
  }

  public static notFound(): APIGatewayProxyResult {
    const result = new Result(
      StatusCode.notFound,
      {
        error: STATUS_CODES[StatusCode.notFound],
      },
      { 'content-type': 'application/json' },
    )

    return result.bodyToString()
  }

  public static error(message: string): APIGatewayProxyResult {
    const result = new Result(
      StatusCode.error,
      {
        error: message,
      },
      { 'content-type': 'application/json' },
    )

    return result.bodyToString()
  }

  public static notImplemented(): APIGatewayProxyResult {
    const result = new Result(
      StatusCode.notImplemented,
      {
        error: STATUS_CODES[StatusCode.notImplemented],
      },
      { 'content-type': 'application/json' },
    )

    return result.bodyToString()
  }
}
