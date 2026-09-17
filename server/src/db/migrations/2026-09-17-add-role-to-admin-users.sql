-- Chạy thủ công trên DB đã tồn tại (schema.sql chỉ áp dụng cho DB mới tinh).
ALTER TABLE admin_users
  ADD COLUMN role ENUM('staff','superadmin') NOT NULL DEFAULT 'staff' AFTER avatar_url;

UPDATE admin_users SET role = 'superadmin' WHERE email = 'khoana@hcm.vaschools.edu.vn';
