# VA Booking EBR

Ứng dụng nội bộ đặt lịch sử dụng phòng **EBR** (Employee Break Room / phòng sinh hoạt chung) tại VA Schools — cho phép cán bộ nhân viên đăng ký, P.HCNS (superadmin) duyệt/từ chối, và xem lịch dùng phòng chung.

Đăng nhập bằng **Google Workspace SSO**, giới hạn theo domain email nội bộ (`vaschools.edu.vn`, `hcm.vaschools.edu.vn`).

## Tính năng chính

- **Đăng ký sử dụng phòng** — form nhập đơn vị, người liên hệ, SĐT, tên sự kiện, địa điểm (EBR Âu Cơ / EBR Lạc Long Quân), loại hoạt động, ngày giờ, số người tham dự, ghi chú.
- **Duyệt yêu cầu** (chỉ superadmin) — xem danh sách yêu cầu chờ duyệt, duyệt hoặc từ chối kèm lý do.
- **Lịch chung** — xem tổng quan các booking đã duyệt/chờ duyệt theo thời gian.
- **Phân quyền 2 cấp**: `staff` (đăng ký + xem lịch) và `superadmin` (thêm quyền duyệt/từ chối). Superadmin có thể "xem như" (view-as) vai trò staff để kiểm tra giao diện.
- **Điều khoản sử dụng phòng** — modal bắt buộc đồng ý lần đầu đăng nhập, có thể xem lại.
- **Google SSO** — đăng nhập bằng tài khoản Google Workspace nội bộ, tự tạo tài khoản admin trong DB ở lần đăng nhập đầu tiên, giới hạn theo domain cho phép.

## Tech stack

### Frontend (`/`)
- **React 18** + **TypeScript**, build bằng **Vite 5**
- **React Router v6** cho routing (`/login`, `/*` protected)
- CSS thuần (design tokens trong `src/styles/tokens.css`), không dùng UI framework
- State cục bộ qua React Context (`AuthContext`) + custom hooks (`useBookings`, `useToast`)
- ESLint (`typescript-eslint`, `eslint-plugin-react-hooks`)

### Backend (`/server`)
- **Node.js** + **Express 4** + **TypeScript**, chạy dev qua `tsx watch`
- **MySQL** (qua `mysql2`) — 3 bảng: `admin_users`, `admin_sessions`, `bookings`
- **Google OAuth 2.0** (`google-auth-library`) cho SSO, tự quản lý session bằng cookie riêng (không dùng JWT), lưu session trong DB (`admin_sessions`)
- `cookie-parser`, `cors` (credentialed, origin = frontend URL)
- Phân quyền qua allowlist domain + danh sách email superadmin trong biến môi trường

### Hạ tầng dev
- Chạy trên **ServBay** (local MySQL + Node runtime trên Windows)
- `dev.ps1` ở cả root và `server/` dùng trực tiếp `node.exe` của ServBay để tránh lỗi spawn qua `cmd.exe` lồng nhau trên Windows

## Cấu trúc thư mục

```
va-ebr/
├── src/                      # Frontend React app
│   ├── auth/                 # AuthContext, ProtectedRoute
│   ├── components/           # BookingForm, ApprovePanel, CalendarPanel, ...
│   ├── hooks/                 # useBookings, useToast
│   ├── lib/                  # api.ts (fetch wrapper), constants, format, storage
│   ├── pages/Login.tsx
│   └── styles/
├── server/                   # Backend Express API
│   └── src/
│       ├── auth/             # oauth.ts, allowlist.ts, session-cookie.ts
│       ├── db/                # pool.ts, schema.sql, adminUsers.ts, bookings.ts, sessions.ts, migrations/
│       ├── middleware/        # requireAuth.ts
│       └── routes/            # auth.ts, bookings.ts
├── public/images/             # logo, favicon, background
├── dev.ps1                    # start frontend (Vite) trên ServBay
└── server/dev.ps1             # start backend (tsx watch) trên ServBay
```

## Cài đặt & chạy dev

### 1. Yêu cầu
- Node.js (khuyến nghị dùng bản đi kèm ServBay trên Windows, xem `dev.ps1`)
- MySQL server đang chạy local (ServBay hoặc tương đương)

### 2. Cấu hình môi trường

Copy file mẫu và điền giá trị thật (**không commit file `.env` thật**):

```bash
cp .env.example .env
cp server/.env.example server/.env
```

`server/.env` cần:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — tạo OAuth Client trên Google Cloud Console, loại **Web application**, redirect URI = `{APP_URL}/auth/google/callback`
- `GOOGLE_ALLOWED_DOMAINS` — danh sách domain email được phép đăng nhập
- `SUPERADMIN_EMAILS` — email được gán quyền superadmin mỗi lần đăng nhập
- `DB_*` — thông tin kết nối MySQL (dùng user riêng, không dùng root)

### 3. Khởi tạo database

```sql
CREATE DATABASE va_ebr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chạy `server/src/db/schema.sql` để tạo bảng. Nếu nâng cấp từ DB cũ, chạy thêm các file trong `server/src/db/migrations/`.

### 4. Cài dependencies

```bash
npm install
cd server && npm install
```

### 5. Chạy dev

```bash
# Backend (terminal 1)
cd server
npm run dev
# hoặc trên Windows/ServBay: ./dev.ps1

# Frontend (terminal 2, ở thư mục gốc)
npm run dev
# hoặc trên Windows/ServBay: ./dev.ps1
```

Frontend mặc định chạy ở `http://localhost:5173`, backend ở `http://localhost:4000`.

### 6. Build production

```bash
npm run build          # frontend -> dist/
cd server && npm run build  # backend -> server/dist/
```

## Tài liệu thêm

- [docs/PROGRESS.md](docs/PROGRESS.md) — những gì đã hoàn thành
- [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) — việc cần làm tiếp theo
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — chi tiết kiến trúc, API, schema DB
