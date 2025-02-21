1. `"build": "rimraf ./dist && tsc --noCheck && tsc-alias",`
   // Câu lệnh này để build code và skip kiểm tra lỗi TypeScript

2. Cách import thư viện ES Module? (Nên nhớ build trc r hẵng chạy)
   Mặc dù chúng ta dùng import và export khi code TypeScript, trông có vẻ là ES Module nhưng ẩn sâu bên trong đó là CommonJS.

Chỉ là TypeScript làm thế cho chúng ta tiện lợi hơn thôi.

Vậy nên dự án của chúng ta vẫn là CommonJS, nên khi dùng thư viện ES Module thì chúng ta cần phải dùng import('ten-thu-vien').default để lấy ra thư viện đó.

Ví dụ thư viện formidable là một thư viện ES Module, nên khi dùng nó chúng ta phải dùng như sau

`export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
}`

3.

- Cấp độ cao nhất là Organizations
  - Có thể gọi là tập đoàn
- 1 Organizations có thể có nhiều project
  - Dự án con hoặc nhóm dự án giống như workspace
- 1 project có thể có nhiều cluster
  - Cluster có thể hiểu là 1 server
- 1 cluster có thể có nhiều database
  - Database là kho dữ liệu (giống với Schema)
- Trong mỗi database chúng ta lại có các collection
  - collection có thể hiểu là "Bảng" trong NoSQL
- Mỗi collection lại có nhiều document
  - bản ghi (row) trong NoSQL

Cluster có thể hiểu như là một server vps, dùng để cài đặt mongodb. Từ đó chúng ta có thể tạo thêm nhiều database trên cái server đó

Collection tương đương với bảng bên SQL
Document tương đương hàng bên SQL

4.Tạo project trên mongodb web
https://account.mongodb.com/account/login?n=https%3A%2F%2Fcloud.mongodb.com%2Fv2%2F67a0744afd423648fab2d795&nextHash=%23clusters&signedOut=true
Vào trang của mongo
tạo 1 project

Vào góc bên phải chọn tạo project
Tạo cluster
Chọn shared
Chọn nhà cung cấp là aws
Chọn server đặt càng gần mình càng tốt
Đặt tên cluster
\*Lưu ý: Mỗi server chỉ chứa 1 cluster
Chọn username và password(ráng nhớ)
Thêm entries vào IP Access List
IP Address 0.0.0.0/0
Nếu bạn khởi chạy server (ví dụ với ExpressJS) và bind địa chỉ 0.0.0.0, server sẽ lắng nghe tất cả các giao diện mạng, nghĩa là server có thể nhận kết nối từ bất kỳ địa chỉ IP nào mà hệ thống máy chủ có.

5. Insert document vào trong mongoDB Atlas
   Thì với 1 document tức 1 thằng trong db thì chỉ cần 1 json
   Còn nếu nhiều thằng thì phải bọc array ở ngoài
   Ví dụ :
   `[{
    "name": "Alex"
    "age": 20,
    "gender": "male"
},
{
    "name": "Ben"
    "age": 40,
    "gender": "male"
}
]`

6. Search với các filter
7. Project: lựa chọn field ko xuất hiện (0), muốn xuất hiện là (1)
   \*Lưu ý chỉ chọn 1 là xuất hiện 2 là ko xuất hiện, ko thể dùng cả 2 trong 1 cái filter
8. sort:

7.các lênh CRUD trong Mongosh
C - Create
db.collection.insertOne({field: 'value'}) //dùng để chèn 1 tài liệu
db.collection.insertMany([{}, {}]) //dùng dể chèn nhìu tài liệu

R - Retrieve
db.collection.findOne({})
db.collection.findMany({},{})

U - Update
Trong **mongosh**, có một số lệnh update chính được sử dụng để thay đổi hoặc cập nhật dữ liệu trong collection. Dưới đây là những lệnh update thường gặp và cách sử dụng của chúng:

---

### 1. `updateOne()`

- **Mục đích:**  
  Cập nhật **một tài liệu đầu tiên** khớp với điều kiện (filter).

- **Cú pháp:**

  ```javascript
  db.collection.updateOne(
    <filter>,
    <update>,
    <options>
  )
  ```

- **Ví dụ:**  
  Giả sử có một collection `users` và bạn muốn cập nhật trường `age` của người dùng có `name` là "Nguyễn Văn A":
  ```javascript
  db.users.updateOne({ name: 'Nguyễn Văn A' }, { $set: { age: 26 } })
  ```

---

### 2. `updateMany()`

- **Mục đích:**  
  Cập nhật **tất cả các tài liệu** khớp với điều kiện cho trước.

- **Cú pháp:**

  ```javascript
  db.collection.updateMany(
    <filter>,
    <update>,
    <options>
  )
  ```

- **Ví dụ:**  
  Nếu bạn muốn tăng tuổi (`age`) lên 1 cho tất cả các người dùng có `status` là "active":
  ```javascript
  db.users.updateMany({ status: 'active' }, { $inc: { age: 1 } })
  ```

---

### 3. `replaceOne()`

- **Mục đích:**  
  Thay thế **toàn bộ tài liệu** đầu tiên khớp với filter bằng một tài liệu mới. Lưu ý rằng tài liệu thay thế sẽ hoàn toàn thay thế tài liệu cũ, do đó các field không có trong tài liệu thay thế sẽ bị mất.

- **Cú pháp:**

  ```javascript
  db.collection.replaceOne(
    <filter>,
    <replacement>,
    <options>
  )
  ```

- **Ví dụ:**  
  Nếu bạn muốn thay thế thông tin của người dùng "Nguyễn Văn A" bằng một tài liệu mới:
  ```javascript
  db.users.replaceOne({ name: 'Nguyễn Văn A' }, { name: 'Nguyễn Văn A', age: 27, status: 'active' })
  ```

---

### 4. `findOneAndUpdate()`

- **Mục đích:**  
  Tìm **một tài liệu** khớp với điều kiện, cập nhật nó và trả về tài liệu (trước hoặc sau khi update tùy theo tùy chọn).

- **Cú pháp:**

  ```javascript
  db.collection.findOneAndUpdate(
    <filter>,
    <update>,
    <options>
  )
  ```

- **Ví dụ:**  
  Cập nhật và trả về thông tin của người dùng "Trần Thị B" sau khi cập nhật:
  ```javascript
  db.users.findOneAndUpdate(
    { name: 'Trần Thị B' },
    { $set: { status: 'inactive' } },
    { returnDocument: 'after' } // hoặc { returnNewDocument: true } ở phiên bản cũ
  )
  ```

---

### Một số **update operators** thông dụng:

- **`$set`**: Gán hoặc cập nhật giá trị của field.
- **`$inc`**: Tăng hoặc giảm giá trị số.
- **`$unset`**: Xóa một field khỏi tài liệu.
- **`$push`**: Thêm một phần tử vào mảng.
- **`$pull`**: Loại bỏ các phần tử khỏi mảng thỏa mãn điều kiện.

**Ví dụ sử dụng `$push`:**

```javascript
db.users.updateOne({ name: 'Nguyễn Văn A' }, { $push: { hobbies: 'đọc sách' } })
```

---

### Tùy chọn (Options):

- Các lệnh update đều có thể nhận một đối tượng `options` để cấu hình thêm, ví dụ như:
  - **upsert:** Nếu không có tài liệu nào khớp, tạo mới tài liệu.
  - **multi:** Trong lệnh update cũ (`update()`), dùng để chỉ định update nhiều tài liệu (đã được thay thế bởi `updateMany()`).

**Ví dụ sử dụng `upsert` với `updateOne`:**

```javascript
db.users.updateOne({ name: 'Lê Văn D' }, { $set: { age: 30, status: 'active' } }, { upsert: true })
```

Nếu không có tài liệu nào có `name: "Lê Văn D"`, MongoDB sẽ tạo mới tài liệu với dữ liệu được chỉ định.

8. Thiết kế cơ sở dữ liệu bằng MongoDB sao cho chuẩn
   https://duthanhduoc.com/blog/thiet-ke-co-so-du-lieu-voi-mongodb

9. Giải nghĩa tên các thư mục
   controllers/ Nhận request, gọi service, trả về response
   middleware/ Xử lý request trước khi đến controller (ví dụ: auth, logging)
   services/ Chứa logic nghiệp vụ, tương tác với database hoặc API
   models/ Kiểu của collection

10. dotenv: Là một thư viện Node.js cho phép bạn đọc các biến môi trường từ một tệp .env vào quá trình của ứng dụng. Tệp .env là một tệp văn bản đơn giản chứa các cặp key-value của các biến môi trường.

config(): Là phương thức của dotenv để tải các biến môi trường từ tệp .env vào process.env, một biến toàn cục trong Node.js cho phép bạn truy cập các biến môi trường.

11. Hash object là gì
    Trong Node.js, khi bạn gọi:

Code
import { createHash } from 'crypto';

const hash = createHash('sha256');

createHash('sha256') tạo ra một đối tượng băm (hash object) dùng để thực hiện thao tác băm dữ liệu với thuật toán được chỉ định (ở đây là sha256).
Cụ thể hơn, hash object này duy trì một trạng thái nội bộ (internal state) và cung cấp các phương thức như:
.update(data): nạp thêm dữ liệu (có thể là nhiều lần, dưới dạng string, buffer, stream,...) để băm.
.digest(encoding?): kết thúc quá trình băm và trả về giá trị băm (hash) cuối cùng. Có thể truyền vào encoding như 'hex', 'base64',... hoặc để trống để nhận giá trị Buffer.
Bạn có thể hình dung hash object như một “bộ máy” (engine) đang chạy. Khi bạn gọi nhiều lần hash.update(...), nó sẽ liên tục “nghiền” dữ liệu và duy trì trạng thái trung gian. Cuối cùng, khi bạn gọi hash.digest(...), nó “khóa” kết quả và trả về giá trị băm cuối cùng.

Trong Node.js, những hash object này thực chất được xây dựng dựa trên OpenSSL bên dưới.

Ví dụ:
const hash = createHash('sha256');
hash.update('Hello ');
hash.update('World');
const result = hash.digest('hex');
// result bây giờ là chuỗi hex biểu diễn hàm băm SHA-256 của 'Hello World'

12.Thuật toán băm (Hashing Algorithm) là gì?
Thuật toán băm (hashing algorithm) là một hàm (function) một chiều (one-way function) nhận đầu vào là dữ liệu có độ dài bất kỳ (thường là một chuỗi hoặc mảng byte) và trả về một mã băm (hash) với độ dài cố định, ví dụ 128 bit, 256 bit, 512 bit...

Đặc điểm chính của thuật toán băm
Tính một chiều (one-way)

Khó (gần như không thể) tìm được dữ liệu gốc từ giá trị băm.
Với một giá trị băm, bạn không thể “giải mã” ra dữ liệu ban đầu.
Tính quyết định (deterministic)

Cùng một đầu vào luôn tạo ra cùng một kết quả băm.
Chỉ thay đổi một ký tự nhỏ trong đầu vào cũng dẫn đến kết quả băm khác hoàn toàn (hiệu ứng tuyết lở - avalanche effect).
Chống va chạm (collision-resistant)

Rất khó để tìm ra hai dữ liệu khác nhau nhưng lại có cùng giá trị băm.
Đây là yêu cầu quan trọng để đảm bảo tính toàn vẹn dữ liệu.
Các thuật toán băm phổ biến
MD5 (Message-Digest Algorithm 5): Cũ, không còn an toàn cho các mục đích bảo mật.
SHA-1 (Secure Hash Algorithm 1): Cũng đã xuất hiện lỗ hổng, không khuyến khích dùng cho bảo mật.
SHA-2 (Secure Hash Algorithm 2): Bao gồm các biến thể như SHA-224, SHA-256, SHA-384, SHA-512. sha256 là một lựa chọn tốt, an toàn hơn nhiều so với MD5, SHA-1.
SHA-3: Thế hệ mới, có thể dùng thay thế SHA-2 trong một số trường hợp.
Ứng dụng của thuật toán băm
Lưu trữ mật khẩu: Thay vì lưu trữ mật khẩu thô, hệ thống sẽ lưu giá trị băm kèm với muối (salt) hoặc bí mật (pepper) để tăng cường bảo mật.
Kiểm tra tính toàn vẹn: Ví dụ tải file từ internet, bạn so sánh hash của file tải xuống với hash mà nhà cung cấp công bố để chắc rằng file không bị chỉnh sửa.
Xác thực thông điệp: Trong giao thức HTTPS, TLS,... băm được sử dụng để xác thực dữ liệu, chống sửa đổi.

13. Nói 1 tí về vòng lặp for in

Trong JavaScript/TypeScript, for (const key in object) là vòng lặp for..in, dùng để duyệt qua các thuộc tính (property) có thể đếm được (enumerable) của một đối tượng. Mỗi lần lặp, biến key sẽ là tên của thuộc tính (kiểu chuỗi).

const errorsObject = {
email: { msg: 'Email không hợp lệ' },
password: { msg: 'Mật khẩu quá ngắn' }
}

for (const key in errorsObject) {
// Lần đầu key = 'email'
// Lần sau key = 'password'
const error = errorsObject[key]
console.log(key, error)
}

13
Trong nhiều giải pháp bảo mật và quản lý phiên (session management) bằng Refresh Token, một chiến lược phổ biến là “token rotation”. Theo chiến lược này, mỗi lần bạn yêu cầu refresh token mới, token cũ được vô hiệu hóa (thường là xóa khỏi DB) và bạn nhận token mới hoàn toàn. Cụ thể:

Ngăn chặn tấn công “token replay”

Nếu bạn chỉ cập nhật refresh token cũ (thay thế nội dung của nó trong DB), thì về cơ bản bản ghi vẫn tồn tại và cũ/mới “chồng chéo” dễ gây nhầm lẫn.
Nếu kẻ tấn công đã lấy được token cũ, vẫn có thể lợi dụng chỗ “chưa kịp cập nhật” hoặc sai sót nào đó để gửi request refresh.
Trong chiến lược “token rotation”, mỗi refresh token chỉ dùng 1 lần, sau khi dùng xong sẽ loại bỏ (delete) => Tránh bị tái sử dụng.
Đơn giản hóa logic

Khi token cũ luôn bị xóa, bạn không phải lo đồng bộ dữ liệu cũ với dữ liệu mới.
Bạn chỉ cần tạo một refresh token mới và lưu vào DB, token cũ coi như “hết hạn” trong hệ thống.
Mỗi yêu cầu refresh thành công => sinh token mới => xóa token cũ => lưu token mới. Vòng đời token rõ ràng hơn.
Tuân theo best practices

Nhiều khuyến nghị bảo mật JWT/Refresh Token (như RFC 6749 - OAuth 2.0) khuyến khích quay vòng (rotation) refresh token.
Mỗi phiên đăng nhập chỉ có một refresh token có hiệu lực tại một thời điểm; giảm rủi ro lộ dữ liệu.
Dễ quản lý phiên

Việc xóa token cũ và thêm token mới giúp bạn “nắm rõ” phiên. Nếu user đăng xuất (logout) hoặc refresh token bị vô hiệu hóa, nó mất hoàn toàn trong DB.
Trong tương lai, nếu bạn cần thêm logic (như ghi nhận thời gian sinh, IP), bạn chỉ cần chèn token mới, xóa token cũ.
