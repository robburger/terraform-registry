import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { Module } from '../../models'
import { AWS, Logger, Message } from '../../utils'

const logger = new Logger()

const ddb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const module = `${event.pathParameters?.namespace}/${event.pathParameters?.name}/${event.pathParameters?.provider}`
  const majorVersion = event.queryStringParameters?.version

  logger.info(`Getting latest version for module: ${module}`)

  // Build DynamoDB params object
  const ExpressionAttributeValues: Record<string, string> = {}
  ExpressionAttributeValues[':id'] = module
  if (event.queryStringParameters?.version) ExpressionAttributeValues[':version'] = majorVersion

  let KeyConditionExpression = 'id = :id'
  if (event.queryStringParameters?.version) KeyConditionExpression = 'id = :id AND begins_with(version, :version)'

  const params: DocumentClient.QueryInput = {
    KeyConditionExpression,
    ExpressionAttributeValues,
    TableName: process.env.DYNAMODB_TABLE_NAME_MODULES,
    ScanIndexForward: false,
    Limit: 1,
  }

  return ddb
    .query(params)
    .promise()
    .then((result) => {
      logger.info(`Found latest version for ${module}: ${result.Items[0].version}`)

      if (result.Count !== 0) {
        // Build final object
        const moduleReply: Module = {
          id: result.Items[0].id,
          owner: result.Items[0].owner,
          namespace: result.Items[0].namespace,
          name: result.Items[0].name,
          version: result.Items[0].version,
          provider: result.Items[0].provider,
          description: result.Items[0].description,
          location: result.Items[0].location,
          checksum: result.Items[0].checksum,
          published_at: result.Items[0].published_at,
          downloads: result.Items[0].downloads,
          last_downloaded_at: result.Items[0].last_downloaded_at,
          verified: result.Items[0].verified || false,
          root: {},
          submodules: [],
          examples: [],
          providers: [],
          versions: [],
        }

        // Return data to client
        logger.info(`Sending module to client: ${module}/${result.Items[0].version}`)
        return Message.success(moduleReply)
      } else {
        logger.info(`No versions found for module: ${module}`)
        return Message.notFound()
      }
    })
    .catch((e) => {
      logger.error(`Failed to read data from DynamoDB: ${e}`)
      return Message.notFound()
    })
}
