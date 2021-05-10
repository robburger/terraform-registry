import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from './serviceDiscovery'

import * as data from '../../../test/events/serviceDiscovery/ServiceDiscovery.json'

const mockEvent: APIGatewayProxyEvent = data

describe('serviceDiscovery handler', () => {
  it('should respond with a valid Terraform Service Discovery object', async () => {
    const result = await handler(mockEvent)
    expect(result).toMatchSnapshot()
  })
})
