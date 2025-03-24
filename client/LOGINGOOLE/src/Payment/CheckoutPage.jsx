import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CheckoutForm from './CheckoutForm'
import './CheckoutPage.css'

// Khởi tạo Stripe promise với public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CheckoutPage = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  // Lấy thông tin sản phẩm và tạo đơn hàng
  useEffect(() => {
    const getProductAndOrder = async () => {
      try {
        // 1. Lấy thông tin sản phẩm từ API
        const productResponse = await axios.get(`http://localhost:4000/products/${productId}`)
        if (!productResponse.data || !productResponse.data.result) {
          setError('Không tìm thấy sản phẩm')
          setLoading(false)
          return
        }

        const productData = productResponse.data.result
        setProduct(productData)

        // 2. Tạo đơn hàng sử dụng purchaseProductController
        const orderResponse = await axios.post(
          'http://localhost:4000/orders/products',
          {
            branch_id: '67cd31c685b65937c44884b3', // ID chi nhánh demo hoặc lấy từ local storage
            items: [
              {
                item_id: productData._id,
                item_type: 'product',
                quantity: 1
              }
            ],
            payment_method: 'stripe',
            note: 'Đơn hàng mua sản phẩm qua Stripe'
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )

        if (orderResponse.data && orderResponse.data.result) {
          const orderData = orderResponse.data.result.order
          setOrderId(orderData._id)

          // 3. Tạo payment intent
          const paymentResponse = await axios.post(
            `http://localhost:4000/orders/${orderData._id}/payment`,
            {
              payment_method: 'stripe'
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
              }
            }
          )

          if (paymentResponse.data && paymentResponse.data.result) {
            console.log(paymentResponse.data.result, 'Payment Response')
            setClientSecret(paymentResponse.data.result.client_secret)
          } else {
            setError('Không thể khởi tạo thanh toán')
          }
        } else {
          setError('Không thể tạo đơn hàng')
        }
      } catch (err) {
        console.error('Lỗi trong quá trình xử lý:', err)
        setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      getProductAndOrder()
    }
  }, [productId])

  // Nếu không có token, hiển thị thông báo đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('Vui lòng đăng nhập để mua sản phẩm')
      setLoading(false)
    }
  }, [])

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

  // Xử lý hình ảnh lỗi
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200?text=Luna+Spa'
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

          <div className='product-detail'>
            <div className='product-image'>
              <img src={product.images?.[0] || product.media?.[0]?.url} alt={product.name} onError={handleImageError} />
            </div>
            <div className='product-info'>
              <h4>{product.name}</h4>
              <p>{product.description || product.short_description}</p>
              <div className='product-price'>{formatCurrency(product.base_price || product.price)}</div>
            </div>
          </div>

          <div className='order-info'>
            <div className='order-id'>
              <span>Mã đơn hàng:</span>
              <span>{orderId}</span>
            </div>
            <div className='order-total'>
              <span>Tổng thanh toán:</span>
              <span>{formatCurrency(product.base_price || product.price)}</span>
            </div>
          </div>
        </div>

        <div className='payment-section'>
          <h3>Thanh toán</h3>
          {clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
