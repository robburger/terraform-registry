import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreatePreSignedURLDTO } from '../../models/dto'
import { AWS, Logger, Message } from '../../utils'

const logger = new Logger()

const s3 = new AWS.S3({ region: process.env.AWS_REGION, signatureVersion: 'v4' })

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (event.queryStringParameters?.type === 'module') {
    const params: CreatePreSignedURLDTO = JSON.parse(event.body)
    if (isValidParams(params)) {
      try {
        const ext = event.queryStringParameters?.compression || 'zip'
        const url = s3.getSignedUrl('putObject', {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `modules/${params.namespace}/${params.name}/${params.provider}/${params.version}/module.${ext}`,
          Expires: 300,
          Tagging: 'tags=true',
        })
        logger.info(`Successfully generated pre-signed URL`)
        return Message.success({
          url: url,
        })
      } catch (e) {
        logger.error(`Failed to generate pre-signed URL: ${e}`)
        return Message.error(`Failed to generate pre-signed URL: ${e}`)
      }
    } else {
      logger.error(`JSON payload invalid: ${JSON.stringify(params)}`)
      return Message.bad(
        `JSON payload invalid. Ensure you provide an object with 'namespace', 'name', 'provider' and 'version' parameters`,
      )
    }
  } else {
    logger.error(`Missing 'type' from queryStringParameters`)
    return Message.bad(
      `You need to specify a 'type' for this request. e.g. /pre-sign?type=module or /pre-sign?type=provider`,
    )
  }
}

const isValidParams = (params: CreatePreSignedURLDTO) => {
  if (
    params?.hasOwnProperty('namespace') &&
    params?.namespace.length > 0 &&
    params?.hasOwnProperty('name') &&
    params?.name.length > 0 &&
    params?.hasOwnProperty('version') &&
    params?.version.length > 0 &&
    params?.hasOwnProperty('provider') &&
    params?.provider.length > 0
  ) {
    return true
  } else {
    return false
  }
}
