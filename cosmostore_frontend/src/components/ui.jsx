import { Loader2 } from "lucide-react";
import { STATUS_STYLES, statusLabel } from "../utils/format";

export function Spinner({ size = 20, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-berry-500 ${className}`} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size={28} />
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-4">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-blush flex items-center justify-center mb-4">
          <Icon size={24} className="text-berry-500" />
        </div>
      )}
      <h3 className="font-display text-xl text-ink mb-1">{title}</h3>
      {description && <p className="text-ink/60 text-sm max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  );
}

export function Button({ as: Comp = "button", variant = "primary", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-berry-500 text-white hover:bg-berry-600",
    secondary: "bg-ink text-cream hover:bg-ink/85",
    outline: "border border-ink/20 text-ink hover:border-berry-400 hover:text-berry-600",
    ghost: "text-ink/70 hover:text-berry-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <Comp className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Comp>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink/80 mb-1.5">{label}</span>}
      <input
        className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors ${
          error ? "border-red-400" : "border-ink/15 focus:border-berry-400"
        } ${className}`}
        {...props}
      />
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink/80 mb-1.5">{label}</span>}
      <select
        className={`w-full bg-white border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-berry-400 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function TextArea({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-ink/80 mb-1.5">{label}</span>}
      <textarea
        className={`w-full bg-white border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-berry-400 ${className}`}
        {...props}
      />
    </label>
  );
}
