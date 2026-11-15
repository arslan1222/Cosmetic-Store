import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { StatusBadge, PageSpinner, Button, EmptyState } from "../../components/ui";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => adminApi.stores().then((res) => setStores(res.data.data));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    try {
      await adminApi.setStoreStatus(id, status);
      toast.success(`Store ${status}.`);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Vendor stores ({stores.length})</h2>
      {stores.length === 0 ? (
        <EmptyState title="No vendor stores yet" />
      ) : (
        <div className="space-y-4">
          {stores.map((s) => (
            <div key={s.id} className="bg-white border border-ink/10 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium">{s.store_name}</p>
                <p className="text-xs text-ink/50">{s.product_count} products · {s.commission_rate}% commission</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={s.status} />
                {s.status !== "approved" && (
                  <Button onClick={() => setStatus(s.id, "approved")} className="!px-3 !py-1.5 text-xs">
                    Approve
                  </Button>
                )}
                {s.status !== "suspended" && (
                  <Button variant="danger" onClick={() => setStatus(s.id, "suspended")} className="!px-3 !py-1.5 text-xs">
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
