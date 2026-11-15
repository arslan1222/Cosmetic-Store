import { useEffect, useState } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { formatPKR, formatDateTime } from "../../utils/format";
import { EmptyState, PageSpinner, Button } from "../../components/ui";
import { RiskBadge, RiskMeter } from "../../components/RiskIndicators";

export default function AdminFraudReview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const toast = useToast();

  const load = () => adminApi.flaggedOrders().then((res) => setOrders(res.data.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const decide = async (orderId, decision) => {
    setActingId(orderId);
    try {
      await adminApi.fraudDecision(orderId, decision);
      toast.success(`Order ${decision}.`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <h2 className="font-display text-xl mb-2">Fraud review center</h2>
      <p className="text-ink/55 text-sm mb-6">
        Orders the ML model flagged as suspicious, held before confirmation.
      </p>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="Nothing to review"
          description="No orders are currently flagged for review."
        />
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-amber-200 rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-ink/50">
                    {o.customer_name} · {formatDateTime(o.created_at)}
                  </p>
                </div>
                <span className="font-semibold">{formatPKR(o.grand_total)}</span>
              </div>

              {/* Model evidence */}
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">Flagged by fraud detection model</p>
                  </div>
                  <RiskBadge probability={o.fraud_check.fraud_probability} />
                </div>
                <RiskMeter probability={o.fraud_check.fraud_probability} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-ink/60 mt-4">
                  <div><span className="text-ink/40 block">Type</span>{o.fraud_check.transaction_type}</div>
                  <div><span className="text-ink/40 block">Amount</span>{formatPKR(o.fraud_check.amount)}</div>
                  <div><span className="text-ink/40 block">Payment</span>{o.payment_method}</div>
                  <div><span className="text-ink/40 block">Model</span>{o.fraud_check.model_version}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-ink/70 mb-5">
                {o.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatPKR(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => decide(o.id, "approved")}
                  disabled={actingId === o.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check size={15} /> Approve order
                </Button>
                <Button
                  variant="danger"
                  onClick={() => decide(o.id, "rejected")}
                  disabled={actingId === o.id}
                >
                  <X size={15} /> Reject order
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
