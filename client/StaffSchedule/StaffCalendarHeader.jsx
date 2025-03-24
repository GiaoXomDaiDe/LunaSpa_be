/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import './StaffCalendarHeader.css'

const StaffCalendarHeader = ({
  date,
  viewType,
  onPrevious,
  onNext,
  onToday,
  onViewTypeChange,
  onFilterChange,
  filters,
  staffProfiles,
  onAddSlot,
  onImportExcel
}) => {
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = () => {
    const options = { year: 'numeric', month: 'long' }

    if (viewType === 'day') {
      options.day = 'numeric'
      return new Date(date).toLocaleDateString('vi-VN', options)
    } else if (viewType === 'week') {
      const startOfWeek = new Date(date)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      const startMonth = startOfWeek.getMonth()
      const endMonth = endOfWeek.getMonth()

      if (startMonth === endMonth) {
        return `Tháng ${startMonth + 1}/${startOfWeek.getFullYear()}: ${startOfWeek.getDate()} - ${endOfWeek.getDate()}`
      } else {
        return `${startOfWeek.getDate()}/${startMonth + 1} - ${endOfWeek.getDate()}/${endMonth + 1}/${endOfWeek.getFullYear()}`
      }
    } else if (viewType === 'month') {
      options.day = undefined
      return new Date(date).toLocaleDateString('vi-VN', options)
    }
  }

  const handleFilterToggle = () => {
    setShowFilters(!showFilters)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    onFilterChange({ [name]: value })
  }

  return (
    <div className='staff-calendar-header'>
      <div className='calendar-header-top'>
        <div className='calendar-title'>{formatDate()}</div>

        <div className='calendar-actions'>
          <button onClick={onToday} className='action-button today-button'>
            Hôm nay
          </button>
          <button onClick={onPrevious} className='action-button nav-button'>
            &lt;
          </button>
          <button onClick={onNext} className='action-button nav-button'>
            &gt;
          </button>

          <div className='view-selector'>
            <button
              className={`view-button ${viewType === 'day' ? 'active' : ''}`}
              onClick={() => onViewTypeChange('day')}
            >
              Ngày
            </button>
            <button
              className={`view-button ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => onViewTypeChange('week')}
            >
              Tuần
            </button>
            <button
              className={`view-button ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => onViewTypeChange('month')}
            >
              Tháng
            </button>
          </div>

          <button onClick={handleFilterToggle} className='action-button filter-button'>
            Lọc
          </button>
          <button onClick={onAddSlot} className='action-button add-button'>
            Thêm ca
          </button>
          <button onClick={onImportExcel} className='action-button import-button'>
            Import Excel
          </button>
        </div>
      </div>

      {showFilters && (
        <div className='calendar-filters'>
          <div className='filter-item'>
            <label htmlFor='staff_name'>Tên nhân viên:</label>
            <input
              type='text'
              id='staff_name'
              name='staff_name'
              value={filters.staff_name}
              onChange={handleFilterChange}
              placeholder='Nhập tên nhân viên'
            />
          </div>

          <div className='filter-item'>
            <label htmlFor='branch_id'>Chi nhánh:</label>
            <select id='branch_id' name='branch_id' value={filters.branch_id} onChange={handleFilterChange}>
              <option value=''>Tất cả chi nhánh</option>
              <option value='1'>Chi nhánh 1</option>
              <option value='2'>Chi nhánh 2</option>
              <option value='3'>Chi nhánh 3</option>
            </select>
          </div>

          <div className='filter-item'>
            <label htmlFor='status'>Trạng thái:</label>
            <select id='status' name='status' value={filters.status} onChange={handleFilterChange}>
              <option value=''>Tất cả trạng thái</option>
              <option value='available'>Có sẵn</option>
              <option value='booked'>Đã đặt</option>
              <option value='unavailable'>Không khả dụng</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffCalendarHeader
