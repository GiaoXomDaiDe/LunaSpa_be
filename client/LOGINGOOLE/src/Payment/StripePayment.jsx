import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import { useEffect, useState } from 'react'
import './StripePayment.css'

// Khởi tạo Stripe với publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Component chứa form thanh toán
const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savingCard, setSavingCard] = useState(true)

  useEffect(() => {
    if (!stripe) {
      return
    }

    // Kiểm tra xem có lỗi từ URL redirect không
    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Thanh toán thành công!')
          break
        case 'processing':
          setMessage('Đang xử lý thanh toán của bạn.')
          break
        case 'requires_payment_method':
          setMessage('Thanh toán không thành công, vui lòng thử lại.')
          break
        default:
          setMessage('Có lỗi xảy ra.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
        setup_future_usage: savingCard ? 'off_session' : undefined,
        payment_method_data: {
          billing_details: {
            name: 'Nguyen Van A', // Thay thành thông tin thực tế của người dùng
            email: 'test@example.com'
          }
        }
      }
    })

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('Có lỗi không xác định xảy ra.')
    }

    setIsLoading(false)
  }

  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <h2>Thanh toán đơn hàng</h2>
      <PaymentElement
        id='payment-element'
        options={{
          fields: {
            billingDetails: {
              name: 'never', // Ẩn trường tên vì chúng ta đã cung cấp
              email: 'never' // Ẩn trường email vì chúng ta đã cung cấp
            }
          }
        }}
      />

      <div className='save-card-option'>
        <input type='checkbox' id='save-card' checked={savingCard} onChange={(e) => setSavingCard(e.target.checked)} />
        <label htmlFor='save-card'>Lưu thông tin thẻ để thanh toán sau này</label>
      </div>

      <button disabled={isLoading || !stripe || !elements} id='submit'>
        <span id='button-text'>{isLoading ? <div className='spinner' id='spinner'></div> : 'Thanh toán ngay'}</span>
      </button>

      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}

// Component chính
export default function StripePayment() {
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Gọi API để tạo PaymentIntent
    const createPaymentIntent = async () => {
      try {
        setLoading(true)
        // Thay đổi URL tùy theo API backend của bạn
        const response = await axios.post('http://localhost:4000/orders/create-payment-intent', {
          amount: 1000000, // Số tiền (VNĐ)
          customer_email: 'test@example.com', // Email khách hàng
          metadata: {
            order_id: 'ORDER_123',
            customer_id: 'CUSTOMER_123'
          }
        })
        setClientSecret(response.data.clientSecret)
      } catch (err) {
        setError('Không thể khởi tạo thanh toán. Vui lòng thử lại sau.')
        console.error('Error creating payment intent:', err)
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [])

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#6772e5',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      }
    }
  }

  if (loading) {
    return <div className='loading'>Đang tải...</div>
  }

  if (error) {
    return <div className='error-message'>{error}</div>
  }

  return (
    <div className='stripe-payment-container'>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  )
}
