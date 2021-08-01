import { GetObjectRequest, TagSet } from 'aws-sdk/clients/s3'

import { AWS } from './'

export class S3 {
  /**
   * Gets the specified S3 file
   * @param bucket Name of the bucket containing the file
   * @param key Key of the file to be fetched
   */
  public static async getFile(bucket: string, key: string): Promise<string> {
    const s3 = new AWS.S3()
    const params: GetObjectRequest = {
      Bucket: bucket,
      Key: key,
    }

    return (await s3.getObject(params).promise()).Body.toString('binary')
  }

  /**
   * Gets the tags of a specified S3 file
   * @param bucket Name of the bucket containing the file
   * @param key Key of the file to be fetched
   */
  public static async getFileTags(bucket: string, key: string): Promise<Record<string, string>> {
    const s3 = new AWS.S3()
    const params: GetObjectRequest = {
      Bucket: bucket,
      Key: key,
    }

    return S3.tagToObject((await s3.getObjectTagging(params).promise()).TagSet)
  }

  /**
   * Changes the specified AWS TagSet into an object
   * @param tagSet The AWS TagSet to mutate
   */
  private static tagToObject(tagSet: TagSet): Record<string, string> {
    const tags: Record<string, string> = {}
    tagSet.forEach((tag) => {
      tags[tag.Key] = tag.Value
    })
    return tags
  }
}
