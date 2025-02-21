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
