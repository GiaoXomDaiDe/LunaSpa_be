import React, { useState } from 'react'
import './ExcelImportModal.css'

const ExcelImportModal = ({ onSubmit, onCancel }) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Kiểm tra định dạng file
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      setFile(null)
      return
    }

    setError('')
    setFile(selectedFile)
  }

  // Xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!file) {
      setError('Vui lòng chọn file Excel')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    fetch('http://localhost:4000/staff-slots/excel/import', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Có lỗi xảy ra khi import file')
        }
        return response.json()
      })
      .then((data) => {
        alert('Import file thành công!')
        onCancel()
        if (onSubmit) onSubmit(file)
      })
      .catch((err) => {
        setError('Có lỗi xảy ra khi tải lên file. Vui lòng thử lại.')
        console.error('Error uploading file:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // Xử lý tải template
  const downloadTemplate = async () => {
    try {
      setIsLoading(true)

      // Tạo request để lấy template từ server
      const response = await fetch('http://localhost:4000/staff-slots/excel/template', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tải template')
      }

      // Lấy blob từ response
      const blob = await response.blob()

      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob)

      // Tạo link tải xuống
      const a = document.createElement('a')
      a.href = url
      a.download = 'staff_slots_template.xlsx'
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('Tải template thành công!')
    } catch (error) {
      setError('Không thể tải template. Vui lòng thử lại sau.')
      console.error('Error downloading template:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Hướng dẫn sử dụng template
  const templateInstructions = [
    'File Excel phải có các cột sau: staff_profile_id, date, start_time, end_time, status',
    'staff_profile_id: ID của nhân viên (yêu cầu)',
    'date: Ngày làm việc theo định dạng DD/MM/YYYY hoặc YYYY-MM-DD (yêu cầu)',
    'start_time: Thời gian bắt đầu theo định dạng HH:MM (yêu cầu)',
    'end_time: Thời gian kết thúc theo định dạng HH:MM (yêu cầu)',
    'status: Trạng thái ca làm việc (available, booked, unavailable), mặc định là available'
  ]

  return (
    <div className='excel-import-overlay'>
      <div className='excel-import-modal'>
        <div className='modal-header'>
          <h3>Import lịch làm việc từ Excel</h3>
          <button className='close-button' onClick={onCancel}>
            &times;
          </button>
        </div>

        <div className='modal-body'>
          <div className='template-section'>
            <h4>Tải template Excel</h4>
            <button className='template-button' onClick={downloadTemplate} disabled={isLoading}>
              Tải template
            </button>

            <div className='template-instructions'>
              <h5>Hướng dẫn sử dụng template:</h5>
              <ul>
                {templateInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='excel-file'>Chọn file Excel:</label>
              <input
                type='file'
                id='excel-file'
                accept='.xlsx, .xls'
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && (
                <div className='file-info'>
                  <span className='file-name'>{file.name}</span>
                  <span className='file-size'>({Math.round(file.size / 1024)} KB)</span>
                </div>
              )}
              {error && <div className='error-message'>{error}</div>}
            </div>

            <div className='form-actions'>
              <button type='button' className='cancel-button' onClick={onCancel} disabled={isLoading}>
                Hủy
              </button>
              <button type='submit' className='submit-button' disabled={!file || isLoading}>
                {isLoading ? 'Đang tải lên...' : 'Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ExcelImportModal
