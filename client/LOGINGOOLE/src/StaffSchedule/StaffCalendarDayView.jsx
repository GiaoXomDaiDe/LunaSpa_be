import React from 'react'
import './StaffCalendarDayView.css'

const StaffCalendarDayView = ({ date, staffSlots, onSlotClick }) => {
  // Tạo mảng các giờ trong ngày (từ 7:00 đến 22:00)
  const hours = Array(16)
    .fill()
    .map((_, idx) => {
      return {
        hour: 7 + idx,
        label: `${7 + idx}:00`
      }
    })

  // Format ngày hiện tại
  const formattedDate = date.toISOString().split('T')[0]

  // Hàm lấy các slots theo giờ
  const getSlotsByHour = (hour) => {
    if (!staffSlots || !staffSlots.slots) return []

    const slots = []

    // Duyệt qua từng nhân viên
    Object.keys(staffSlots.slots || {}).forEach((staffId) => {
      const dateSlots = (staffSlots.slots[staffId] || {})[formattedDate] || []

      // Tìm các slot trong giờ cụ thể
      dateSlots.forEach((slot) => {
        const slotStartHour = new Date(slot.start_time).getHours()

        if (slotStartHour === hour) {
          // Thêm thông tin nhân viên vào slot
          const staffInfo = staffSlots.staff.find((s) => s.staff_id === staffId)
          slots.push({
            ...slot,
            staff: staffInfo
          })
        }
      })
    })

    return slots
  }

  // Hàm tạo class CSS cho từng slot dựa trên trạng thái
  const getSlotClass = (status) => {
    switch (status) {
      case 'available':
        return 'day-slot-available'
      case 'booked':
        return 'day-slot-booked'
      case 'unavailable':
        return 'day-slot-unavailable'
      default:
        return ''
    }
  }

  return (
    <div className='staff-calendar-day-view'>
      <div className='day-header'>
        <div className='day-hour-label'>Giờ</div>
        <div className='day-slots-header'>Các ca làm việc</div>
      </div>

      <div className='day-body'>
        {hours.map((hourData, hourIndex) => {
          const hourSlots = getSlotsByHour(hourData.hour)

          return (
            <div key={hourIndex} className='day-hour-row'>
              <div className='day-hour-label'>{hourData.label}</div>

              <div className='day-hour-slots'>
                {hourSlots.length > 0 ? (
                  hourSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={`day-slot-item ${getSlotClass(slot.status)}`}
                      onClick={() => onSlotClick(slot)}
                    >
                      <div className='day-slot-staff'>
                        <div className='day-slot-staff-name'>{slot.staff?.staff_name}</div>
                        <div className='day-slot-staff-position'>{slot.staff?.position}</div>
                      </div>
                      <div className='day-slot-time'>
                        {new Date(slot.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                        -{new Date(slot.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className='day-slot-status'>{slot.status}</div>
                    </div>
                  ))
                ) : (
                  <div className='day-no-slots'>Không có ca làm việc</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StaffCalendarDayView
