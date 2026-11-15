import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Minus, Plus, ShoppingBag, Store } from "lucide-react";
import { catalogApi } from "../api/endpoints";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatPKR, formatDate } from "../utils/format";
import { PageSpinner, Button, TextArea } from "../components/ui";
import { API_BASE } from "../api/client";

function resolveImage(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return API_BASE.replace(/\/api$/, "") + url;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const load = () =>
    catalogApi.product(id).then((res) => {
      setProduct(res.data.data);
      const gallery = res.data.data.images;
      setActiveImage(gallery?.length ? gallery[0].image_url : res.data.data.image_url);
    });

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    setQty(1);
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!product) return null;

  const gallery = product.images?.length ? product.images : (product.image_url ? [{ id: "cover", image_url: product.image_url }] : []);
  const image = resolveImage(activeImage);

  const handleAdd = async () => {
    if (!user) {
      toast.info("Please log in to add items to your cart.");
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      toast.success(`Added ${qty} × ${product.name} to your cart.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await catalogApi.addReview(product.id, { rating: reviewRating, comment: reviewComment });
      toast.success("Thanks for your review!");
      setReviewComment("");
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-berry-100 to-blush">
            {image ? (
              <img src={image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-8xl text-ink/20 italic">{product.name[0]}</span>
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === img.image_url ? "border-berry-500" : "border-transparent"
                  }`}
                >
                  <img src={resolveImage(img.image_url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link
            to={`/store/${product.store_id}`}
            className="inline-flex items-center gap-1.5 text-sm text-berry-600 hover:underline mb-3"
          >
            <Store size={14} /> {product.store_name}
          </Link>
          <h1 className="text-3xl mb-2">{product.name}</h1>
          {product.brand && <p className="text-ink/50 mb-4">{product.brand}</p>}

          {product.review_count > 0 && (
            <div className="flex items-center gap-1.5 mb-4 text-sm">
              <Star size={15} className="fill-gold-500 text-gold-500" />
              <span className="font-medium">{product.avg_rating}</span>
              <span className="text-ink/50">({product.review_count} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold">{formatPKR(product.final_price)}</span>
            {product.discount_percent > 0 && (
              <>
                <span className="text-ink/40 line-through">{formatPKR(product.price)}</span>
                <span className="text-berry-600 text-sm font-medium">-{product.discount_percent}%</span>
              </>
            )}
          </div>

          <p className="text-ink/70 leading-relaxed mb-8">{product.description}</p>

          {product.stock_quantity > 0 ? (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-ink/15 rounded-full">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:text-berry-600">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                  className="p-3 hover:text-berry-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-xs text-ink/45">{product.stock_quantity} in stock</span>
            </div>
          ) : (
            <p className="text-red-600 text-sm mb-4 font-medium">Currently sold out</p>
          )}

          <Button
            onClick={handleAdd}
            disabled={product.stock_quantity === 0 || adding}
            className="w-full sm:w-auto"
          >
            <ShoppingBag size={16} /> {adding ? "Adding..." : "Add to cart"}
          </Button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-20 max-w-2xl">
        <h2 className="text-2xl mb-6">Reviews</h2>

        {user && (
          <form onSubmit={handleReview} className="bg-white border border-ink/10 rounded-2xl p-5 mb-8">
            <p className="text-sm font-medium mb-2">Leave a review</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewRating(n)}>
                  <Star size={20} className={n <= reviewRating ? "fill-gold-500 text-gold-500" : "text-ink/20"} />
                </button>
              ))}
            </div>
            <TextArea
              placeholder="Share your experience with this product..."
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mb-3"
            />
            <Button type="submit" disabled={submittingReview}>
              {submittingReview ? "Posting..." : "Post review"}
            </Button>
          </form>
        )}

        {product.reviews?.length ? (
          <div className="space-y-5">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-ink/10 pb-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{r.user_name}</p>
                  <span className="text-xs text-ink/40">{formatDate(r.created_at)}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={n <= r.rating ? "fill-gold-500 text-gold-500" : "text-ink/20"} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-ink/70">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink/50 text-sm">No reviews yet. Be the first to share your thoughts.</p>
        )}
      </div>
    </div>
  );
}
