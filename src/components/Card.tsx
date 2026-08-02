interface CardProps {
  title: string;
  value: string;
  detail?: string;
}

export function Card({ title, value, detail }: CardProps) {
  return (
    <div className="card">
      <span className="card-title">{title}</span>
      <strong className="card-value">{value}</strong>
      {detail && <span className="card-detail">{detail}</span>}
    </div>
  );
}
