import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import QRCode from 'qrcode'
import { envConfig } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { uploadFileToS3 } from '~/utils/s3'

class QRCodeService {
  /**
   * Tạo QR code dạng base64 string
   * @param data Dữ liệu để tạo QR code
   */
  async generateQRCodeAsDataURL(data: string): Promise<string> {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 1
    })
  }

  /**
   * Tạo QR code chứa thông tin đặt lịch
   * @param order_id ID đơn đặt lịch
   * @param staff_name Tên nhân viên
   * @param service_name Tên dịch vụ
   * @param booking_time Thời gian đặt lịch
   * @param branch_name Tên chi nhánh
   */
  async generateBookingQRCode(
    order_id: string,
    staff_name: string,
    service_name: string,
    booking_time: Date,
    branch_name: string
  ): Promise<string> {
    const bookingData = JSON.stringify({
      id: order_id,
      staff: staff_name,
      service: service_name,
      time: booking_time.toISOString(),
      branch: branch_name,
      verifyUrl: `${envConfig.clientUrl}/bookings/verify/${order_id}`,
      signature: this.generateSignature(order_id, booking_time)
    })

    return this.generateQRCodeAsDataURL(bookingData)
  }

  /**
   * Tạo chữ ký để xác thực QR code
   * @param order_id ID đơn đặt lịch
   * @param booking_time Thời gian đặt lịch
   * @returns Chữ ký xác thực
   */
  private generateSignature(order_id: string, booking_time: Date): string {
    const data = `${order_id}-${booking_time.toISOString()}-${envConfig.jwtSecret}`
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Xác thực chữ ký của QR code
   * @param order_id ID đơn đặt lịch
   * @param booking_time Thời gian đặt lịch
   * @param signature Chữ ký cần xác thực
   * @returns true nếu chữ ký hợp lệ
   */
  verifySignature(order_id: string, booking_time: Date, signature: string): boolean {
    const expectedSignature = this.generateSignature(order_id, booking_time)
    return expectedSignature === signature
  }

  async generatePaymentQRCode(order_id: string, amount: number, description: string): Promise<string> {
    const paymentData = JSON.stringify({
      id: order_id,
      amount,
      description,
      paymentUrl: `${envConfig.clientUrl}/payment/${order_id}`
    })

    return this.generateQRCodeAsDataURL(paymentData)
  }

  /**
   * Chuyển đổi QR code từ base64 sang ảnh, upload lên S3 và trả về URL
   * @param qrDataURL QR code dạng base64 data URL
   * @param prefix Tiền tố cho tên file (mặc định là "qr")
   */
  async saveQRCodeAsImage(qrDataURL: string, prefix: string = 'qr'): Promise<string> {
    console.log('==== Start saveQRCodeAsImage ====')
    console.log('Prefix:', prefix)

    if (!qrDataURL || qrDataURL.length < 100) {
      console.error('QR data URL is invalid or too short')
      throw new Error('Invalid QR code data URL')
    }

    try {
      // Tạo tên file ngẫu nhiên
      const randomString = crypto.randomBytes(8).toString('hex')
      const filename = `${prefix}-${randomString}.png`
      const filepath = path.resolve(UPLOAD_IMAGE_DIR, filename)

      console.log('Generated filename:', filename)
      console.log('Full filepath:', filepath)
      console.log('Upload directory:', UPLOAD_IMAGE_DIR)

      // Đảm bảo thư mục tồn tại
      if (!fs.existsSync(UPLOAD_IMAGE_DIR)) {
        console.log('Creating upload directory...')
        fs.mkdirSync(UPLOAD_IMAGE_DIR, { recursive: true })
      }

      // Kiểm tra quyền ghi vào thư mục
      try {
        fs.accessSync(UPLOAD_IMAGE_DIR, fs.constants.W_OK)
        console.log('Directory is writable')
      } catch (accessError) {
        console.error('Directory is not writable:', accessError)
        throw new Error('Upload directory is not writable')
      }

      // Chuyển base64 thành buffer
      console.log('Converting base64 to buffer...')
      const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      console.log('Buffer size:', buffer.length, 'bytes')

      // Ghi file
      console.log('Writing file to disk...')
      fs.writeFileSync(filepath, buffer)
      console.log('File written successfully')

      // Upload lên S3
      console.log('Uploading to S3...')
      const s3Result = await uploadFileToS3({
        filename,
        filepath,
        contentType: 'image/png'
      })

      console.log('S3 upload result:', s3Result)
      if (!s3Result || !s3Result.Location) {
        console.error('S3 upload completed but returned no Location URL')
        throw new Error('S3 upload failed to return URL')
      }

      // Xóa file tạm sau khi upload
      try {
        console.log('Deleting temporary file...')
        fs.unlinkSync(filepath)
        console.log('Temporary file deleted')
      } catch (unlinkError) {
        console.error('Error deleting temporary QR code file:', unlinkError)
        // Tiếp tục xử lý vì đây không phải lỗi nghiêm trọng
      }

      console.log('Final S3 URL:', s3Result.Location)
      console.log('==== End saveQRCodeAsImage ====')

      // Trả về URL của ảnh
      return s3Result.Location as string
    } catch (error) {
      console.error('Error in saveQRCodeAsImage:', error)

      // Nếu không thể upload, trả về URL tạm thời để test UI
      if (envConfig.nodeEnv === 'development') {
        const testUrl = `${envConfig.clientUrl}/test-qr-image.png`
        console.log('Returning test URL for development:', testUrl)
        return testUrl
      }

      throw new Error(`Failed to save QR code image: ${(error as Error).message || 'Unknown error'}`)
    }
  }
}

const qrCodeService = new QRCodeService()
export default qrCodeService
