# Việc cần làm tiếp theo

Sắp xếp theo mức độ ưu tiên. Xem bối cảnh kỹ thuật đầy đủ ở [ARCHITECTURE.md](ARCHITECTURE.md).

## Ưu tiên cao — an toàn & đúng đắn dữ liệu

1. **Enforce phân quyền `approve`/`reject` ở backend**
   Hiện `POST /api/bookings/:id/approve` và `/reject` chỉ yêu cầu `requireAuth` (đã đăng nhập), không kiểm tra `role === 'superadmin'`. Bất kỳ tài khoản `staff` hợp lệ nào cũng có thể gọi thẳng API để duyệt/từ chối dù UI có ẩn nút. Cần thêm middleware `requireRole('superadmin')` cho 2 route này.

2. **Chống trùng lịch (double-booking)**
   Chưa có kiểm tra khi tạo booking mới hoặc khi duyệt xem có booking khác đã `approved` trùng `location` + khung giờ chưa. Cần thêm validation ở `createBooking`/`approveBooking` (hoặc constraint ở DB) để tránh 2 sự kiện approved đè lịch nhau.

3. **Sửa race condition khi sinh mã booking**
   `nextBookingId()` trong `server/src/db/bookings.ts` dùng `SELECT COUNT(*)` rồi cộng 1001 — hai request tạo booking đồng thời có thể sinh trùng `id` (PK), request thứ hai sẽ lỗi hoặc (tệ hơn nếu không xử lý lỗi) ghi đè. Nên đổi sang `AUTO_INCREMENT` thật hoặc UUID, format lại thành `EBR-xxxx` khi hiển thị.

4. **Gửi email thật khi duyệt/từ chối**
   Toast hiện nói "email xác nhận đã gửi tới ..." nhưng backend chưa gọi bất kỳ email service nào — đây là thông báo giả. Cần tích hợp thật (Gmail API qua service account, hoặc SMTP nội bộ) hoặc sửa lại thông báo cho đúng thực tế trước khi đưa ra production cho người dùng thật.

5. **Đồng bộ 2 chiều với Google Calendar** _(đã yêu cầu bổ sung — 2026-09-17)_
   Mục tiêu: khi một booking được `approved`, tự động tạo/cập nhật event trên Google Calendar chung của trường; khi event đó bị sửa/xoá trực tiếp trên Google Calendar, phản ánh ngược lại vào `bookings` (đổi giờ, huỷ).
   Việc cần làm:
   - Thêm scope `https://www.googleapis.com/auth/calendar` vào OAuth consent (hiện `server/src/auth/oauth.ts` chỉ xin scope profile/email cho đăng nhập) — cân nhắc dùng **service account** riêng cho ghi lịch chung thay vì scope theo từng user, để việc ghi lịch không phụ thuộc token của người duyệt.
   - Thêm cột `google_event_id` vào bảng `bookings` (migration mới trong `server/src/db/migrations/`) để map booking ↔ event.
   - Chiều **app → Calendar**: gọi Google Calendar API (`events.insert`/`events.patch`/`events.delete`) trong `approveBooking`/`rejectBooking` (`server/src/db/bookings.ts`) hoặc ở route layer sau khi đổi status.
   - Chiều **Calendar → app**: dùng [Google Calendar push notifications (watch channel)](https://developers.google.com/calendar/api/guides/push) hoặc polling định kỳ bằng `syncToken`, xử lý webhook ở route mới (vd. `POST /webhooks/google-calendar`), đối chiếu `google_event_id` để cập nhật `bookings`.
   - Xử lý xung đột: nếu event bị sửa trùng giờ với booking khác đã duyệt, hoặc bị xoá thủ công trên Calendar — cần quyết định app là nguồn sự thật (source of truth) hay Calendar, và log rõ khi có xung đột thay vì âm thầm ghi đè.
   - Cân nhắc rate limit & retry khi gọi Calendar API (dùng queue/job đơn giản thay vì gọi đồng bộ trong request duyệt, để tránh duyệt bị chậm/lỗi khi Google API sập).

## Ưu tiên trung bình — chất lượng & vận hành

6. **Test tự động**
   Hiện không có test nào (`package.json` không có script `test`). Đề xuất:
   - Backend: Vitest/Jest cho `allowlist.ts`, `oauth.ts` (mock Google), route handlers (supertest)
   - Frontend: Vitest + React Testing Library cho `BookingForm`, `ApprovePanel`, `AuthContext`

7. **CI/CD**
   Thêm GitHub Actions: lint + build (`tsc -b`) cho cả FE/BE trên mỗi PR. Sau khi có test, thêm bước chạy test.

8. **Deploy production**
   Hiện chỉ chạy local qua ServBay (Windows). Cần quyết định hạ tầng đích (VPS, Docker, hay PaaS), viết `Dockerfile`/`docker-compose.yml` cho backend + MySQL, cấu hình `SECURE_COOKIE=true` và HTTPS thật, domain riêng cho `GOOGLE_REDIRECT_URI`.

9. **Rotate secrets đã từng nằm trong `server/.env` local**
   File `.env` không được commit (đã kiểm tra `.gitignore`), nhưng nếu máy này từng đồng bộ qua kênh không an toàn, cân nhắc tạo lại Google OAuth client secret và đổi mật khẩu MySQL cho chắc chắn.

10. **Validate input chặt hơn ở backend**
    `POST /api/bookings` hiện chỉ kiểm tra field có mặt và `end > start` dạng string so sánh — nên validate thêm: định dạng giờ hợp lệ (`HH:mm`), `attendees > 0`, `location`/`type` nằm trong enum cho phép (hiện nhận string bất kỳ), ngày không ở quá khứ.

## Ưu tiên thấp — cải thiện trải nghiệm

11. **Phân trang / lọc danh sách booking**
    `listBookings()` lấy toàn bộ bảng không giới hạn — sẽ chậm dần khi dữ liệu lớn. Thêm filter theo trạng thái/ngày/địa điểm và phân trang.

12. **Audit log**
    Ghi lại lịch sử ai duyệt/từ chối khi nào (đã có `decided_by_admin_id` nhưng chưa có bảng lịch sử đầy đủ nếu cần audit chi tiết hơn).

13. **Quản lý user admin qua UI**
    Hiện việc vô hiệu hoá tài khoản (`is_active`) hay xem danh sách admin phải thao tác trực tiếp DB. Có thể thêm trang quản trị cho superadmin.

## Sau khi hoàn tất kiểm thử (test xong hết các mục trên)

14. **Đồng bộ với API HRM (va-hrm)** _(đã yêu cầu bổ sung — 2026-09-17, cố ý làm sau cùng)_
    Mục tiêu: liên kết dữ liệu người đăng ký/duyệt booking với hệ thống nhân sự nội bộ **va-hrm** (vd. đối chiếu đơn vị/phòng ban, chức danh người đăng ký, hoặc đồng bộ danh sách nhân viên để tự động điền `org`/`contact` thay vì nhập tay).
    Điều kiện tiên quyết trước khi bắt đầu: **toàn bộ các mục ưu tiên cao/trung bình ở trên đã được test kỹ** (đặc biệt mục 1 enforce phân quyền, mục 6 test tự động) — vì tích hợp thêm một hệ thống ngoài trong lúc nền tảng auth/booking chưa vững sẽ khó debug khi có lỗi (không rõ lỗi do va-ebr hay do phía HRM).
    Việc cần làm khi tới lượt:
    - Xác định hợp đồng API phía `va-hrm` cung cấp (REST? GraphQL? xác thực bằng gì — API key, OAuth service-to-service?) — chưa có thông tin cụ thể tại thời điểm ghi chú này, cần khảo sát repo `va-hrm` trước khi thiết kế.
    - Quyết định chiều đồng bộ: chỉ đọc (HRM → EBR để autofill thông tin người đăng ký) hay ghi ngược lại (EBR → HRM để log việc dùng phòng vào hồ sơ đơn vị).
    - Nếu cần gọi API HRM theo lịch, cân nhắc cùng cơ chế job/queue đã đề xuất cho Google Calendar sync (mục 5) thay vì tạo 2 cơ chế nền riêng biệt.

## Ghi chú vận hành khi phát triển tiếp

- Khi thêm route mới cần xác thực, luôn dùng middleware `requireAuth` (`server/src/middleware/requireAuth.ts`) làm chuẩn.
- Khi thêm role/permission mới, cập nhật cả `TABS` (`src/lib/constants.ts`) ở FE **và** kiểm tra tương ứng ở BE — đừng chỉ dựa vào ẩn UI.
- Khi đổi schema DB, thêm file migration mới trong `server/src/db/migrations/` theo format `YYYY-MM-DD-mo-ta.sql`, không sửa trực tiếp `schema.sql` cho DB đã tồn tại.
