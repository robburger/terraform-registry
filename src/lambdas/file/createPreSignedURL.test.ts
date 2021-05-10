import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from './createPreSignedURL'

import * as data from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL.json'
import * as data_invalid_body from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_invalid_body.json'
import * as data_missing_body from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_missing_body.json'
import * as data_missing_querystring from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_missing_querystring.json'

beforeEach(() => {
  jest.useFakeTimers()
})

describe('createPreSignedURL handler', () => {
  it('should return a pre-signed URL', async () => {
    const mockEvent: APIGatewayProxyEvent = data
    const result = await handler(mockEvent)
    expect(result).toMatchSnapshot()
  })

  it('should return an error when invalid body data', async () => {
    const mockEvent: APIGatewayProxyEvent = data_invalid_body
    const result = await handler(mockEvent)
    expect(result).toMatchSnapshot()
  })

  it('should return an error when missing body data', async () => {
    const mockEvent: APIGatewayProxyEvent = data_missing_body
    const result = await handler(mockEvent)
    expect(result).toMatchSnapshot()
  })

  it('should return an error when missing/invalid "type" querystring', async () => {
    const mockEvent: APIGatewayProxyEvent = data_missing_querystring
    const result = await handler(mockEvent)
    expect(result).toMatchSnapshot()
  })
})
