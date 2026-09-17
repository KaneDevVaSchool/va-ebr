import { useState } from "react";
import { TABS } from "../lib/constants";
import type { AdminRole } from "../lib/api";
import type { TabId } from "../types";
import { useAuth } from "../auth/AuthContext";

interface HeaderProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
}

export function Header({ activeTab, onChangeTab }: HeaderProps) {
  const { user, logout, viewAsRole, setViewAsRole } = useAuth();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const effectiveRole: AdminRole | undefined = viewAsRole ?? user?.role;
  const visibleTabs = TABS.filter((t) => !effectiveRole || t.roles.includes(effectiveRole));

  return (
    <header className="top">
      <div className="brand">
        <div className="mark">EBR</div>
        <div>
          <h1>Đặt phòng EBR</h1>
          <p>Âu Cơ · Lạc Long Quân — P.HCNS quản lý duyệt</p>
        </div>
      </div>
      <nav className="tabs" role="tablist">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => onChangeTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {user && (
        <div className="user-menu">
          {user.role === "superadmin" && (
            <select
              className="view-as-select"
              value={viewAsRole ?? "superadmin"}
              onChange={(e) => {
                const next = e.target.value as AdminRole;
                setViewAsRole(next === "superadmin" ? null : next);
              }}
              title="Chế độ xem"
            >
              <option value="superadmin">Xem như: Superadmin</option>
              <option value="staff">Xem như: Nhân viên</option>
            </select>
          )}
          {user.avatarUrl && !avatarFailed ? (
            <img
              className="user-avatar"
              src={user.avatarUrl}
              alt=""
              width={28}
              height={28}
              referrerPolicy="no-referrer"
              onError={() => {
                console.warn("[avatar] không tải được ảnh:", user.avatarUrl);
                setAvatarFailed(true);
              }}
            />
          ) : (
            <span className="user-avatar user-avatar-fallback">{user.name.charAt(0) || "?"}</span>
          )}
          <span className="user-email">{user.email}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void logout()}>
            Đăng xuất
          </button>
        </div>
      )}
    </header>
  );
}
