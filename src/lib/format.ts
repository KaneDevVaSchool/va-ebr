export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export function dayNameOf(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return DAY_NAMES[d.getDay()];
}

export function orgFromEmail(email: string): string {
  const local = email.split("@")[0];
  const label = local
    .replace(/[._]/g, " ")
    .replace(/\S+/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
  return `Phòng ${label}`;
}
