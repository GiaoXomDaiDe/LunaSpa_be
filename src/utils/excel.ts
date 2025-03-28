import ExcelJS from 'exceljs'
import { StaffSlotStatus } from '~/models/schema/StaffSlot.schema'

// Hàm tạo template Excel cho staff slots
export const createStaffSlotTemplate = async (): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Staff Slots')

  // Thiết lập header với style
  worksheet.columns = [
    { header: 'Ngày', key: 'date', width: 15 },
    { header: 'Thời gian bắt đầu', key: 'start_time', width: 20 },
    { header: 'Thời gian kết thúc', key: 'end_time', width: 20 },
    { header: 'Trạng thái (tùy chọn)', key: 'status', width: 25 }
  ]

  // Style cho header
  worksheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }
    cell.border = {
      top: { style: 'medium' },
      left: { style: 'medium' },
      bottom: { style: 'medium' },
      right: { style: 'medium' }
    }
  })

  // Thêm một hàng mẫu
  worksheet.addRow({
    date: new Date().toISOString().split('T')[0],
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 30 * 60000).toISOString(),
    status: StaffSlotStatus.AVAILABLE
  })

  // Thêm drop-down list cho cột status
  const statusValues = Object.values(StaffSlotStatus)
  const statusValidation = {
    type: 'list' as const,
    allowBlank: true,
    formulae: [`"${statusValues.join(',')}"`],
    showErrorMessage: true,
    errorStyle: 'error' as const,
    error: 'Invalid value',
    errorTitle: 'Error'
  }
  worksheet.getColumn('status').eachCell({ includeEmpty: false }, (cell: ExcelJS.Cell, rowNumber: number) => {
    if (rowNumber > 1) {
      worksheet.getCell(`D${rowNumber}`).dataValidation = statusValidation
    }
  })

  // Thêm sheet hướng dẫn
  const instructionSheet = workbook.addWorksheet('Instructions')
  instructionSheet.columns = [
    { header: 'Column', key: 'column', width: 15 },
    { header: 'Format', key: 'format', width: 40 },
    { header: 'Description', key: 'description', width: 50 }
  ]

  // Style cho header
  instructionSheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  // Thêm hướng dẫn
  instructionSheet.addRows([
    {
      column: 'Date',
      format: 'YYYY-MM-DD (e.g.: 2023-03-25)',
      description: 'Working date for the staff'
    },
    {
      column: 'Start Time',
      format: 'YYYY-MM-DDTHH:mm:ss.sssZ (e.g.: 2023-03-25T09:00:00.000Z)',
      description: 'Start time of the working slot, in ISO format'
    },
    {
      column: 'End Time',
      format: 'YYYY-MM-DDTHH:mm:ss.sssZ (e.g.: 2023-03-25T10:00:00.000Z)',
      description: 'End time of the working slot, in ISO format, must be greater than start time'
    },
    {
      column: 'Status',
      format: `Choose one of these values: ${statusValues.join(', ')}`,
      description: 'Status of the working slot, default is available'
    }
  ])

  // Thêm sheet hướng dẫn chi tiết
  const guideSheet = workbook.addWorksheet('Usage Guide')
  guideSheet.columns = [
    { header: 'Topic', key: 'topic', width: 25 },
    { header: 'Description', key: 'description', width: 75 }
  ]

  // Style cho header
  guideSheet.getRow(1).eachCell((cell: ExcelJS.Cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  // Thêm hướng dẫn chi tiết
  guideSheet.addRows([
    {
      topic: 'Import/Export Flow',
      description:
        'This template can be used for both importing and exporting staff slots. For importing, fill in the data and upload through the staff portal. For exporting, current slots will be downloaded in a similar format.'
    },
    {
      topic: 'Status Management',
      description:
        'The system supports automatic status transitions (AVAILABLE → PENDING → RESERVED → CONFIRMED/CANCELLED). When a slot is in PENDING state, a timestamp is set to track slot reservation timeout.'
    },
    {
      topic: 'Pending Slots Cleanup',
      description:
        'Slots in PENDING state for more than 15 minutes are automatically released by the system. Related orders are cancelled with an automatic timeout message.'
    },
    {
      topic: 'Slot Duration Calculation',
      description:
        'The available_minutes and used_minutes are automatically calculated based on slot start and end times. These values determine if a slot can accommodate additional bookings.'
    }
  ])

  // Tạo buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return buffer as Buffer
}

// Hàm đọc file Excel và chuyển đổi thành dữ liệu
export const parseStaffSlotExcel = async (
  buffer: Buffer
): Promise<
  Array<{
    date: string
    start_time: string
    end_time: string
    status?: StaffSlotStatus
  }>
> => {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.getWorksheet('Staff Slots')

  if (!worksheet) {
    throw new Error('Staff Slots sheet not found in the Excel file')
  }

  const slots: Array<{
    date: string
    start_time: string
    end_time: string
    status?: StaffSlotStatus
  }> = []

  worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) return // Skip header

    const date = row.getCell(1).value?.toString() || ''
    const start_time = row.getCell(2).value?.toString() || ''
    const end_time = row.getCell(3).value?.toString() || ''
    const status = row.getCell(4).value?.toString() as StaffSlotStatus | undefined

    if (date && start_time && end_time) {
      slots.push({
        date,
        start_time,
        end_time,
        status
      })
    }
  })

  return slots
}
