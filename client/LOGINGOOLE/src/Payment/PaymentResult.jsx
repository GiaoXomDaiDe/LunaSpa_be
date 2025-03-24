import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PaymentResult.css'

const PaymentResult = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState({
    success: false,
    orderId: null,
    message: ''
  })

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy tham số từ URL
        const queryParams = new URLSearchParams(window.location.search)
        const resultCode = queryParams.get('resultCode')
        const orderId = queryParams.get('orderId')
        const message = queryParams.get('message')

        // resultCode=0 là thành công, khác 0 là thất bại
        const success = resultCode === '0'

        // Nếu có orderId, xác nhận kết quả thanh toán với server
        if (orderId) {
          // Trích xuất orderId thực từ momo_order_id
          const parts = orderId.split('-')
          const realOrderId = parts.length >= 3 ? parts[1] : null

          if (realOrderId) {
            // Gọi API xác nhận thanh toán
            await axios.post(
              `http://localhost:4000/orders/${realOrderId}/payment/confirm`,
              {
                payment_intent_id: queryParams.get('requestId') || '',
                payment_method_id: 'momo'
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
              }
            )

            // Cập nhật kết quả
            setResult({
              success,
              orderId: realOrderId,
              message: message || (success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!')
            })

            // Nếu thành công, tự động chuyển hướng sau 3 giây
            if (success) {
              setTimeout(() => {
                navigate(`/order/status/${realOrderId}`)
              }, 3000)
            }
          } else {
            setResult({
              success: false,
              orderId: null,
              message: 'Mã đơn hàng không hợp lệ'
            })
          }
        } else {
          setResult({
            success: false,
            orderId: null,
            message: 'Không có thông tin đơn hàng'
          })
        }
      } catch (error) {
        console.error('Lỗi xử lý kết quả thanh toán:', error)
        setResult({
          success: false,
          orderId: null,
          message: 'Đã xảy ra lỗi khi xử lý kết quả thanh toán'
        })
      } finally {
        setLoading(false)
      }
    }

    processPaymentResult()
  }, [navigate])

  if (loading) {
    return (
      <div className='payment-result loading'>
        <div className='spinner'></div>
        <p>Đang xử lý kết quả thanh toán...</p>
      </div>
    )
  }

  return (
    <div className={`payment-result ${result.success ? 'success' : 'failure'}`}>
      <div className='result-icon'>
        {result.success ? <i className='fas fa-check-circle'></i> : <i className='fas fa-times-circle'></i>}
      </div>

      <h2>{result.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}</h2>

      <p className='result-message'>{result.message}</p>

      {result.orderId && (
        <p className='order-id'>
          Mã đơn hàng: <strong>{result.orderId}</strong>
        </p>
      )}

      <div className='result-actions'>
        {result.success ? (
          <p>Bạn sẽ được chuyển đến trang chi tiết đơn hàng trong vài giây...</p>
        ) : (
          <button className='retry-button' onClick={() => window.history.back()}>
            Quay lại và thử lại
          </button>
        )}

        <button className='home-button' onClick={() => navigate('/')}>
          Về trang chủ
        </button>
      </div>
    </div>
  )
}

export default PaymentResult
