import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Store } from "lucide-react";
import { catalogApi } from "../api/endpoints";
import ProductCard from "../components/ProductCard";
import { PageSpinner, EmptyState } from "../components/ui";

export default function StoreDetail() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .store(id)
      .then((res) => setStore(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!store) return null;

  return (
    <div>
      <div className="bg-white border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center shrink-0">
            <Store size={26} className="text-berry-500" />
          </div>
          <div>
            <h1 className="text-3xl mb-1">{store.store_name}</h1>
            <p className="text-ink/60 max-w-xl">{store.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-ink/50 text-sm mb-6">{store.products.length} products</p>
        {store.products.length === 0 ? (
          <EmptyState title="No products listed yet" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {store.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
