export function Footer() {
  return (
    <footer>
      <span>Phòng Công Nghệ · thiết lập theo yêu cầu P.HCNS · liên hệ chị Hiền — 039 5784 501</span>
      <span className="swatches" aria-hidden="true">
        <i className="sw" style={{ background: "var(--tri-thuc)" }} />
        <i className="sw" style={{ background: "var(--khai-phong)" }} />
        <i className="sw" style={{ background: "var(--trach-nhiem)" }} />
        <i className="sw" style={{ background: "var(--nhan-ai)" }} />
        <i className="sw" style={{ background: "var(--ban-linh)" }} />
      </span>
    </footer>
  );
}
