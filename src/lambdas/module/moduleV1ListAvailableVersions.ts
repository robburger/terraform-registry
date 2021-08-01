import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'

import { ModuleVersionList, ModuleVersion } from '../../models'
import { AWS, Logger, Message } from '../../utils'

const logger = new Logger()

const ddb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const module = `${event.pathParameters?.namespace}/${event.pathParameters?.name}/${event.pathParameters?.provider}`

  logger.info(`Generating version list for module: ${module}`)

  // Build DynamoDB params object
  const params: DocumentClient.QueryInput = {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': module,
    },
    TableName: process.env.DYNAMODB_TABLE_NAME_MODULES,
  }
  return ddb
    .query(params)
    .promise()
    .then((result) => {
      logger.info(`Number of versions available for ${module}: ${result.Count}`)

      if (result.Count !== 0) {
        // Build an array based on each item's version attribute
        const versions: ModuleVersion[] = []
        result.Items.forEach((item) => {
          versions.push({ version: item.version })
        })

        // Build final object
        const versionList: ModuleVersionList = {
          modules: [
            {
              source: module,
              versions: versions,
            },
          ],
        }

        // Return data to client
        logger.info(`Sending version list to client`)
        return Message.success(versionList)
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
