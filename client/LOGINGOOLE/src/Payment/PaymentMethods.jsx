import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './PaymentMethods.css'

export default function PaymentMethods() {
  const [savedCards, setSavedCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) {
    return <div className='loading'>Đang tải...</div>
  }

  return (
    <div className='payment-methods-container'>
      <h2>Phương thức thanh toán</h2>

      <div className='payment-options'>
        <div className='payment-option'>
          <h3>Thẻ mới</h3>
          <p>Thêm thẻ mới để thanh toán</p>
          <Link to='/payment' className='payment-button'>
            Thêm thẻ mới
          </Link>
        </div>

        {savedCards.length > 0 && (
          <div className='payment-option'>
            <h3>Thẻ đã lưu</h3>
            <p>Thanh toán bằng thẻ đã lưu</p>
            <div className='saved-cards-preview'>
              {savedCards.slice(0, 2).map((card) => (
                <div key={card.id} className='card-preview'>
                  <span className='card-brand'>{card.card.brand}</span>
                  <span className='card-number'>**** {card.card.last4}</span>
                </div>
              ))}
              {savedCards.length > 2 && <div className='more-cards'>+{savedCards.length - 2} thẻ khác</div>}
            </div>
            <Link to='/saved-payment' className='payment-button'>
              Thanh toán với thẻ đã lưu
            </Link>
          </div>
        )}
      </div>

      {error && <div className='error-message'>{error}</div>}
    </div>
  )
}
