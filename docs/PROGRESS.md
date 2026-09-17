# Đã hoàn thành

Cập nhật lần cuối: 2026-09-17

## Frontend
- [x] Khởi tạo dự án Vite + React + TypeScript
- [x] Routing với `react-router-dom` (`/login`, protected `/*`)
- [x] Trang đăng nhập Google SSO (`Login.tsx`)
- [x] `AuthContext` — quản lý session, loading state, "xem như" (view-as) role cho superadmin
- [x] `ProtectedRoute` — redirect về `/login` nếu chưa xác thực
- [x] Form đăng ký sử dụng phòng (`BookingForm`) — validate trường bắt buộc, chọn địa điểm/loại hoạt động
- [x] Panel duyệt yêu cầu (`ApprovePanel`) — duyệt / từ chối kèm lý do (`RejectModal`)
- [x] Lịch chung (`CalendarPanel`) — xem tổng quan booking
- [x] Modal điều khoản sử dụng phòng (`TermsModal`) — bắt buộc đồng ý lần đầu, lưu theo email trong localStorage
- [x] Toast thông báo (`useToast`)
- [x] Header/Footer, design tokens CSS riêng (`tokens.css`), theme cho login và app chính
- [x] Format ảnh WebP fallback cho background/logo (`staticImage.ts`)

## Backend
- [x] Khởi tạo Express + TypeScript, chạy dev qua `tsx watch`
- [x] Kết nối MySQL qua `mysql2` connection pool
- [x] Schema DB: `admin_users`, `admin_sessions`, `bookings` (`schema.sql`)
- [x] Migration thêm cột `role` cho `admin_users` (2026-09-17)
- [x] Google OAuth 2.0 flow đầy đủ (login → callback → tạo/cập nhật user → session cookie)
- [x] Allowlist theo domain email (`GOOGLE_ALLOWED_DOMAINS`)
- [x] Gán quyền superadmin theo danh sách email (`SUPERADMIN_EMAILS`), tính lại mỗi lần login
- [x] Session cookie riêng (HttpOnly), lưu session trong DB, TTL 7 ngày
- [x] Middleware `requireAuth`
- [x] CRUD booking: tạo, danh sách, duyệt, từ chối (với lý do)
- [x] CORS credentialed, giới hạn origin = `FRONTEND_URL`

## Hạ tầng / DX
- [x] `.env.example` cho cả root và server
- [x] `dev.ps1` cho cả root và server (chạy trực tiếp qua `node.exe` của ServBay, tránh lỗi spawn qua `cmd.exe` trên Windows)
- [x] ESLint config (root)
- [x] TypeScript strict setup (`tsconfig.app.json`, `tsconfig.node.json`, server `tsconfig.json`)

## Việc vừa làm trong phiên này (2026-09-17)
- [x] Thêm `server/.gitignore` (loại `.env`, `node_modules`, `dist`) — trước đó server chưa có `.gitignore` riêng
- [x] Cập nhật `.gitignore` gốc: thêm `*.tsbuildinfo`, loại `.claude/scheduled_tasks.lock`
- [x] Khởi tạo git repo, chuẩn bị commit đầu tiên
- [x] Soạn README.md, docs/ARCHITECTURE.md, docs/PROGRESS.md, docs/NEXT_STEPS.md
- [x] Push lên GitHub, repo public `va-booking-ebr`

## Chưa làm (xem chi tiết ở [NEXT_STEPS.md](NEXT_STEPS.md))
- [ ] Test tự động (unit/integration/e2e)
- [ ] CI/CD
- [ ] Enforce phân quyền approve/reject ở backend
- [ ] Chống trùng lịch (double-booking) và race condition khi sinh mã booking
- [ ] Gửi email thật khi duyệt/từ chối (hiện chỉ có toast nói đã gửi)
- [ ] Đồng bộ 2 chiều với Google Calendar (yêu cầu bổ sung 2026-09-17 — chưa bắt đầu triển khai, xem NEXT_STEPS.md mục 5)
- [ ] Deploy production (hiện chỉ chạy local qua ServBay)
