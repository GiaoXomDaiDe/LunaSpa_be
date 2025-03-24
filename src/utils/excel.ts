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
    error: 'Giá trị không hợp lệ',
    errorTitle: 'Lỗi'
  }
  worksheet.getColumn('status').eachCell({ includeEmpty: false }, (cell: ExcelJS.Cell, rowNumber: number) => {
    if (rowNumber > 1) {
      worksheet.getCell(`D${rowNumber}`).dataValidation = statusValidation
    }
  })

  // Thêm sheet hướng dẫn
  const instructionSheet = workbook.addWorksheet('Hướng dẫn')
  instructionSheet.columns = [
    { header: 'Cột', key: 'column', width: 15 },
    { header: 'Định dạng', key: 'format', width: 40 },
    { header: 'Mô tả', key: 'description', width: 50 }
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
      column: 'Ngày',
      format: 'YYYY-MM-DD (vd: 2023-03-25)',
      description: 'Ngày làm việc của nhân viên'
    },
    {
      column: 'Thời gian bắt đầu',
      format: 'YYYY-MM-DDTHH:mm:ss.sssZ (vd: 2023-03-25T09:00:00.000Z)',
      description: 'Thời gian bắt đầu ca làm việc, định dạng ISO'
    },
    {
      column: 'Thời gian kết thúc',
      format: 'YYYY-MM-DDTHH:mm:ss.sssZ (vd: 2023-03-25T10:00:00.000Z)',
      description: 'Thời gian kết thúc ca làm việc, định dạng ISO, phải lớn hơn thời gian bắt đầu'
    },
    {
      column: 'Trạng thái',
      format: `Chọn một trong các giá trị: ${statusValues.join(', ')}`,
      description: 'Trạng thái của slot làm việc, mặc định là available'
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
    throw new Error('Không tìm thấy sheet "Staff Slots" trong file Excel')
  }

  const slots: Array<{
    date: string
    start_time: string
    end_time: string
    status?: StaffSlotStatus
  }> = []

  worksheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) return // Bỏ qua header

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
