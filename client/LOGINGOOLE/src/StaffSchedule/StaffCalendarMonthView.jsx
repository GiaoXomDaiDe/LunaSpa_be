import React from 'react'
import './StaffCalendarMonthView.css'

const StaffCalendarMonthView = ({ date, staffSlots, onSlotClick }) => {
  // Tính toán các ngày trong tháng hiện tại
  const daysInMonth = getDaysInMonth(date)

  // Hàm lấy các ngày trong tháng
  function getDaysInMonth(date) {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Lấy ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1)
    // Lấy ngày cuối cùng của tháng
    const lastDay = new Date(year, month + 1, 0)

    // Lấy thứ của ngày đầu tiên (0 = Chủ nhật, 1 = Thứ 2, ...)
    let dayOfWeek = firstDay.getDay()
    if (dayOfWeek === 0) dayOfWeek = 7 // Đổi Chủ nhật thành 7

    const daysArray = []

    // Thêm các ngày trống từ đầu tuần đến ngày đầu tiên của tháng
    for (let i = 1; i < dayOfWeek; i++) {
      const prevMonth = new Date(year, month, 0)
      const prevMonthDays = prevMonth.getDate()
      const day = prevMonthDays - (dayOfWeek - i) + 1
      daysArray.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false
      })
    }

    // Thêm các ngày trong tháng hiện tại
    for (let i = 1; i <= lastDay.getDate(); i++) {
      daysArray.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Thêm các ngày của tháng sau để làm đầy tuần cuối cùng
    const remainingDays = 7 - (daysArray.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        daysArray.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        })
      }
    }

    return daysArray
  }

  // Hàm lấy các slot theo ngày
  const getSlotsByDate = (date) => {
    if (!staffSlots || !staffSlots.slots) return []

    const formattedDate = date.toISOString().split('T')[0]

    const slots = []

    // Duyệt qua từng nhân viên
    Object.keys(staffSlots.slots || {}).forEach((staffId) => {
      const dateSlots = (staffSlots.slots[staffId] || {})[formattedDate] || []

      // Lấy thông tin nhân viên
      const staffInfo = staffSlots.staff?.find((s) => s.staff_id === staffId)

      // Thêm các slot vào kết quả
      dateSlots.forEach((slot) => {
        slots.push({
          ...slot,
          staff: staffInfo
        })
      })
    })

    return slots
  }

  // Hàm tính số lượng các slot theo trạng thái
  const getSlotCountsByStatus = (slots) => {
    const counts = {
      available: 0,
      booked: 0,
      unavailable: 0
    }

    slots.forEach((slot) => {
      if (slot.status in counts) {
        counts[slot.status]++
      }
    })

    return counts
  }

  // Hàm định dạng ngày
  const formatDay = (date) => {
    return date.getDate()
  }

  return (
    <div className='staff-calendar-month-view'>
      <div className='month-header'>
        <div className='weekday'>T2</div>
        <div className='weekday'>T3</div>
        <div className='weekday'>T4</div>
        <div className='weekday'>T5</div>
        <div className='weekday'>T6</div>
        <div className='weekday'>T7</div>
        <div className='weekday'>CN</div>
      </div>

      <div className='month-grid'>
        {daysInMonth.map((day, index) => {
          const daySlots = getSlotsByDate(day.date)
          const slotCounts = getSlotCountsByStatus(daySlots)

          return (
            <div
              key={index}
              className={`month-day ${day.isCurrentMonth ? 'current-month' : 'other-month'}`}
              onClick={() => daySlots.length > 0 && onSlotClick(daySlots[0])}
            >
              <div className='month-day-header'>
                <span className='month-day-number'>{formatDay(day.date)}</span>
              </div>

              {daySlots.length > 0 ? (
                <div className='month-day-content'>
                  <div className='month-day-slots-summary'>
                    {slotCounts.available > 0 && (
                      <div className='month-slot-count available'>
                        <span className='slot-count'>{slotCounts.available}</span> có sẵn
                      </div>
                    )}
                    {slotCounts.booked > 0 && (
                      <div className='month-slot-count booked'>
                        <span className='slot-count'>{slotCounts.booked}</span> đã đặt
                      </div>
                    )}
                    {slotCounts.unavailable > 0 && (
                      <div className='month-slot-count unavailable'>
                        <span className='slot-count'>{slotCounts.unavailable}</span> không khả dụng
                      </div>
                    )}
                  </div>

                  <div className='month-day-staff-summary'>
                    <span className='staff-count'>{daySlots.length}</span> ca làm việc
                  </div>
                </div>
              ) : day.isCurrentMonth ? (
                <div className='month-day-empty'>Không có ca làm việc</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StaffCalendarMonthView
