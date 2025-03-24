import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CheckoutForm.css'

const CheckoutForm = ({ orderId, clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  const [message, setMessage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [saveCard, setSaveCard] = useState(false)

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return
    }

    // Kiểm tra trạng thái payment intent
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log('Payment Intent Status:', paymentIntent.status)
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Thanh toán đã hoàn tất!')
          // Xử lý cập nhật trạng thái đơn hàng sau khi thanh toán thành công
          confirmPaymentSuccess(paymentIntent.id, paymentIntent.payment_method)
          break
        case 'processing':
          setMessage('Đang xử lý thanh toán của bạn.')
          break
        case 'requires_payment_method':
          setMessage('Vui lòng nhập thông tin thẻ và nhấn "Thanh toán ngay"')
          break
        default:
          setMessage('Đã xảy ra lỗi.')
          break
      }
    })
  }, [stripe, orderId, navigate, clientSecret])

  // Gọi API confirmPayment khi thanh toán thành công
  const confirmPaymentSuccess = async (paymentIntentId, paymentMethodId) => {
    try {
      console.log('Xác nhận thanh toán với:', { paymentIntentId, paymentMethodId, orderId })
      const response = await axios.post(
        `http://localhost:4000/orders/${orderId}/payment/confirm`,
        {
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethodId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      )

      console.log('Kết quả xác nhận thanh toán:', response.data)

      if (response.data && response.data.result) {
        setMessage('Thanh toán thành công! Đang chuyển hướng...')
        // Chuyển hướng tới trang trạng thái đơn hàng
        setTimeout(() => {
          navigate(`/order/status/${orderId}`)
        }, 3000) // Tăng thời gian lên 3 giây
      } else {
        console.error('Lỗi response:', response.data)
        setMessage('Cập nhật đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.')
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận thanh toán:', error.response?.data || error.message)
      setMessage('Thanh toán thành công nhưng cập nhật đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    // Xác nhận thanh toán
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: 'Khách hàng Luna Spa'
          },
          save_payment_method: saveCard
        }
      }
    })

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message)
      } else {
        setMessage('Đã xảy ra lỗi không mong muốn')
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Thanh toán thành công! Đang cập nhật đơn hàng...')
      // Gọi hàm cập nhật đơn hàng
      await confirmPaymentSuccess(paymentIntent.id, paymentIntent.payment_method)
    }

    setIsProcessing(false)
  }

  const handleSaveCardChange = (e) => {
    setSaveCard(e.target.checked)
  }

  return (
    <form className='checkout-form' onSubmit={handleSubmit}>
      <div className='form-header'>
        <h3>Thông tin thẻ</h3>
        <p>Vui lòng nhập thông tin thẻ của bạn</p>
      </div>

      <div className='payment-element-container'>
        <PaymentElement />
      </div>

      {message && (
        <div
          className={`payment-message ${message.includes('thành công') ? 'success' : message.includes('xử lý') ? 'processing' : 'error'}`}
        >
          {message}
        </div>
      )}

      <div className='save-card-option'>
        <input type='checkbox' id='save-card' checked={saveCard} onChange={handleSaveCardChange} />
        <label htmlFor='save-card'>Lưu thông tin thẻ này cho lần sau</label>
      </div>

      <button className='pay-button' disabled={isProcessing || !stripe || !elements}>
        {isProcessing ? (
          <span className='button-text'>
            <div className='spinner'></div>
            Đang xử lý...
          </span>
        ) : (
          `Thanh toán ngay`
        )}
      </button>
    </form>
  )
}

export default CheckoutForm
