import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { Message } from '../../utils'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return Message.success({
    'modules.v1': `https://${event.headers.Host}/modules/v1/`,
    'providers.v1': `https://${event.headers.Host}/providers/v1/`,
  })
}
