import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import React from 'react'
import '../Payment/BookingConfirmation.css'
import '../Payment/CheckoutPage.css'

const BookingConfirmation = ({ bookingData, onConfirm, onCancel, loading }) => {
  const { selectedService, selectedBranch, selectedStaff, selectedSlot, note, paymentMethod } = bookingData

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale: vi })
  }

  return (
    <div className='checkout-container'>
      <div className='checkout-header'>
        <h2>Xác Nhận Đặt Lịch</h2>
      </div>

      <div className='checkout-content'>
        <div className='order-summary'>
          <h3>Thông tin đặt lịch</h3>

          <div className='service-detail'>
            <div className='service-image'>
              <img
                src={
                  selectedService.image ||
                  selectedService.images?.[0] ||
                  'https://via.placeholder.com/300x200?text=Luna+Spa'
                }
                alt={selectedService.name}
                onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=Luna+Spa')}
              />
            </div>
            <div className='service-info'>
              <h4>{selectedService.name}</h4>
              <p>{selectedService.description || selectedService.short_description}</p>
              <div className='service-price'>
                {selectedService.durations &&
                selectedService.durations[0] &&
                selectedService.durations[0].discount_price ? (
                  <>
                    <span className='original-price'>{formatCurrency(selectedService.durations[0].price)}</span>
                    <span>{formatCurrency(selectedService.durations[0].discount_price)}</span>
                  </>
                ) : (
                  <span>{formatCurrency(selectedService.price)}</span>
                )}
              </div>
            </div>
          </div>

          <div className='booking-details'>
            <div className='detail-item'>
              <span className='detail-label'>Chi nhánh:</span>
              <span className='detail-value'>{selectedBranch.name}</span>
            </div>
            <div className='detail-item'>
              <span className='detail-label'>Địa chỉ:</span>
              <span className='detail-value'>{selectedBranch.address}</span>
            </div>
            <div className='detail-item'>
              <span className='detail-label'>Chuyên viên:</span>
              <span className='detail-value'>{selectedStaff.account?.name || 'Chuyên viên'}</span>
            </div>
            <div className='detail-item'>
              <span className='detail-label'>Ngày đặt lịch:</span>
              <span className='detail-value'>{formatDate(selectedSlot.start_time)}</span>
            </div>
            <div className='detail-item'>
              <span className='detail-label'>Giờ đặt lịch:</span>
              <span className='detail-value'>{formatTime(selectedSlot.start_time)}</span>
            </div>
            {note && (
              <div className='detail-item'>
                <span className='detail-label'>Ghi chú:</span>
                <span className='detail-value note-text'>{note}</span>
              </div>
            )}
          </div>

          <div className='order-total'>
            <span>Tổng thanh toán:</span>
            <span className='total-price'>
              {selectedService.durations && selectedService.durations[0] && selectedService.durations[0].discount_price
                ? formatCurrency(selectedService.durations[0].discount_price)
                : formatCurrency(selectedService.price)}
            </span>
          </div>
        </div>

        <div className='payment-section'>
          <h3>Phương thức thanh toán</h3>

          <div className='payment-method-selection'>
            <div className={`payment-method-item ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
              <input
                type='radio'
                id='stripe'
                name='payment_method'
                value='stripe'
                checked={paymentMethod === 'stripe'}
                readOnly
              />
              <label htmlFor='stripe'>
                <span className='method-name'>Thanh toán qua thẻ (Stripe)</span>
                <span className='method-description'>Thanh toán an toàn qua cổng Stripe bằng thẻ tín dụng/ghi nợ</span>
              </label>
            </div>

            <div className={`payment-method-item ${paymentMethod === 'cash' ? 'selected' : ''}`}>
              <input
                type='radio'
                id='cash'
                name='payment_method'
                value='cash'
                checked={paymentMethod === 'cash'}
                readOnly
              />
              <label htmlFor='cash'>
                <span className='method-name'>Thanh toán tại chi nhánh</span>
                <span className='method-description'>Thanh toán trực tiếp tại chi nhánh khi sử dụng dịch vụ</span>
              </label>
            </div>
          </div>

          <div className='payment-actions'>
            <button className='cancel-button' onClick={onCancel}>
              Quay lại chỉnh sửa
            </button>
            <button className='confirm-button' onClick={onConfirm} disabled={loading}>
              {loading ? (
                <>
                  <span className='spinner'></span>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                'Xác nhận đặt lịch'
              )}
            </button>
          </div>

          <div className='payment-notice'>
            {paymentMethod === 'stripe' ? (
              <p>
                Bạn sẽ được chuyển đến trang thanh toán Stripe sau khi xác nhận. Đơn đặt lịch của bạn chỉ được hoàn tất
                sau khi thanh toán thành công.
              </p>
            ) : (
              <p>Vui lòng đến chi nhánh đúng giờ đã đặt. Đơn đặt lịch có thể bị hủy nếu bạn đến trễ quá 15 phút.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
