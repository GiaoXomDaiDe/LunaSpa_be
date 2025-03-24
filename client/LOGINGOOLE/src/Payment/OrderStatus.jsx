import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './OrderStatus.css'

const OrderStatus = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  useEffect(() => {
    // Gọi API để lấy thông tin đơn hàng
    const fetchOrderStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (response.data && response.data.result) {
          setOrder(response.data.result)
        } else {
          setError('Không tìm thấy thông tin đơn hàng')
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', err)
        setError('Không thể lấy thông tin đơn hàng. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderStatus()
    }
  }, [orderId])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Thêm hàm hủy đơn hàng
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đơn hàng')
      return
    }

    setCancelLoading(true)
    setCancelError(null)

    try {
      const response = await axios.post(
        `http://localhost:4000/orders/${orderId}/cancel`,
        { cancel_reason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      )

      if (response.data) {
        // Cập nhật lại thông tin đơn hàng sau khi hủy
        const updatedOrder = await axios.get(`http://localhost:4000/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (updatedOrder.data && updatedOrder.data.result) {
          setOrder(updatedOrder.data.result)
        }

        // Đóng dialog
        setShowCancelDialog(false)
        setCancelReason('')
      }
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err)
      setCancelError(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return <div className='loading'>Đang tải thông tin đơn hàng...</div>
  }

  if (error) {
    return <div className='error-message'>{error}</div>
  }

  if (!order) {
    return <div className='error-message'>Không tìm thấy thông tin đơn hàng</div>
  }

  // Kiểm tra xem đơn hàng có thể hủy hay không
  const canCancel = order.status === 'pending' || order.status === 'PENDING'

  // Hiển thị trạng thái thanh toán dựa trên trạng thái từ đơn hàng
  const getPaymentStatusUI = () => {
    // Lấy trạng thái thanh toán từ đơn hàng
    const orderStatus = order.status

    switch (orderStatus) {
      case 'CONFIRMED':
      case 'confirmed':
        return (
          <div className='payment-status success'>
            <div className='status-icon'>✅</div>
            <div className='status-text'>
              <h3>Thanh toán thành công</h3>
              <p>Cảm ơn bạn đã đặt hàng. Đơn hàng đang được xử lý.</p>
            </div>
          </div>
        )
      case 'COMPLETED':
      case 'completed':
        return (
          <div className='payment-status success'>
            <div className='status-icon'>✅</div>
            <div className='status-text'>
              <h3>Đơn hàng đã hoàn thành</h3>
              <p>Đơn hàng của bạn đã được hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            </div>
          </div>
        )
      case 'PROCESSING':
      case 'processing':
        return (
          <div className='payment-status processing'>
            <div className='status-icon'>🔄</div>
            <div className='status-text'>
              <h3>Đang xử lý</h3>
              <p>Đơn hàng của bạn đang được xử lý. Vui lòng đợi trong giây lát.</p>
            </div>
          </div>
        )
      case 'PENDING':
      case 'pending':
        return (
          <div className='payment-status pending'>
            <div className='status-icon'>⏳</div>
            <div className='status-text'>
              <h3>Chờ thanh toán</h3>
              <p>Đơn hàng của bạn đang chờ thanh toán.</p>
              {canCancel && (
                <button className='cancel-order-btn' onClick={() => setShowCancelDialog(true)}>
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        )
      case 'CANCELLED':
      case 'cancelled':
        return (
          <div className='payment-status cancelled'>
            <div className='status-icon'>❌</div>
            <div className='status-text'>
              <h3>Đơn hàng đã bị hủy</h3>
              <p>Đơn hàng của bạn đã bị hủy.</p>
              {order.note && <p>Lý do: {order.note}</p>}
            </div>
          </div>
        )
      case 'FAILED':
      case 'failed':
        return (
          <div className='payment-status failed'>
            <div className='status-icon'>❌</div>
            <div className='status-text'>
              <h3>Thanh toán thất bại</h3>
              <p>Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
              <Link to={`/checkout/retry/${orderId}`} className='retry-payment'>
                Thử lại thanh toán
              </Link>
            </div>
          </div>
        )
      default:
        return (
          <div className='payment-status unknown'>
            <div className='status-icon'>❓</div>
            <div className='status-text'>
              <h3>Trạng thái không xác định</h3>
              <p>Không thể xác định trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.</p>
              <p>Trạng thái đơn hàng: {orderStatus}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className='order-status-container'>
      <div className='order-status-header'>
        <h2>Trạng thái đơn hàng</h2>
        <p className='order-id'>Mã đơn hàng: {order.order_id || orderId}</p>
      </div>

      <div className='order-status-content'>
        {getPaymentStatusUI()}

        <div className='order-details'>
          <h3>Chi tiết đơn hàng</h3>
          <div className='order-info'>
            <div className='info-row'>
              <span className='info-label'>Ngày đặt:</span>
              <span className='info-value'>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
            </div>
            <div className='info-row'>
              <span className='info-label'>Tổng tiền:</span>
              <span className='info-value'>{formatCurrency(order.final_price || order.total_amount || 0)}</span>
            </div>
            <div className='info-row'>
              <span className='info-label'>Phương thức thanh toán:</span>
              <span className='info-value'>
                {order.payment_method === 'stripe'
                  ? 'Thẻ tín dụng/Ghi nợ (Stripe)'
                  : order.payment_method === 'momo'
                    ? 'Ví điện tử MoMo'
                    : order.payment_method || 'Không xác định'}
              </span>
            </div>
            {order.note && (
              <div className='info-row'>
                <span className='info-label'>Ghi chú:</span>
                <span className='info-value'>{order.note}</span>
              </div>
            )}
          </div>
        </div>

        <div className='next-actions'>
          <Link to='/' className='action-button primary'>
            Về trang chủ
          </Link>
          <Link to='/products' className='action-button secondary'>
            Tiếp tục mua sắm
          </Link>
          {canCancel && (
            <button onClick={() => setShowCancelDialog(true)} className='action-button cancel'>
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* Modal hủy đơn hàng */}
      {showCancelDialog && (
        <div className='cancel-order-modal'>
          <div className='cancel-order-content'>
            <h3>Xác nhận hủy đơn hàng</h3>
            <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>

            <div className='cancel-reason-form'>
              <label htmlFor='cancel-reason'>Lý do hủy đơn hàng:</label>
              <textarea
                id='cancel-reason'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder='Vui lòng nhập lý do hủy đơn hàng'
                disabled={cancelLoading}
              ></textarea>
              {cancelError && <div className='cancel-error'>{cancelError}</div>}
            </div>

            <div className='cancel-actions'>
              <button onClick={() => setShowCancelDialog(false)} className='cancel-button' disabled={cancelLoading}>
                Đóng
              </button>
              <button onClick={handleCancelOrder} className='confirm-button' disabled={cancelLoading}>
                {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStatus
