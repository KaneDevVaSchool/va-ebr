import type { AdminRole } from "./api";
import type { ActivityType, BookingStatus, EbrLocation, TabId } from "../types";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const LOCATIONS: EbrLocation[] = ["EBR Âu Cơ", "EBR Lạc Long Quân"];

export const ACTIVITY_TYPES: ActivityType[] = ["Họp nội bộ", "Sinh nhật", "Gặp đối tác", "Khác"];

export const TABS: { id: TabId; label: string; roles: AdminRole[] }[] = [
  { id: "form", label: "Đăng ký", roles: ["staff", "superadmin"] },
  { id: "approve", label: "Duyệt yêu cầu", roles: ["superadmin"] },
  { id: "calendar", label: "Lịch chung", roles: ["staff", "superadmin"] },
];

export const TERMS_TEXT =
  "Sau khi sử dụng, CBNVGV vui lòng tự vệ sinh ly cá nhân, phân loại rác đúng nơi quy định và hoàn trả mặt bằng sạch đẹp, ngăn nắp cho người sử dụng sau. Trong trường hợp xảy ra hư hỏng, mất mát thiết bị/mặt bằng, đơn vị đăng ký có trách nhiệm báo cáo cho P.HCNS và chịu trách nhiệm xử lý.";
