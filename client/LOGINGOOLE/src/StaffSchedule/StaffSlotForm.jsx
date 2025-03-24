import React, { useEffect, useState } from 'react'
import './StaffSlotForm.css'

const StaffSlotForm = ({ slot, staffProfiles, onSubmit, onCancel, onDelete }) => {
  // Initial state với thông tin slot hoặc giá trị mặc định
  const [formData, setFormData] = useState({
    staff_profile_id: '',
    start_time: '',
    end_time: '',
    status: 'available'
  })

  // Cập nhật form data khi có slot được chọn
  useEffect(() => {
    if (slot) {
      setFormData({
        staff_profile_id: slot.staff_profile_id || '',
        start_time: formatDateTimeForInput(new Date(slot.start_time)) || '',
        end_time: formatDateTimeForInput(new Date(slot.end_time)) || '',
        status: slot.status || 'available'
      })
    }
  }, [slot])

  // Hàm format datetime cho input type="datetime-local"
  const formatDateTimeForInput = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate dữ liệu
    if (!formData.staff_profile_id || !formData.start_time || !formData.end_time) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Chuyển đổi chuỗi datetime thành đối tượng Date
    const startTime = new Date(formData.start_time)
    const endTime = new Date(formData.end_time)

    // Validate thời gian
    if (endTime <= startTime) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    // Truyền dữ liệu lên component cha
    onSubmit({
      ...formData,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    })
  }

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      onDelete()
    }
  }

  return (
    <div className='staff-slot-form-overlay'>
      <div className='staff-slot-form'>
        <div className='form-header'>
          <h3>{slot ? 'Cập nhật ca làm việc' : 'Thêm ca làm việc mới'}</h3>
          <button className='close-button' onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='staff_profile_id'>Nhân viên:</label>
            <select
              id='staff_profile_id'
              name='staff_profile_id'
              value={formData.staff_profile_id}
              onChange={handleChange}
              required
            >
              <option value=''>-- Chọn nhân viên --</option>
              {staffProfiles &&
                staffProfiles.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.full_name} - {staff.position}
                  </option>
                ))}
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor='start_time'>Thời gian bắt đầu:</label>
            <input
              type='datetime-local'
              id='start_time'
              name='start_time'
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='end_time'>Thời gian kết thúc:</label>
            <input
              type='datetime-local'
              id='end_time'
              name='end_time'
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='status'>Trạng thái:</label>
            <select id='status' name='status' value={formData.status} onChange={handleChange}>
              <option value='available'>Có sẵn</option>
              <option value='booked'>Đã đặt</option>
              <option value='unavailable'>Không khả dụng</option>
            </select>
          </div>

          <div className='form-actions'>
            {slot && onDelete && (
              <button type='button' className='delete-button' onClick={handleDelete}>
                Xóa
              </button>
            )}
            <button type='button' className='cancel-button' onClick={onCancel}>
              Hủy
            </button>
            <button type='submit' className='submit-button'>
              {slot ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StaffSlotForm
