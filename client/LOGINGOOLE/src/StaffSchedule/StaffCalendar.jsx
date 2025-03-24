import React, { useEffect, useState } from 'react'
import ExcelImportModal from './ExcelImportModal'
import './StaffCalendar.css'
import StaffCalendarDayView from './StaffCalendarDayView'
import StaffCalendarHeader from './StaffCalendarHeader'
import StaffCalendarMonthView from './StaffCalendarMonthView'
import StaffCalendarWeekView from './StaffCalendarWeekView'
import StaffSlotForm from './StaffSlotForm'

const StaffCalendar = () => {
  const [viewType, setViewType] = useState('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [staffSlots, setStaffSlots] = useState([])
  const [staffProfiles, setStaffProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [filters, setFilters] = useState({
    staff_name: '',
    branch_id: '',
    status: ''
  })

  useEffect(() => {
    fetchStaffProfiles()
    fetchCalendarData()
  }, [currentDate, viewType, filters])

  const fetchStaffProfiles = async () => {
    try {
      // Trường hợp thực tế - gọi API khi backend đã sẵn sàng
      // const response = await fetch('/api/staff-profiles');
      // const data = await response.json();
      // setStaffProfiles(data.result);

      // Dữ liệu mẫu khi chưa có API
      const mockData = [
        {
          _id: '64f1a5b2c9e4d6a23bc9f821',
          full_name: 'Nguyễn Văn A',
          position: 'Kỹ thuật viên',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          branch_id: '1'
        },
        {
          _id: '64f1a5b2c9e4d6a23bc9f822',
          full_name: 'Trần Thị B',
          position: 'Massage therapist',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          branch_id: '1'
        },
        {
          _id: '64f1a5b2c9e4d6a23bc9f823',
          full_name: 'Lê Văn C',
          position: 'Spa specialist',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          branch_id: '2'
        }
      ]
      setStaffProfiles(mockData)
    } catch (error) {
      console.error('Error fetching staff profiles:', error)
    }
  }

  const fetchCalendarData = async () => {
    setIsLoading(true)
    try {
      // Tính toán ngày bắt đầu và kết thúc dựa trên loại view
      let startDate, endDate

      if (viewType === 'day') {
        startDate = new Date(currentDate)
        endDate = new Date(currentDate)
      } else if (viewType === 'week') {
        startDate = new Date(currentDate)
        const day = startDate.getDay()
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1)
        startDate = new Date(startDate.setDate(diff))
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
      } else if (viewType === 'month') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      }

      // Format dates
      const formattedStartDate = startDate.toISOString().split('T')[0]
      const formattedEndDate = endDate.toISOString().split('T')[0]

      // Build query string with filters
      const queryParams = new URLSearchParams({
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        view_type: viewType,
        ...filters
      })
      console.log('API URL sẽ gọi khi backend sẵn sàng:', `/api/staff-slots/calendar?${queryParams}`)

      // API call to get staff slots calendar
      // const response = await fetch(`/api/staff-slots/calendar?${queryParams}`);
      // const data = await response.json();
      // setStaffSlots(data.result);

      // Dữ liệu mẫu khi chưa có API
      const mockStaffSlots = {
        staff: [
          {
            staff_id: '64f1a5b2c9e4d6a23bc9f821',
            staff_name: 'Nguyễn Văn A',
            position: 'Kỹ thuật viên',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            account_id: '64f1a5b2c9e4d6a23bc9f820',
            email: 'nguyenvana@example.com'
          },
          {
            staff_id: '64f1a5b2c9e4d6a23bc9f822',
            staff_name: 'Trần Thị B',
            position: 'Massage therapist',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
            account_id: '64f1a5b2c9e4d6a23bc9f823',
            email: 'tranthib@example.com'
          },
          {
            staff_id: '64f1a5b2c9e4d6a23bc9f823',
            staff_name: 'Lê Văn C',
            position: 'Spa specialist',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
            account_id: '64f1a5b2c9e4d6a23bc9f825',
            email: 'levanc@example.com'
          }
        ],
        dates: getDatesInRange(startDate, endDate),
        slots: {
          '64f1a5b2c9e4d6a23bc9f821': generateMockSlots('64f1a5b2c9e4d6a23bc9f821', startDate, endDate),
          '64f1a5b2c9e4d6a23bc9f822': generateMockSlots('64f1a5b2c9e4d6a23bc9f822', startDate, endDate),
          '64f1a5b2c9e4d6a23bc9f823': generateMockSlots('64f1a5b2c9e4d6a23bc9f823', startDate, endDate)
        }
      }

      setStaffSlots(mockStaffSlots)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm tạo dữ liệu mẫu ngày trong khoảng
  const getDatesInRange = (startDate, endDate) => {
    const dates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Hàm tạo dữ liệu mẫu slots
  const generateMockSlots = (staffId, startDate, endDate) => {
    const slots = {}
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      slots[dateStr] = []

      // Chỉ tạo slots cho ngày làm việc (thứ 2 đến thứ 6)
      if (currentDate.getDay() > 0 && currentDate.getDay() < 6) {
        // Tạo 3 slots mỗi ngày
        const morningSlot = {
          _id: `${staffId}_${dateStr}_morning`,
          start_time: `${dateStr}T09:00:00.000Z`,
          end_time: `${dateStr}T11:00:00.000Z`,
          status: Math.random() > 0.7 ? 'booked' : 'available'
        }

        const afternoonSlot = {
          _id: `${staffId}_${dateStr}_afternoon`,
          start_time: `${dateStr}T13:00:00.000Z`,
          end_time: `${dateStr}T15:00:00.000Z`,
          status: Math.random() > 0.5 ? 'booked' : 'available'
        }

        const eveningSlot = {
          _id: `${staffId}_${dateStr}_evening`,
          start_time: `${dateStr}T16:00:00.000Z`,
          end_time: `${dateStr}T18:00:00.000Z`,
          status: Math.random() > 0.3 ? 'unavailable' : 'available'
        }

        slots[dateStr].push(morningSlot, afternoonSlot, eveningSlot)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return slots
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleViewTypeChange = (type) => {
    setViewType(type)
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot)
    setShowSlotForm(true)
  }

  const handleAddSlot = () => {
    setSelectedSlot(null)
    setShowSlotForm(true)
  }

  const handleSlotFormSubmit = async (slotData) => {
    try {
      if (selectedSlot) {
        // Update existing slot
        await fetch(`/api/staff-slots/${selectedSlot._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slotData)
        })
      } else {
        // Create new slot
        await fetch('/api/staff-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(slotData)
        })
      }
      setShowSlotForm(false)
      fetchCalendarData()
    } catch (error) {
      console.error('Error saving slot:', error)
    }
  }

  const handleSlotDelete = async (slotId) => {
    try {
      await fetch(`/api/staff-slots/${slotId}`, {
        method: 'DELETE'
      })
      fetchCalendarData()
    } catch (error) {
      console.error('Error deleting slot:', error)
    }
  }

  const handleImportExcel = () => {
    setShowImportModal(true)
  }

  const handleExcelImportSubmit = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:4000/staff-slots/excel/import', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Có lỗi xảy ra khi import file')
      }

      await response.json()

      alert('Import file thành công!')
      setShowImportModal(false)
      fetchCalendarData()
    } catch (error) {
      console.error('Error importing excel:', error)
      alert('Có lỗi xảy ra khi import file')
    }
  }

  const renderCalendarView = () => {
    if (isLoading) {
      return <div className='loading'>Đang tải lịch làm việc...</div>
    }

    switch (viewType) {
      case 'day':
        return <StaffCalendarDayView date={currentDate} staffSlots={staffSlots} onSlotClick={handleSlotClick} />
      case 'month':
        return <StaffCalendarMonthView date={currentDate} staffSlots={staffSlots} onSlotClick={handleSlotClick} />
      case 'week':
      default:
        return <StaffCalendarWeekView date={currentDate} staffSlots={staffSlots} onSlotClick={handleSlotClick} />
    }
  }

  return (
    <div className='staff-calendar-container'>
      <StaffCalendarHeader
        date={currentDate}
        viewType={viewType}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewTypeChange={handleViewTypeChange}
        onFilterChange={handleFilterChange}
        filters={filters}
        onAddSlot={handleAddSlot}
        onImportExcel={handleImportExcel}
      />
      <div className='staff-calendar-body'>{renderCalendarView()}</div>

      {showSlotForm && (
        <StaffSlotForm
          slot={selectedSlot}
          staffProfiles={staffProfiles}
          onSubmit={handleSlotFormSubmit}
          onCancel={() => setShowSlotForm(false)}
          onDelete={selectedSlot ? () => handleSlotDelete(selectedSlot._id) : null}
        />
      )}

      {showImportModal && (
        <ExcelImportModal onSubmit={handleExcelImportSubmit} onCancel={() => setShowImportModal(false)} />
      )}
    </div>
  )
}

export default StaffCalendar
