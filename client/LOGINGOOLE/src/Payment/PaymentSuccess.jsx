import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [, setOrder] = useState(null)

  const orderId = searchParams.get('order_id')

  useEffect(() => {
    const getOrderStatus = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`http://localhost:4000/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (response.data && response.data.result) {
          setOrder(response.data.result)
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin đơn hàng:', error)
      } finally {
        setLoading(false)
      }
    }

    getOrderStatus()

    // Chuyển hướng sau 5 giây
    const timer = setTimeout(() => {
      navigate(`/order/status/${orderId}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [orderId, navigate])

  if (loading) {
    return (
      <div className='payment-result success'>
        <div className='loading-spinner'></div>
        <h2>Đang xác nhận thanh toán...</h2>
      </div>
    )
  }

  return (
    <div className='payment-result success'>
      <div className='success-icon'>✓</div>
      <h2>Thanh toán thành công!</h2>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của Luna Spa.</p>
      <p>Mã đơn hàng: {orderId}</p>
      <p>Đang chuyển hướng đến trang trạng thái đơn hàng...</p>
    </div>
  )
}

export default PaymentSuccess
