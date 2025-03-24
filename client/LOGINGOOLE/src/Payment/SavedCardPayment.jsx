import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useEffect, useState } from 'react'
import './SavedCardPayment.css'

export default function SavedCardPayment() {
  const [savedCards, setSavedCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const stripe = useStripe()

  useEffect(() => {
    // Lấy danh sách thẻ đã lưu của khách hàng
    const fetchSavedCards = async () => {
      try {
        const response = await axios.get('/api/saved-payment-methods')
        if (response.data && response.data.paymentMethods) {
          setSavedCards(response.data.paymentMethods)
        }
      } catch (err) {
        setError('Không thể tải thông tin thẻ đã lưu.')
        console.error('Error fetching saved cards:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedCards()
  }, [])

  const handleCardSelect = (card) => {
    setSelectedCard(card)
    setCvv('') // Reset CVV khi đổi thẻ
    setError(null)
  }

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!stripe || !selectedCard) {
      return
    }

    if (!cvv || cvv.length < 3) {
      setError('Vui lòng nhập mã CVV hợp lệ.')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Tạo payment intent với thẻ đã lưu
      const intentResponse = await axios.post('/api/create-payment-intent-with-saved-card', {
        payment_method_id: selectedCard.id,
        amount: 1000000, // Số tiền (VNĐ)
        customer_email: 'test@example.com',
        metadata: {
          order_id: 'ORDER_123',
          customer_id: 'CUSTOMER_123'
        }
      })

      const { client_secret: clientSecret } = intentResponse.data

      // Xác nhận thanh toán với CVV
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedCard.id,
        payment_method_options: {
          card: {
            cvc: cvv
          }
        }
      })

      if (error) {
        setError(`Thanh toán thất bại: ${error.message}`)
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Thanh toán thành công!')
        setCvv('')
      } else {
        setError('Thanh toán không thành công, vui lòng thử lại.')
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi xử lý thanh toán.')
      console.error('Payment error:', err)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className='loading'>Đang tải thông tin thẻ...</div>
  }

  if (savedCards.length === 0) {
    return (
      <div className='no-saved-cards'>
        <p>Bạn chưa lưu thẻ nào. Vui lòng thêm thẻ mới để thanh toán.</p>
        <button onClick={() => (window.location.href = '/payment')}>Thêm thẻ mới</button>
      </div>
    )
  }

  return (
    <div className='saved-card-payment'>
      <h2>Thanh toán bằng thẻ đã lưu</h2>

      <div className='saved-cards-list'>
        {savedCards.map((card) => (
          <div
            key={card.id}
            className={`card-item ${selectedCard && selectedCard.id === card.id ? 'selected' : ''}`}
            onClick={() => handleCardSelect(card)}
          >
            <div className='card-brand'>
              <img src={`/card-brands/${card.card.brand}.png`} alt={card.card.brand} />
            </div>
            <div className='card-details'>
              <span className='card-name'>{card.billing_details.name}</span>
              <span className='card-number'>**** **** **** {card.card.last4}</span>
              <span className='card-expiry'>
                Hết hạn: {card.card.exp_month}/{card.card.exp_year % 100}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <form onSubmit={handlePayment} className='cvv-form'>
          <div className='form-group'>
            <label htmlFor='cvv'>Nhập mã CVV:</label>
            <input
              type='password'
              id='cvv'
              maxLength='4'
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder='CVV'
              required
            />
            <small>Mã bảo mật 3-4 số ở mặt sau thẻ</small>
          </div>

          <button type='submit' disabled={processing || !cvv || cvv.length < 3}>
            {processing ? <div className='spinner' id='spinner'></div> : 'Thanh toán ngay'}
          </button>
        </form>
      )}

      {error && <div className='error-message'>{error}</div>}
      {message && <div className='success-message'>{message}</div>}
    </div>
  )
}
