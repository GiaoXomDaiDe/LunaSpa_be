import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { OrderStatus } from '~/models/schema/Order.schema'
import ordersService from '~/services/orders.services'
import qrCodeService from '~/services/qrcode.services'

/**
 * Controller xác thực đơn đặt lịch thông qua mã QR
 * QR code chứa booking_id và các thông tin khác để xác thực
 */
export const verifyBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.params
    const { signature } = req.query // Signature có thể được truyền trong query param

    // Lấy thông tin đơn hàng
    const order = await ordersService.getOrderById(order_id)

    // Kiểm tra xem đơn hàng có phải đơn dịch vụ không (có booking_time)
    if (!order.booking_time) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Đây không phải đơn đặt lịch dịch vụ'
      })
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.COMPLETED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Đơn đặt lịch không ở trạng thái hợp lệ để xác thực',
        status: order.status
      })
    }

    // Nếu có signature, thực hiện xác thực
    if (signature) {
      const booking_time = new Date(order.booking_time)
      const isValid = qrCodeService.verifySignature(order_id, booking_time, signature as string)

      if (!isValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Chữ ký không hợp lệ, QR code có thể đã bị sửa đổi'
        })
      }
    }

    // Lấy thông tin chi tiết về người dùng, slot, dịch vụ
    const bookingInfo = {
      order_id: order._id,
      customer: {
        id: order.customer_account_id,
        name: order.customer?.name || 'Khách hàng',
        email: order.customer?.email
      },
      service: order.items[0]?.item_name || 'Dịch vụ Spa',
      booking_time: order.booking_time,
      start_time: order.start_time,
      end_time: order.end_time,
      staff: order.items[0]?.staff_name || 'Nhân viên Spa',
      branch: order.branch?.name || 'Chi nhánh Luna Spa',
      status: order.status
    }

    // Cập nhật trạng thái đơn hàng thành COMPLETED nếu chưa hoàn thành
    // Đây là bước khách hàng đến sử dụng dịch vụ
    if (order.status !== OrderStatus.COMPLETED) {
      await ordersService.updateOrderStatus(order_id, OrderStatus.COMPLETED)
      bookingInfo.status = OrderStatus.COMPLETED
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Xác thực đơn đặt lịch thành công',
      data: bookingInfo
    })
  } catch (error) {
    console.error('Error verifying booking:', error)
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Không tìm thấy đơn đặt lịch hoặc đã xảy ra lỗi',
      error: (error as Error).message
    })
  }
}
