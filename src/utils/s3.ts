import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import fs from 'fs'
import { envConfig } from '~/constants/config'
config()
const s3 = new S3({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})
export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: envConfig.s3Bucket as string,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}
