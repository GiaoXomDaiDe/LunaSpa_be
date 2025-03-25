import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { Request } from 'express'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'
import { Media } from '~/models/Media'
import { getNameFromFullname, handleUploadImage } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = []

    for (const file of files) {
      try {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)

        // Chuyển đổi file sang jpg
        await sharp(file.filepath).jpeg().toFile(newPath)

        // Upload file lên S3
        const s3Result = await uploadFileToS3({
          filename: newFullFilename,
          filepath: newPath,
          contentType: (await import('mime')).default.getType(newPath) as string
        })

        // Thêm thời gian trễ trước khi xóa file để đảm bảo các tiến trình khác đã giải phóng file
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Xử lý xóa file an toàn
        try {
          // Xóa file tạm và file đã chuyển đổi
          await Promise.all([
            fsPromise.unlink(file.filepath).catch((err) => console.error('Error deleting temp file:', err)),
            fsPromise.unlink(newPath).catch((err) => console.error('Error deleting processed file:', err))
          ])
        } catch (unlinkError) {
          console.error('Failed to delete files, but upload successful:', unlinkError)
          // Không throw lỗi, vì việc upload đã thành công
        }

        result.push({
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string
        })
      } catch (error) {
        console.error('Error processing file', file.newFilename, error)
        // Tiếp tục xử lý các file khác
      }
    }

    // Lên lịch dọn dẹp thư mục tạm sau một thời gian
    setTimeout(() => {
      this.cleanupTempFiles().catch((err) => console.error('Error cleaning temp directory:', err))
    }, 5000)

    return result
  }

  // Hàm dọn dẹp các file tạm còn sót lại
  private async cleanupTempFiles() {
    try {
      const files = await fsPromise.readdir(UPLOAD_IMAGE_TEMP_DIR)
      // Xóa các file tạm đã tồn tại quá 1 giờ
      const oneHourAgo = Date.now() - 60 * 60 * 1000

      for (const file of files) {
        try {
          const filePath = path.join(UPLOAD_IMAGE_TEMP_DIR, file)
          const stats = await fsPromise.stat(filePath)

          if (stats.isFile() && stats.mtimeMs < oneHourAgo) {
            await fsPromise.unlink(filePath).catch(() => {})
          }
        } catch (err) {
          // Bỏ qua lỗi với file cụ thể
        }
      }
    } catch (err) {
      console.error('Error while cleaning temp directory:', err)
    }
  }
}

const mediasService = new MediasService()

export default mediasService
