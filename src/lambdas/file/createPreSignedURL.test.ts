import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from './createPreSignedURL'

import * as data from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL.json'
import * as data_invalid_body from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_invalid_body.json'
import * as data_missing_body from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_missing_body.json'
import * as data_missing_querystring from '../../../test/events/file/createPreSignedURL/CreatePreSignedURL_missing_querystring.json'

beforeAll(() => {
  process.env['S3_BUCKET_NAME'] = 'localbucket'
})

beforeEach(() => {
  jest.useFakeTimers()
})

describe('createPreSignedURL handler', () => {
  it('should return a pre-signed URL', async () => {
    const mockEvent: APIGatewayProxyEvent = data
    const result = await handler(mockEvent)
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('headers', { 'content-type': 'application/json' })
    expect(result).toHaveProperty('statusCode', 200)

    const body = JSON.parse(result.body)
    expect(body).toHaveProperty('url')
    expect(body.url).toMatch(
      /localbucket\.s3\..*amazonaws\.com\/modules\/test\/test\/test\/test\/module\.zip\?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=.*%2F\d{8}%2F\w{2}-\w*-\d%2Fs3%2Faws4_request&X-Amz-Date=\d{8}T\d{6}Z&X-Amz-Expires=\d*&X-Amz-Signature=.{64}&X-Amz-SignedHeaders=host%3Bx-amz-tagging&x-amz-tagging=tags%3Dtrue/,
    )
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
