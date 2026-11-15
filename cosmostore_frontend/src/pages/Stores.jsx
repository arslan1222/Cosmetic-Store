import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { catalogApi } from "../api/endpoints";
import { PageSpinner, EmptyState } from "../components/ui";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi
      .stores()
      .then((res) => setStores(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl mb-2">Boutiques</h1>
      <p className="text-ink/60 mb-10">Independent cosmetic vendors selling on CosmoStore.</p>

      {stores.length === 0 ? (
        <EmptyState icon={Store} title="No boutiques yet" description="Check back soon." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s) => (
            <Link
              key={s.id}
              to={`/store/${s.id}`}
              className="group rounded-2xl bg-white border border-ink/10 p-6 hover:border-berry-300 hover:shadow-soft transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center mb-4">
                <Store size={20} className="text-berry-500" />
              </div>
              <h3 className="font-display text-xl mb-1 group-hover:text-berry-600">{s.store_name}</h3>
              <p className="text-sm text-ink/60 line-clamp-2 mb-3">{s.description}</p>
              <p className="text-xs text-ink/40">{s.product_count} products</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
