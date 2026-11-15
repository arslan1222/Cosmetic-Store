import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatPKR } from "../utils/format";
import { API_BASE } from "../api/client";

// Deterministic soft gradient placeholder so the catalog still looks curated
// before real product photography is uploaded per-store.
const GRADIENTS = [
  "from-berry-100 to-blush",
  "from-gold-400/30 to-berry-100",
  "from-blush to-berry-200/60",
  "from-berry-50 to-gold-400/20",
];

function gradientFor(id) {
  return GRADIENTS[id % GRADIENTS.length];
}

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return API_BASE.replace(/\/api$/, "") + url;
}

export default function ProductCard({ product }) {
  const image = resolveImage(product.image_url);
  const hasDiscount = product.discount_percent > 0;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div
        className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br ${gradientFor(
          product.id
        )} mb-3`}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl text-ink/20 italic">{product.name?.[0]}</span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-ink text-cream text-xs font-medium px-2 py-1 rounded-full">
            -{product.discount_percent}%
          </span>
        )}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
            <span className="text-cream text-sm tracking-wide">Sold out</span>
          </div>
        )}
      </div>

      <p className="text-xs uppercase tracking-wide text-berry-500 mb-1">{product.brand || product.store_name}</p>
      <h3 className="text-ink font-medium leading-snug line-clamp-2 group-hover:text-berry-600 transition-colors">
        {product.name}
      </h3>

      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-ink">{formatPKR(product.final_price)}</span>
          {hasDiscount && (
            <span className="text-ink/40 text-sm line-through">{formatPKR(product.price)}</span>
          )}
        </div>
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-ink/60">
            <Star size={12} className="fill-gold-500 text-gold-500" />
            {product.avg_rating}
          </div>
        )}
      </div>
    </Link>
  );
}
