import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { AWS, Logger, Message } from '../../utils'

const logger = new Logger()

const ddb = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ region: process.env.AWS_REGION, signatureVersion: 'v4' })

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const module = `${event.pathParameters?.namespace}/${event.pathParameters?.name}/${event.pathParameters?.provider}`
  const key = `modules/${module}/${event.pathParameters.version}/module.zip`

  logger.info(`Generating pre-signed URL for module: ${key}`)

  try {
    // Generate S3 signed URL
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 300,
    })
    logger.info(`Successfully generated pre-signed URL`)

    // Increment DynamoDB download count by 1 and update last_downloaded_at time
    const params: DocumentClient.UpdateItemInput = {
      Key: { id: module, version: event.pathParameters.version },
      TableName: process.env.DYNAMODB_TABLE_NAME_MODULES,
      UpdateExpression: 'ADD downloads :inc SET last_downloaded_at = :now',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':now': Date.now(),
      },
    }

    ddb
      .update(params)
      .promise()
      .then(() => {
        logger.info(`Successfully updated DynamoDB record`)
      })
      .catch((e) => {
        logger.error(`Failed to update DynamoDB record: ${e}`)
      })

    // Return data to client with download link in header
    return Message.noContent({
      'x-terraform-get': url,
    })
  } catch (e) {
    logger.error(`Failed to generate pre-signed URL: ${e}`)
    return Message.error(`Failed to generate pre-signed URL`)
  }
}
