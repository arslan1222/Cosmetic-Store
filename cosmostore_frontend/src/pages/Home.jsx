import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ShieldCheck, Store, Sparkles } from "lucide-react";
import { catalogApi } from "../api/endpoints";
import heroImage from "../assets/hero.png";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { PageSpinner } from "../components/ui";

const CATEGORY_BLURBS = {
  Foundation: "Base coverage for every skin tone",
  Lipstick: "Mattes, creams, and everyday nudes",
  Concealer: "Color-correct and cover in one step",
  Blush: "A natural flush that lasts",
  Mascara: "Volume and length without clumping",
  Skincare: "Serums, cleansers, and daily SPF",
};

const PER_PAGE = 8;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsRef = useRef(null);

  useEffect(() => {
    catalogApi
      .categories()
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    catalogApi
      .products({ per_page: PER_PAGE, sort: "newest", page })
      .then((res) => {
        const data = res.data.data;
        setFeatured(data.items);
        setTotalPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const goToPage = (newPage) => {
    setPage(newPage);
    // Keep the reader at the product list instead of jumping to the top of the page
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-berry-500 font-medium text-sm mb-4">A marketplace of Pakistani beauty boutiques</p>
          <h1 className="text-4xl sm:text-5xl leading-[1.08] mb-6">
            Beauty from independent stores, <span className="italic text-berry-500">checked before it ships.</span>
          </h1>
          <p className="text-ink/65 text-lg max-w-md mb-8 leading-relaxed">
            Shop foundation, skincare, and color cosmetics from dozens of vetted local vendors - every
            order is automatically screened for fraud before it's confirmed, so genuine buyers never wait.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-ink text-cream rounded-full px-6 py-3 font-medium hover:bg-ink/85 transition-colors"
            >
              Shop the catalog <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 border border-ink/20 rounded-full px-6 py-3 font-medium hover:border-berry-400 hover:text-berry-600 transition-colors"
            >
              Browse boutiques
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-berry-100 via-blush to-gold-400/20 flex items-center justify-center">
            <img
            src={heroImage}
            alt="Beauty products from independent Pakistani boutiques"
            className="w-full h-auto aspect-square rounded-[2.5rem] object-cover shadow-lg"
          />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-soft px-5 py-4 max-w-[220px]">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <ShieldCheck size={18} />
              <span className="font-semibold text-sm">Order verified</span>
            </div>
            <p className="text-xs text-ink/60">Screened in real time before confirmation.</p>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-ink/10 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-ink/70">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-berry-500" /> Fraud-screened checkout</div>
          <div className="flex items-center gap-2"><Store size={18} className="text-berry-500" /> Independent local vendors</div>
          <div>Easypaisa &amp; JazzCash</div>
          <div>Cash on delivery available</div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl mb-8">Shop by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop?category_id=${c.id}`}
              className="group rounded-2xl bg-white border border-ink/10 p-5 hover:border-berry-300 hover:shadow-soft transition-all"
            >
              <p className="font-medium text-ink group-hover:text-berry-600">{c.name}</p>
              <p className="text-xs text-ink/50 mt-1">{CATEGORY_BLURBS[c.name] || c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl">Newly listed</h2>
          <Link to="/shop" className="text-sm text-berry-600 hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        {loading ? (
          <PageSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={page} pages={totalPages} onPageChange={goToPage} />
          </>
        )}
      </section>
    </div>
  );
}
