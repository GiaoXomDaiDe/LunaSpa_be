import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const orderId = searchParams.get('order_id')

  const handleRetry = () => {
    navigate(`/checkout/${orderId}`)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className='payment-result cancel'>
      <div className='cancel-icon'>✕</div>
      <h2>Thanh toán bị hủy</h2>
      <p>Bạn đã hủy quá trình thanh toán.</p>
      <div className='action-buttons'>
        <button className='retry-button' onClick={handleRetry}>
          Thử lại
        </button>
        <button className='home-button' onClick={handleBackToHome}>
          Quay về trang chủ
        </button>
      </div>
    </div>
  )
}

export default PaymentCancel
