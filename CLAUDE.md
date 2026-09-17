# CLAUDE.md

Hướng dẫn cho Claude Code (hoặc AI assistant khác) khi làm việc trong repo này.

## Dự án là gì

**va-booking-ebr** — app nội bộ VA Schools để đặt lịch phòng EBR (Âu Cơ / Lạc Long Quân). Frontend React ở root, backend Express+MySQL ở `server/`. Chi tiết đầy đủ: [README.md](README.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), việc đã làm/chưa làm: [docs/PROGRESS.md](docs/PROGRESS.md), [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md).

## Quy tắc bắt buộc

1. **Không bao giờ commit `.env` thật.** Cả root và `server/` đều có `.gitignore` loại `.env`/`.env.local`. Chỉ sửa `.env.example` khi thêm biến môi trường mới, không bao giờ điền giá trị thật vào file example.
2. **Không log/in secrets** (Google client secret, mật khẩu DB, session token) ra console, commit message, hay PR description.
3. **Repo này là public trên GitHub.** Trước khi commit, luôn tự hỏi: file này có chứa thông tin nhạy cảm (secret, dữ liệu thật của người dùng/CBNVGV, nội bộ trường) không?
4. Khi thêm route backend cần xác thực, dùng `requireAuth` middleware (`server/src/middleware/requireAuth.ts`). Khi thêm route chỉ dành cho superadmin, **phải** kiểm tra role ở backend — không chỉ ẩn nút ở UI (xem NEXT_STEPS.md mục 1, đây là lỗ hổng đã biết cần vá).
5. Đổi schema DB → thêm file migration mới trong `server/src/db/migrations/YYYY-MM-DD-mo-ta.sql`, không sửa `schema.sql` để áp cho DB đã tồn tại.
6. Giữ nguyên phong cách: comment/copy trong UI và code viết bằng **tiếng Việt** (đây là app nội bộ trường Việt Nam), giữ nguyên convention đó khi thêm code mới.

## Lệnh hay dùng

```bash
# Cài đặt
npm install && (cd server && npm install)

# Dev — chạy song song 2 terminal
cd server && npm run dev     # backend :4000
npm run dev                  # frontend :5173 (ở root)

# Trên Windows/ServBay có thể dùng dev.ps1 ở mỗi thư mục thay vì npm run dev

# Build
npm run build                # frontend
(cd server && npm run build) # backend

# Lint
npm run lint
```

Chưa có script `test` — xem NEXT_STEPS.md mục 5 nếu được yêu cầu thêm test.

## Kiến trúc tóm tắt (chi tiết ở docs/ARCHITECTURE.md)

- Auth: Google OAuth 2.0 → session cookie riêng lưu trong bảng `admin_sessions` (không phải JWT).
- Role: `staff` / `superadmin`, tính lại **mỗi lần login** dựa vào `SUPERADMIN_EMAILS` trong `server/.env` — không phải giá trị cố định một lần.
- 3 bảng DB: `admin_users`, `admin_sessions`, `bookings`.
- FE gọi BE qua `fetch` với `credentials: "include"`, CORS origin cố định = `FRONTEND_URL`.

## Rủi ro kỹ thuật đã biết (đừng vô tình "sửa" chúng thành bug worse hơn, và ưu tiên khi được yêu cầu dọn nợ kỹ thuật)

Xem danh sách đầy đủ và có ngữ cảnh ở [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md). Tóm tắt nhanh:
- `approve`/`reject` chưa enforce role ở backend.
- Sinh mã `EBR-xxxx` bằng `COUNT(*)` — có thể race condition.
- Không chống trùng lịch (double-booking) cùng địa điểm/khung giờ.
- Toast nói "đã gửi email" nhưng chưa có tích hợp email thật.

## Khi được yêu cầu deploy / thay đổi hạ tầng

Dự án hiện **chỉ chạy local qua ServBay trên Windows**, chưa có Docker/CI/CD/production deploy. Nếu người dùng yêu cầu deploy, đây là quyết định lớn (chọn hosting, cấu hình domain, `GOOGLE_REDIRECT_URI` mới, `SECURE_COOKIE=true`) — hỏi rõ mục tiêu trước khi tự ý chọn hạ tầng.
