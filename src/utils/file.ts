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
    maxFiles: 5, // Chỉ cho phép upload tối đa 5 file
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

      // Nếu chỉ có 1 file, chuyển thành mảng
      const imageFiles = Array.isArray(files.image) ? files.image : [files.image]

      // Đảm bảo file đang không bị chiếm dụng trước khi trả về
      setTimeout(() => {
        resolve(imageFiles)
      }, 100) // Thêm delay 100ms để đảm bảo file handle đã được giải phóng
    })
  })
}

// Hàm xử lý upload file Excel
export const handleUploadExcel = async (req: Request) => {
  // Tạo thư mục uploads nếu chưa tồn tại
  const uploadDir = 'uploads'
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Khởi tạo formidable với các cấu hình
  const form = formidable({
    uploadDir, // Thư mục lưu file upload
    maxFiles: 1, // Chỉ cho phép upload 1 file
    keepExtensions: true, // Giữ lại đuôi file gốc
    maxFileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
    // Hàm filter để kiểm tra loại file
    filter: function ({ name, originalFilename, mimetype }) {
      // Kiểm tra phải là file excel
      const valid =
        name === 'file' &&
        (originalFilename?.endsWith('.xlsx') ||
          originalFilename?.endsWith('.xls') ||
          mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          mimetype === 'application/vnd.ms-excel')

      // Nếu không hợp lệ, emit error
      if (!valid) {
        form.emit('error' as any, new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)') as any)
      }
      return valid
    }
  })

  // Trả về Promise để xử lý bất đồng bộ
  return new Promise<File>((resolve, reject) => {
    // Parse request để lấy file
    form.parse(req, (err, fields, files) => {
      // Nếu có lỗi, reject promise với lỗi đó
      if (err) {
        return reject(err)
      }

      // Kiểm tra nếu không có file nào được upload
      if (!files.file || (Array.isArray(files.file) && files.file.length === 0)) {
        return reject(new Error('Vui lòng chọn file Excel để import'))
      }

      // Lấy file đầu tiên nếu là mảng
      const excelFile = Array.isArray(files.file) ? files.file[0] : files.file

      // Nếu mọi thứ ok, resolve với thông tin file
      resolve(excelFile)
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}
