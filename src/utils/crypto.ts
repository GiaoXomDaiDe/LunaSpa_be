import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'
export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}
//createHash('sha256') là một hàm của module crypto
// (tích hợp sẵn trong Node.js) dùng để tạo ra một
// hash object với thuật toán băm là SHA-256.

//11. 12.
export function hashPassword(password: string) {
  return sha256(password + envConfig.passwordSecret)
}

// Hàm này thực hiện việc nối (+) giá trị password do người dùng
//  nhập vào với giá trị process.env.PASSWORD_SECRET
// (thường được gọi là “pepper” hoặc “salt” được lưu trong biến môi trường).
