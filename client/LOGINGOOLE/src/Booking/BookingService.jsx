import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingConfirmation from './BookingConfirmation'
import './BookingService.css'

const BookingService = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  // Lấy danh sách dịch vụ
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:4000/services', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        console.log(response.data, 'response')

        if (response.data && response.data.result) {
          setServices(response.data.result || [])
        }

        // Lấy danh sách chi nhánh
        const branchResponse = await axios.get('http://localhost:4000/branches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        console.log(branchResponse.data, 'branchResponse')

        if (branchResponse.data && branchResponse.data.result) {
          setBranches(branchResponse.data.result.data || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Lấy slot khả dụng khi chọn dịch vụ, chi nhánh và ngày
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedService || !selectedBranch || !selectedDate) return
      setLoading(true)

      try {
        // Sử dụng URL cứng cho API call
        const response = await axios.get(
          `http://localhost:4000/staff-slots/?limit=10&page=1&staff_profile_id=67dbc57aa8ddfee1b988c91e&date=2025-03-31T17:00:00.000Z&status=available`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        )
        console.log(response.data, 'response slots')

        if (response.data && response.data.result) {
          // Nhận trực tiếp kết quả từ API mà không cần lọc thêm
          setAvailableSlots(response.data.result.data || [])
        } else {
          setAvailableSlots([])
        }

        setLoading(false)
      } catch (err) {
        console.error('Lỗi khi lấy slot khả dụng:', err)
        setError('Không thể tải slot khả dụng. Vui lòng thử lại sau.')
        setLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedService, selectedBranch, selectedDate])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleNextStep = () => {
    setStep(step + 1)
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setSelectedSlot(null) // Reset selected slot when date changes
  }

  const handleCancelBooking = () => {
    setStep(3) // Quay lại bước chọn thời gian
  }

  const handleBookService = async () => {
    setLoading(true)

    try {
      const bookingData = {
        branch_id: selectedBranch._id,
        items: [
          {
            item_id: selectedService._id,
            item_type: 'service',
            quantity: 1,
            slot_id: selectedSlot._id
          }
        ],
        booking_time: selectedSlot.start_time,
        payment_method: paymentMethod,
        note: note,
        staff_profile_id: selectedSlot.staff_profile._id
      }

      // Sử dụng endpoint orders/services thay vì orders/book
      const response = await axios.post('http://localhost:4000/orders/services', bookingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.data && response.data.result) {
        const orderData = response.data.result.order

        if (paymentMethod === 'stripe') {
          // Chuyển đến trang thanh toán nếu chọn phương thức stripe
          navigate(`/checkout/service/${orderData._id}`)
        } else {
          // Chuyển đến trang chi tiết đơn hàng
          navigate(`/order/status/${orderData._id}`)
        }
      }
    } catch (err) {
      console.error('Lỗi khi đặt lịch:', err)
      setError('Không thể đặt lịch. Vui lòng thử lại sau.')
      setLoading(false)
    }
  }

  const renderServiceSelection = () => {
    return (
      <div className='booking-step'>
        <h3 className='step-title'>Chọn dịch vụ</h3>

        <div className='services-grid'>
          {services.map((service) => (
            <div
              key={service._id}
              className={`service-card ${selectedService?._id === service._id ? 'selected' : ''}`}
              onClick={() => setSelectedService(service)}
            >
              <div className='service-image'>
                <img
                  src={service.image || service.images?.[0] || 'https://via.placeholder.com/300x200?text=Luna+Spa'}
                  alt={service.name}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=Luna+Spa')}
                />
                {service.is_popular && <span className='badge popular'>Phổ biến</span>}
                {service.is_new && <span className='badge new'>Mới</span>}
                {service.durations && service.durations[0] && service.durations[0].discount_price > 0 && (
                  <span className='badge discount'>{service.durations[0].discount_price}</span>
                )}
              </div>

              <div className='service-info'>
                <h4>{service.name}</h4>
                <p>{service.description || service.short_description}</p>

                <div className='service-details'>
                  <div className='service-price'>
                    {service.durations && service.durations[0] && service.durations[0].discount_price ? (
                      <>
                        <span className='original-price'>{formatCurrency(service.durations[0].price)}</span>
                        <span>{formatCurrency(service.durations[0].discount_price)}</span>
                      </>
                    ) : (
                      <span>{formatCurrency(service.price)}</span>
                    )}
                  </div>
                  <div className='service-duration'>
                    <i className='fa fa-clock-o'></i> {service.duration || 60} phút
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='step-actions'>
          <button className='next-button' disabled={!selectedService} onClick={handleNextStep}>
            Tiếp tục
          </button>
        </div>
      </div>
    )
  }

  const renderBranchSelection = () => {
    return (
      <div className='booking-step'>
        <h3 className='step-title'>Chọn chi nhánh</h3>

        <div className='branches-grid'>
          {branches.map((branch) => (
            <div
              key={branch._id}
              className={`branch-card ${selectedBranch?._id === branch._id ? 'selected' : ''}`}
              onClick={() => setSelectedBranch(branch)}
            >
              <div className='branch-image'>
                <img
                  src={branch.image || 'https://via.placeholder.com/300x200?text=Luna+Spa'}
                  alt={branch.name}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=Luna+Spa')}
                />
              </div>

              <div className='branch-info'>
                <h4>{branch.name}</h4>
                <p className='branch-address'>{branch.address}</p>
                <p className='branch-phone'>{branch.phone || 'Chưa có thông tin'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='step-actions'>
          <button className='prev-button' onClick={handlePrevStep}>
            Quay lại
          </button>
          <button className='next-button' disabled={!selectedBranch} onClick={handleNextStep}>
            Tiếp tục
          </button>
        </div>
      </div>
    )
  }

  const renderDateTimeSelection = () => {
    const today = new Date()
    const formattedToday = today.toISOString().split('T')[0]

    return (
      <div className='booking-step'>
        <h3 className='step-title'>Chọn ngày và giờ</h3>

        <div className='date-selection'>
          <label>Ngày đặt lịch:</label>
          <input
            type='date'
            min={formattedToday}
            value={selectedDate}
            onChange={handleDateChange}
            className='date-input'
          />
        </div>

        {selectedDate && (
          <div className='time-selection'>
            <h4>Chọn giờ:</h4>

            {availableSlots.length > 0 ? (
              <>
                <div className='slots-grid'>
                  {availableSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className={`time-slot ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {new Date(slot.start_time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  ))}
                </div>

                {selectedSlot && selectedSlot.staff_profile && (
                  <div className='selected-staff-info'>
                    <h4>Thông tin chuyên viên</h4>
                    <div className='selected-staff-profile'>
                      <div className='selected-staff-avatar'>
                        <img
                          src={
                            selectedSlot.staff_profile.account?.avatar ||
                            'https://via.placeholder.com/150x150?text=Staff'
                          }
                          alt={selectedSlot.staff_profile.account?.name}
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/150x150?text=Staff')}
                        />
                      </div>
                      <div className='selected-staff-details'>
                        <div className='selected-staff-name'>
                          {selectedSlot.staff_profile.account?.name || 'Chuyên viên'}
                        </div>
                        <div>
                          {selectedSlot.staff_profile.rating > 0 && (
                            <span className='selected-staff-rating'>
                              <span>★</span> {selectedSlot.staff_profile.rating.toFixed(1)}
                            </span>
                          )}
                          {selectedSlot.staff_profile.year_of_experience > 0 && (
                            <span className='selected-staff-experience'>
                              {selectedSlot.staff_profile.year_of_experience} năm kinh nghiệm
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedSlot.staff_profile.bio && (
                      <div className='selected-staff-bio'>{selectedSlot.staff_profile.bio}</div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className='no-slots'>
                <p>Không có khung giờ nào khả dụng cho ngày này.</p>
                <p>Vui lòng chọn ngày khác hoặc liên hệ với chúng tôi để được hỗ trợ.</p>
              </div>
            )}
          </div>
        )}

        <div className='booking-options'>
          <div className='note-section'>
            <label>Ghi chú:</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Nhập ghi chú hoặc yêu cầu đặc biệt (nếu có)'
              className='note-input'
            ></textarea>
          </div>

          <div className='payment-section'>
            <label>Phương thức thanh toán:</label>
            <div className='payment-options'>
              <label className='payment-option'>
                <input
                  type='radio'
                  name='payment_method'
                  value='stripe'
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                />
                <span>Thanh toán bằng thẻ (Stripe)</span>
              </label>
              <label className='payment-option'>
                <input
                  type='radio'
                  name='payment_method'
                  value='momo'
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                />
                <span>Thanh toán bằng MoMo</span>
              </label>
            </div>
          </div>
        </div>

        <div className='step-actions'>
          <button className='prev-button' onClick={handlePrevStep}>
            Quay lại
          </button>
          <button className='next-button' disabled={!selectedSlot} onClick={handleNextStep}>
            Tiếp tục
          </button>

          {selectedSlot && (
            <button
              className='checkout-button'
              onClick={() => {
                const params = new URLSearchParams({
                  service_id: selectedService._id,
                  branch_id: selectedBranch._id,
                  slot_id: selectedSlot._id,
                  booking_time: selectedSlot.start_time,
                  staff_id: selectedSlot.staff_profile._id,
                  payment_method: paymentMethod,
                  note: note
                }).toString()

                navigate(`/checkout/service?${params}`)
              }}
            >
              Chuyển đến thanh toán
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderConfirmation = () => {
    // Lấy thông tin nhân viên từ slot được chọn
    const selectedStaff =
      selectedSlot && selectedSlot.staff_profile
        ? {
            _id: selectedSlot.staff_profile._id,
            account: selectedSlot.staff_profile.account,
            rating: selectedSlot.staff_profile.rating || 0,
            year_of_experience: selectedSlot.staff_profile.year_of_experience || 0,
            bio: selectedSlot.staff_profile.bio || ''
          }
        : null

    const bookingData = {
      selectedService,
      selectedBranch,
      selectedStaff,
      selectedSlot,
      note,
      paymentMethod
    }

    return (
      <BookingConfirmation
        bookingData={bookingData}
        onConfirm={handleBookService}
        onCancel={handleCancelBooking}
        loading={loading}
      />
    )
  }

  if (loading && services.length === 0) {
    return (
      <div className='booking-loading'>
        <div className='spinner'></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='booking-error'>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    )
  }

  return (
    <div className='booking-container'>
      {step < 4 && (
        <>
          <div className='booking-header'>
            <h2>Đặt Lịch Dịch Vụ</h2>
            <p>Chỉ với vài bước đơn giản, bạn có thể đặt lịch và tận hưởng dịch vụ tại Luna Spa</p>
          </div>

          <div className='booking-progress'>
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className='step-number'>1</div>
              <span>Chọn dịch vụ</span>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className='step-number'>2</div>
              <span>Chọn chi nhánh</span>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className='step-number'>3</div>
              <span>Chọn thời gian</span>
            </div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
              <div className='step-number'>4</div>
              <span>Xác nhận</span>
            </div>
          </div>
        </>
      )}

      <div className='booking-content'>
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderBranchSelection()}
        {step === 3 && renderDateTimeSelection()}
        {step === 4 && renderConfirmation()}
      </div>
    </div>
  )
}

export default BookingService
