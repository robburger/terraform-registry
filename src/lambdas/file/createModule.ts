import { S3Event, S3EventRecord, SQSEvent } from 'aws-lambda'

import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import { createHash } from 'crypto'

import { CreateModuleDTO } from '../../models/dto'
import { AWS, Logger, S3 } from '../../utils'

const logger = new Logger()

const ddb = new AWS.DynamoDB.DocumentClient()

export const handler = async (event: SQSEvent): Promise<void> => {
  const body: S3Event = JSON.parse(event.Records[0].body)
  const record: S3EventRecord = body.Records[0]

  const region: string = record.awsRegion
  const bucket: string = record.s3?.bucket?.name
  const key: string = record.s3?.object?.key
  const path: string[] = key.split('/')

  logger.info(`Processing S3 object: ${bucket}/${key}`)

  if (path.length !== 6) {
    logger.error(`Unable to parse object key. Expecting 6 parts, got ${path.length}`)
  } else if (path[path.length - 1] !== 'module.zip') {
    logger.error(`Unable to find 'module.zip' file`)
  } else {
    try {
      // Get file and tags from S3
      const file: string = await S3.getFile(bucket, key)
      const tags: Record<string, string> = await S3.getFileTags(bucket, key)

      // Build DynamoDB item object
      const item: CreateModuleDTO = {
        id: `${path[1]}/${path[2]}/${path[3]}`,
        owner: tags.owner || 'shared',
        namespace: path[1],
        name: path[2],
        version: path[4],
        provider: path[3],
        description: tags.description || '',
        location: `${bucket}.s3.${region}.amazonaws.com/${key}`,
        checksum: createHash('md5').update(file).digest('hex'),
        downloads: 0,
        published_at: Date.now(),
      }

      // Build DynamoDB params object
      const params: DocumentClient.PutItemInput = {
        TableName: process.env.DYNAMODB_TABLE_NAME_MODULES,
        Item: item,
      }

      // Save module metadata to DynamoDB
      await ddb
        .put(params)
        .promise()
        .then(() => {
          logger.info(`Successfully created DynamoDB record`)
        })
        .catch((e) => {
          logger.error(`Failed to create DynamoDB record: ${e}`)
        })
    } catch (e) {
      logger.error(`Failed to get module from S3: ${e}`)
    }
  }
}
