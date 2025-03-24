import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import BookingService from './Booking/BookingService'
import ServiceCheckoutPage from './Booking/ServiceCheckoutPage'
import Home from './Home'
import Login from './Login'
import CheckoutPage from './Payment/CheckoutPage'
import OrderStatus from './Payment/OrderStatus'
import PaymentMethods from './Payment/PaymentMethods'
import PaymentResult from './Payment/PaymentResult'
import ProductDemo from './Payment/ProductDemo'
import SavedCardPayment from './Payment/SavedCardPayment'
import StripePayment from './Payment/StripePayment'
import StaffCalendar from './StaffSchedule/StaffCalendar'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/staff-schedule',
        element: <StaffCalendar />
      },
      {
        path: '/payment',
        element: <StripePayment />
      },
      {
        path: '/saved-payment',
        element: <SavedCardPayment />
      },
      {
        path: '/payment-methods',
        element: <PaymentMethods />
      },
      {
        path: '/payment-success',
        element: <div className='payment-success'>Thanh toán thành công!</div>
      },
      {
        path: '/payment-result',
        element: <PaymentResult />
      },
      {
        path: '/products',
        element: <ProductDemo />
      },
      {
        path: '/checkout/:productId',
        element: <CheckoutPage />
      },
      {
        path: '/order/status/:orderId',
        element: <OrderStatus />
      },
      {
        path: '/booking',
        element: <BookingService />
      },
      {
        path: '/checkout/:serviceId',
        element: <ServiceCheckoutPage />
      },
      {
        path: '/checkout/service',
        element: <ServiceCheckoutPage />
      }
    ]
  },
  {
    path: '/login/oauth-google',
    element: <Login />
  },
  {
    path: '/login/oauth-facebook',
    element: <Login />
  }
])

export default router
