interface StatCardProps {
  label: string;
  value: number;
  tone?: "pending" | "approved" | "rejected";
}

export function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <div className={`stat${tone ? ` ${tone}` : ""}`}>
      <div className="n">{value}</div>
      <div className="l">{label}</div>
    </div>
  );
}
