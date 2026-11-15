import { riskLevel, RISK_STYLES } from "../utils/format";

/** Small colored pill: "Low risk" / "Medium risk" / "High risk" */
export function RiskBadge({ probability }) {
  const level = riskLevel(probability);
  const style = RISK_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
      {style.label}
    </span>
  );
}

/** Horizontal probability bar with percentage label, used in fraud review/logs */
export function RiskMeter({ probability, showLabel = true }) {
  const level = riskLevel(probability);
  const style = RISK_STYLES[level];
  const pct = Math.min(100, Math.max(0, (Number(probability) || 0) * 100));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-ink/50">Fraud probability</span>
          <span className="text-xs font-semibold text-ink">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
