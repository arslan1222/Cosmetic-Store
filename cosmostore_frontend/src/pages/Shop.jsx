import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { catalogApi } from "../api/endpoints";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";
import { PageSpinner, EmptyState, Select } from "../components/ui";

const PER_PAGE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category_id") || "";
  const categoryName = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

  useEffect(() => {
    catalogApi.categories().then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { per_page: PER_PAGE, sort, page };
    if (q) params.q = q;
    if (categoryId) params.category_id = categoryId;

    let effectiveCategoryId = categoryId;
    if (!categoryId && categoryName && categories.length) {
      const match = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) effectiveCategoryId = match.id;
    }
    if (effectiveCategoryId) params.category_id = effectiveCategoryId;

    catalogApi
      .products(params)
      .then((res) => {
        const data = res.data.data;
        // Page no longer exists (e.g. products were removed): go to the last one
        if (data.pages > 0 && page > data.pages) {
          const next = new URLSearchParams(searchParams);
          next.set("page", data.pages);
          setSearchParams(next, { replace: true });
          return;
        }
        setProducts(data.items);
        setTotal(data.total);
        setTotalPages(data.pages || 1);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, categoryName, sort, page, categories]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "category_id") next.delete("category");
    next.delete("page"); // filters/sort changed -> back to the first page
    setSearchParams(next);
  };

  const goToPage = (newPage) => {
    const next = new URLSearchParams(searchParams);
    if (newPage > 1) next.set("page", newPage);
    else next.delete("page");
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId))?.name || categoryName;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl">{q ? `Results for "${q}"` : activeCategory || "All products"}</h1>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden flex items-center gap-1.5 text-sm border border-ink/15 rounded-full px-4 py-2"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>
      <p className="text-ink/50 text-sm mb-8">
        {total === 0
          ? "0 products"
          : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, total)} of ${total} products`}
      </p>

      <div className="grid md:grid-cols-[220px_1fr] gap-10">
        {/* Filters sidebar */}
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block`}>
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="font-medium text-sm mb-3">Category</p>
              <div className="space-y-1.5 text-sm">
                <button
                  onClick={() => updateParam("category_id", "")}
                  className={`block ${!categoryId && !categoryName ? "text-berry-600 font-medium" : "text-ink/65"}`}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam("category_id", c.id)}
                    className={`block ${String(c.id) === String(categoryId) || c.name === activeCategory ? "text-berry-600 font-medium" : "text-ink/65"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <Select label="Sort by" value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </Select>

            {(q || categoryId || categoryName) && (
              <button
                onClick={() => setSearchParams({})}
                className="flex items-center gap-1 text-sm text-ink/50 hover:text-berry-600"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Grid */}
        <div>
          {loading ? (
            <PageSpinner />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try a different search term or category." />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination page={page} pages={totalPages} onPageChange={goToPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
