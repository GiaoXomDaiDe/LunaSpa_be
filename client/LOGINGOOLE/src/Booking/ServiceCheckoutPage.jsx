import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CheckoutForm from '../Payment/CheckoutForm'
import '../Payment/CheckoutPage.css'
import './css/ServiceCheckoutPage.css'

// Khởi tạo Stripe promise với public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const ServiceCheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [branch, setBranch] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [momoPayUrl, setMomoPayUrl] = useState(null)

  useEffect(() => {
    const getServicesAndCreateOrder = async () => {
      try {
        // Lấy các tham số từ URL
        const queryParams = new URLSearchParams(location.search)
        const service_id = queryParams.get('service_id')
        const branch_id = queryParams.get('branch_id')
        const slot_id = queryParams.get('slot_id')
        const booking_time = queryParams.get('booking_time')
        const staff_id = queryParams.get('staff_id')
        const payment_method = queryParams.get('payment_method') || 'stripe'
        const note = queryParams.get('note') || ''

        if (!service_id || !branch_id || !slot_id || !booking_time) {
          setError('Thiếu thông tin đặt dịch vụ')
          setLoading(false)
          return
        }

        // 1. Lấy thông tin dịch vụ
        const serviceResponse = await axios.get(`http://localhost:4000/services/${service_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (!serviceResponse.data || !serviceResponse.data.result) {
          setError('Không tìm thấy thông tin dịch vụ')
          setLoading(false)
          return
        }

        // 2. Lấy thông tin chi nhánh
        const branchResponse = await axios.get(`http://localhost:4000/branches/${branch_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (branchResponse.data && branchResponse.data.result) {
          setBranch(branchResponse.data.result)
        }

        // 3. Tạo đơn hàng dịch vụ
        const bookingData = {
          branch_id: branch_id,
          items: [
            {
              item_id: service_id,
              item_type: 'service',
              quantity: 1,
              slot_id: slot_id
            }
          ],
          booking_time: booking_time,
          payment_method: payment_method,
          note: note,
          staff_profile_id: staff_id
        }

        const orderResponse = await axios.post('http://localhost:4000/orders/services', bookingData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })

        if (!orderResponse.data || !orderResponse.data.result) {
          setError('Không thể tạo đơn hàng')
          setLoading(false)
          return
        }

        const orderData = orderResponse.data.result.order
        setOrder(orderData)
        setOrderId(orderData._id)

        // 4. Lấy client secret từ payment intent đã tạo
        if (orderResponse.data.result.payment_intent && orderResponse.data.result.payment_intent.clientSecret) {
          setClientSecret(orderResponse.data.result.payment_intent.clientSecret)
        } else if (orderResponse.data.result.payment_intent && orderResponse.data.result.payment_intent.pay_url) {
          // Nếu là thanh toán MoMo, lưu pay_url
          setMomoPayUrl(orderResponse.data.result.payment_intent.pay_url)
          setPaymentMethod('momo')
        } else {
          // Nếu không có sẵn, tạo payment intent mới
          const paymentResponse = await axios.post(
            `http://localhost:4000/orders/${orderData._id}/payment`,
            {
              payment_method: payment_method
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
              }
            }
          )

          if (paymentResponse.data && paymentResponse.data.result) {
            if (payment_method === 'momo' && paymentResponse.data.result.pay_url) {
              // Nếu là MoMo, lưu pay_url
              setMomoPayUrl(paymentResponse.data.result.pay_url)
              setPaymentMethod('momo')
            } else if (paymentResponse.data.result.client_secret) {
              // Nếu là Stripe, lưu client_secret
              setClientSecret(paymentResponse.data.result.client_secret)
              setPaymentMethod('stripe')
            }
          } else {
            setError('Không thể khởi tạo thanh toán')
          }
        }
      } catch (err) {
        console.error('Lỗi trong quá trình xử lý:', err)
        setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    // Kiểm tra nếu người dùng đã đăng nhập
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Vui lòng đăng nhập để đặt dịch vụ')
      setLoading(false)
      return
    }

    getServicesAndCreateOrder()
  }, [location.search, navigate])

  // Thiết lập options cho Stripe
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#6772e5',
      colorBackground: '#ffffff',
      colorText: '#32325d',
      colorDanger: '#df1b41',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      borderRadius: '4px'
    }
  }

  const options = {
    clientSecret,
    appearance
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Xử lý hình ảnh lỗi
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150x150?text=Staff'
  }

  // Thêm hàm xử lý chuyển đến trang thanh toán MoMo
  const handleMomoPayment = () => {
    if (momoPayUrl) {
      window.location.href = momoPayUrl
    }
  }

  if (loading) {
    return (
      <div className='checkout-container'>
        <div className='loading'>Đang tải thông tin thanh toán...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='checkout-container'>
        <div className='error-message'>{error}</div>
      </div>
    )
  }

  return (
    <div className='checkout-container'>
      <div className='checkout-header'>
        <h2>Thanh Toán Dịch Vụ</h2>
      </div>

      <div className='checkout-content'>
        <div className='order-summary'>
          <h3>Thông tin đơn hàng</h3>

          {order && order.items && order.items.length > 0 && (
            <div className='service-detail'>
              <div className='service-header'>
                <h4>{order.items[0].item_name}</h4>
                <div className='service-price'>{formatCurrency(order.final_price)}</div>
              </div>

              <div className='service-info'>
                <div className='info-group'>
                  <div className='info-label'>
                    <i className='fas fa-calendar'></i>
                    <span>Thời gian:</span>
                  </div>
                  <div className='info-value'>{formatDateTime(order.booking_time)}</div>
                </div>

                <div className='info-group'>
                  <div className='info-label'>
                    <i className='fas fa-map-marker-alt'></i>
                    <span>Chi nhánh:</span>
                  </div>
                  <div className='info-value'>{order.branch?.name || branch?.name || 'Luna Spa'}</div>
                </div>

                {order.items[0].staff_profile && (
                  <div className='staff-section'>
                    <div className='staff-info-label'>Chuyên viên thực hiện:</div>
                    <div className='staff-detail'>
                      <div className='staff-avatar'>
                        <img
                          src={
                            order.items[0].staff_profile.account?.avatar ||
                            'https://via.placeholder.com/150x150?text=Staff'
                          }
                          alt={order.items[0].staff_profile.account?.name}
                          onError={handleImageError}
                        />
                      </div>
                      <div className='staff-info'>
                        <div className='staff-name'>
                          {order.items[0].staff_profile.account?.name || 'Chưa xác định'}
                        </div>
                        {order.items[0].staff_profile.rating > 0 && (
                          <div className='staff-rating'>
                            <span className='star'>★</span>
                            <span>{order.items[0].staff_profile.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {order.note && (
                <div className='order-note'>
                  <div className='note-label'>Ghi chú:</div>
                  <div className='note-content'>{order.note}</div>
                </div>
              )}
            </div>
          )}

          <div className='order-info'>
            <div className='order-id'>
              <span>Mã đơn hàng:</span>
              <span>{order?._id}</span>
            </div>
            <div className='order-total'>
              <span>Tổng thanh toán:</span>
              <span>{formatCurrency(order?.final_price || 0)}</span>
            </div>
          </div>
        </div>

        <div className='payment-section'>
          <h3>Thanh toán</h3>
          {paymentMethod === 'stripe' && clientSecret && orderId ? (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
            </Elements>
          ) : paymentMethod === 'momo' && momoPayUrl ? (
            <div className='momo-payment'>
              <div className='momo-payment-info'>
                <p>Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch.</p>
                <p>Sau khi thanh toán thành công, bạn sẽ được chuyển về trang kết quả.</p>
              </div>
              <button className='momo-payment-button' onClick={handleMomoPayment}>
                Thanh toán với MoMo
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ServiceCheckoutPage
