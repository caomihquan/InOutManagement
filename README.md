🔐 Quản lý người dùng & phân quyền

Đăng ký, đăng nhập, đăng xuất.

Quản lý thông tin cá nhân (họ tên, email, số điện thoại, avatar).

Phân quyền theo vai trò: Admin / Nhân viên / Khách.

Quản lý mật khẩu, reset password, bảo mật 2 lớp (có thể mở rộng).

🏢 Quản lý khu vực & thiết bị

Quản lý tòa nhà → tầng → phòng (cấu trúc cây).

Gắn thiết bị kiểm soát (cửa từ, barrier, RFID reader, camera).

Thiết lập quy tắc ra/vào cho từng khu vực.

⏰ Quản lý thời gian & ca làm việc

Định nghĩa ca làm việc (ví dụ: 8h–17h, 3 ca/ngày).

Quản lý ngày nghỉ, ngày lễ.

Thiết lập khoảng thời gian cho phép ra/vào.

📊 Chấm công & theo dõi

Ghi nhận log vào/ra (theo người dùng + thiết bị).

Tính giờ làm việc, OT, vắng mặt.

Báo cáo chấm công (theo ngày/tuần/tháng).

🎫 Quản lý thẻ/thiết bị truy cập

Cấp phát thẻ từ, RFID, PIN, sinh trắc học.

Gắn thẻ với người dùng.

Vô hiệu hóa/kích hoạt thẻ.

📡 Giám sát & báo cáo

Real-time hiển thị ai đang trong khu vực nào (SignalR/WebSocket).

Lịch sử ra vào chi tiết.

Cảnh báo vi phạm (ví dụ: ra vào ngoài giờ, dùng thẻ sai).

Báo cáo tổng hợp.

👥 Quản lý khách

Đăng ký khách thăm.

Cấp quyền tạm thời (theo giờ/ngày).

Theo dõi khách đang trong khu vực.


---------------------------------------

- Backend (.NET + PostgreSQL)

Kiến trúc: Clean Architecture hoặc Minimal API + Layered.

Authentication: JWT + Refresh Token.

Database: PostgreSQL, quản lý bằng EF Core Migrations.

Real-time: SignalR.

Logging/Monitoring: Serilog, Health Checks.

- Frontend (React + Tailwind CSS)

UI Framework: Tailwind CSS + shadcn/ui (component).

State Management: Redux Toolkit hoặc React Query.

Routing: React Router.

Auth: JWT lưu ở HttpOnly Cookie.

Charts/Báo cáo: Recharts hoặc Chart.js.

- Triển khai & hạ tầng

Containerization: Docker (backend, frontend, db).

CI/CD: GitHub Actions hoặc Azure DevOps.

Deployment: có thể lên VPS hoặc Azure/AWS/GCP.