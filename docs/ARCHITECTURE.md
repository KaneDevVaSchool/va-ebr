# Kiến trúc

## Tổng quan

Monorepo 2 phần, không dùng workspace tool (npm install riêng ở mỗi thư mục):

- **`/`** — Frontend SPA (React + Vite + TypeScript), gọi API qua `fetch` với `credentials: "include"`.
- **`/server`** — Backend API (Express + TypeScript), phục vụ REST JSON, xác thực bằng session cookie (không dùng JWT).

Không có SSR, không có BFF — frontend gọi thẳng backend qua CORS (origin cố định = `FRONTEND_URL`).

## Luồng xác thực (Google Workspace SSO)

1. FE điều hướng người dùng tới `GET /auth/google/login` (backend).
2. Backend tạo `state` ngẫu nhiên, lưu vào cookie tạm, redirect sang Google OAuth consent screen.
3. Google redirect về `GET /auth/google/callback?code=...&state=...`.
4. Backend xác minh `state`, đổi `code` lấy profile Google (email, sub, name, avatar, email_verified).
5. Kiểm tra:
   - `email_verified` phải `true`
   - domain email phải nằm trong `GOOGLE_ALLOWED_DOMAINS`
   - nếu user đã tồn tại (theo `google_sub`) và `is_active = false` → từ chối
6. Tạo mới hoặc cập nhật `admin_users` (role tính lại mỗi lần login dựa trên `SUPERADMIN_EMAILS`).
7. Tạo bản ghi `admin_sessions`, set cookie `va_ebr_session` (HttpOnly), redirect về FE (`FRONTEND_HOME_PATH`).
8. Mọi lỗi ở bước 3-6 → redirect về `FRONTEND_LOGIN_PATH?error=<reason>`.

FE dùng `GET /api/auth/session` (không bắt buộc đăng nhập, trả `{ user: null }` nếu chưa login) để quyết định hiển thị `ProtectedRoute` hay trang `/login`. Middleware `requireAuth` bảo vệ các route còn lại, trả 401 nếu session không hợp lệ/hết hạn.

Session sống 7 ngày (`sessionTtlMs`), lưu trong bảng `admin_sessions`, không phải JWT stateless — cho phép thu hồi session tức thì (xoá row) khi cần.

## Phân quyền

Hai role: `staff`, `superadmin` — lưu trong `admin_users.role`, gán lại **mỗi lần đăng nhập** dựa trên `SUPERADMIN_EMAILS` trong `server/.env` (không phải cấp một lần rồi cố định trong DB).

- `staff`: tab "Đăng ký", "Lịch chung"
- `superadmin`: thêm tab "Duyệt yêu cầu" (approve/reject), và có thể "xem như" (`viewAsRole`) vai trò `staff` để kiểm tra UI phía client — đây là toggle chỉ ở FE, không đổi quyền thật ở BE.

Route bookings (`/api/bookings/*`) yêu cầu `requireAuth` nhưng **không** phân biệt role ở tầng backend — `approve`/`reject` hiện gọi được bởi bất kỳ user đã đăng nhập nào có cookie hợp lệ. Việc chỉ superadmin thấy nút duyệt hiện chỉ được thực thi ở FE (xem [NEXT_STEPS.md](NEXT_STEPS.md)).

## Database (MySQL)

### `admin_users`
| cột | kiểu | ghi chú |
|---|---|---|
| id | BIGINT UNSIGNED PK AI | |
| google_sub | VARCHAR(64) UNIQUE | Google `sub` claim, định danh chính |
| email | VARCHAR(255) UNIQUE | |
| name, avatar_url | VARCHAR | refresh mỗi lần login |
| role | ENUM('staff','superadmin') | tính lại mỗi lần login |
| is_active | TINYINT(1) | vô hiệu hoá tài khoản thủ công |
| last_login_at | DATETIME NULL | |

### `admin_sessions`
| cột | kiểu | ghi chú |
|---|---|---|
| id | VARCHAR(64) PK | session token |
| admin_user_id | FK → admin_users, ON DELETE CASCADE | |
| expires_at | DATETIME | |

### `bookings`
| cột | kiểu | ghi chú |
|---|---|---|
| id | VARCHAR(20) PK | dạng `EBR-1001`, sinh bằng `COUNT(*)` (xem rủi ro race condition ở [NEXT_STEPS.md](NEXT_STEPS.md)) |
| org, contact, phone, event | VARCHAR | thông tin người đăng ký |
| location | VARCHAR(32) | `EBR Âu Cơ` \| `EBR Lạc Long Quân` |
| type | VARCHAR(32) | loại hoạt động |
| booking_date, start_time, end_time | DATE / VARCHAR(5) | giờ dạng chuỗi `HH:mm`, không phải TIME |
| attendees | INT | |
| status | ENUM('pending','approved','rejected') | |
| reason | TEXT | lý do từ chối |
| requested_by_email | VARCHAR(255) | |
| decided_by_admin_id | FK → admin_users, ON DELETE SET NULL | ai duyệt/từ chối |

Không có bảng/cột nào kiểm tra **trùng lịch** (double-booking) ở tầng DB hay API hiện tại.

## API Endpoints

Base URL: `VITE_API_BASE_URL` (mặc định `http://localhost:4000`)

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/health` | — | health check |
| GET | `/auth/google/login` | — | bắt đầu OAuth flow |
| GET | `/auth/google/callback` | — | OAuth callback |
| POST | `/api/auth/logout` | cookie | xoá session |
| GET | `/api/auth/me` | required | thông tin user hiện tại |
| GET | `/api/auth/session` | optional | `{ user: null }` nếu chưa login (không trả 401) |
| GET | `/api/bookings` | required | danh sách tất cả booking |
| POST | `/api/bookings` | required | tạo booking mới |
| POST | `/api/bookings/:id/approve` | required | duyệt |
| POST | `/api/bookings/:id/reject` | required | từ chối, body `{ reason }` bắt buộc |

## Frontend

- **Routing**: `react-router-dom` v6 — `/login` (public) và `/*` (`ProtectedRoute` bọc `EbrApp`).
- **State**: `AuthContext` (user, loading, viewAsRole) + `useBookings` hook (fetch danh sách, các action add/approve/reject) + `useToast` cho thông báo ngắn.
- **Persist cục bộ** (`src/lib/storage.ts`): tab đang xem, đã đồng ý điều khoản sử dụng phòng theo từng email (localStorage).
- **Không có state management library** (Redux/Zustand) — cố tình giữ đơn giản do phạm vi nhỏ.

## Điểm cần lưu ý khi mở rộng

Xem chi tiết & ưu tiên ở [NEXT_STEPS.md](NEXT_STEPS.md). Tóm tắt các rủi ro kỹ thuật đã biết:
1. Sinh mã booking bằng `COUNT(*)` có thể trùng khi có 2 request đồng thời.
2. Không kiểm tra trùng lịch (cùng địa điểm, cùng khung giờ).
3. Phân quyền `approve`/`reject` chưa enforce ở backend, chỉ ẩn ở UI.
4. Chưa có test tự động (unit/integration/e2e).
5. Booking chưa gửi email xác nhận thật (toast nói "đã gửi email" nhưng backend chưa tích hợp email service).
6. Chưa đồng bộ với Google Calendar — booking đã duyệt chỉ nằm trong bảng `bookings`, không tự tạo event trên lịch Google thật (tính năng đồng bộ 2 chiều đang ở giai đoạn lên kế hoạch, xem [NEXT_STEPS.md](NEXT_STEPS.md) mục 5).
