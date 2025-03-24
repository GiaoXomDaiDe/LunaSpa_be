import React from 'react'
import './StaffCalendarWeekView.css'

const StaffCalendarWeekView = ({ date, staffSlots, onSlotClick }) => {
  // Tính toán ngày bắt đầu và kết thúc của tuần
  const startOfWeek = getStartOfWeek(date)
  const dates = Array(7)
    .fill()
    .map((_, idx) => {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + idx)
      return day
    })

  // Tạo mảng các giờ trong ngày (từ 7:00 đến 22:00)
  const hours = Array(16)
    .fill()
    .map((_, idx) => {
      return {
        hour: 7 + idx,
        label: `${7 + idx}:00`
      }
    })

  // Hàm lấy ngày bắt đầu của tuần (thứ 2)
  function getStartOfWeek(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  // Hàm định dạng ngày
  function formatDate(date) {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`
  }

  // Kiểm tra xem có slot nào trong giờ cụ thể không
  const getSlotsByDateAndHour = (date, hour) => {
    if (!staffSlots || !staffSlots.slots) return []

    const formattedDate = date.toISOString().split('T')[0]

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
        return 'slot-available'
      case 'booked':
        return 'slot-booked'
      case 'unavailable':
        return 'slot-unavailable'
      default:
        return ''
    }
  }

  return (
    <div className='staff-calendar-week-view'>
      <div className='week-header'>
        <div className='week-hour-label'></div>
        {dates.map((day, index) => (
          <div key={index} className='week-day-header'>
            {formatDate(day)}
          </div>
        ))}
      </div>

      <div className='week-body'>
        {hours.map((hourData, hourIndex) => (
          <div key={hourIndex} className='week-hour-row'>
            <div className='week-hour-label'>{hourData.label}</div>

            {dates.map((day, dayIndex) => (
              <div key={dayIndex} className='week-time-slot'>
                {getSlotsByDateAndHour(day, hourData.hour).map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`slot-item ${getSlotClass(slot.status)}`}
                    onClick={() => onSlotClick(slot)}
                  >
                    <div className='slot-staff-name'>{slot.staff?.staff_name}</div>
                    <div className='slot-time'>
                      {new Date(slot.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(slot.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className='slot-status'>{slot.status}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaffCalendarWeekView
