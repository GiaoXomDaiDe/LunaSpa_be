import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { Request } from 'express'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { Media } from '~/models/Media'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: newFullFilename,
          filepath: newPath,
          contentType: (await import('mime')).default.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
