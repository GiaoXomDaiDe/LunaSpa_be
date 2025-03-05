import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'

// Hàm khởi tạo thư mục uploads nếu chưa tồn tại
export const initUploadFolder = () => {
  // Kiểm tra nếu thư mục chưa tồn tại
  if (!fs.existsSync(UPLOAD_IMAGE_TEMP_DIR)) {
    // Tạo thư mục mới với option recursive cho phép tạo nested folders
    fs.mkdirSync(UPLOAD_IMAGE_TEMP_DIR, {
      recursive: true
    })
  }
}

// Hàm xử lý upload nhiều file ảnh hoặc 1 file ảnh
export const handleUploadImage = async (req: Request) => {
  // Khởi tạo formidable với các cấu hình
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR, // Thư mục lưu file upload
    maxFiles: 5, // Chỉ cho phép upload 1 file
    keepExtensions: true, // Giữ lại đuôi file gốc
    maxFileSize: 500 * 1024, // Giới hạn kích thước file 500KB
    maxTotalFileSize: 500 * 1024 * 5,
    // Hàm filter để kiểm tra loại file
    filter: function ({ name, originalFilename, mimetype }) {
      // Kiểm tra file phải có name là 'image' và mimetype phải chứa 'image/'
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      // Nếu không hợp lệ, emit error
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })

  // Trả về Promise để xử lý bất đồng bộ
  return new Promise<File[]>((resolve, reject) => {
    // Parse request để lấy file
    form.parse(req, (err, fields, files) => {
      // Nếu có lỗi, reject promise với lỗi đó
      if (err) {
        return reject(err)
      }

      // Kiểm tra nếu không có file image nào được upload
      if (!files.image) {
        return reject(new Error('File is empty'))
      }

      // Nếu mọi thứ ok, resolve với thông tin files
      resolve(files.image as File[])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}
