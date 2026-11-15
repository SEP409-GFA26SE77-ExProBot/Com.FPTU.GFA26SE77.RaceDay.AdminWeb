# Dashboard Admin

- Vào `/` sau khi đăng nhập bằng tài khoản **Admin**; proxy rewrite sang `/admin`.
- Sidebar **Dashboard** mở dashboard; **Người dùng** (`/users`) và **Nhật ký** (`/audit`) giữ nguyên.
- API chính: `GET /api/v1/iam/admin/dashboard?from=&to=`.
- Nhật ký gần đây: `GET /api/v1/audit-logs?page=1&pageSize=6`.
- Hai thẻ chính là tổng tài khoản và tài khoản mới trong kỳ. Active/Pending/Locked nằm trong khối trạng thái: **Đã kích hoạt**, **Chờ xác thực email**, **Đã khóa**.
- Bộ lọc ngày chỉ ảnh hưởng tài khoản mới. Trạng thái và phân bố vai trò là số hiện tại.
- **Xuất Excel / Xuất PDF** cạnh bộ lọc gọi `GET /api/v1/iam/admin/dashboard/export?format=xlsx|pdf&from=&to=`. File gồm tài khoản, trạng thái, vai trò, xu hướng và 6 hoạt động mới nhất được tải lại lúc xuất; giữ quyền Admin hiện có. Chi tiết: repo WebAPI `docs/dashboard-export.md`.
- Nút **Làm mới**, **Thử lại**, trạng thái tải/lỗi/trống và bảng số liệu của biểu đồ đã tích hợp.
- Gọi API qua Axios/BFF hiện có; không đổi session hoặc phân quyền.

Code: `src/components/dashboard/AdminDashboard.tsx`, `src/api/dashboard.ts`, `src/dto/dashboard.dto.ts`.

Kiểm tra: `node --test tests/dashboard.test.mjs`, `npm run test:auth`, `npm run build`.

Luồng tổng thể, sơ đồ và ý nghĩa các chỉ số nằm ở repo WebAPI: `docs/dashboard-ui.md`; hợp đồng backend: `docs/dashboard-api.md`.

