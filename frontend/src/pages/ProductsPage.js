import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/product/ProductSkeleton';

const CATEGORIES = ['cotton', 'silk', 'linen', 'microfiber', 'printed', 'plain', 'embroidered', 'luxury'];
const SIZES = ['single', 'double', 'queen', 'king', 'super-king'];
const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    size: '',
    sort: '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await getProducts(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const newCategory = searchParams.get('category') || '';
    const newSearch = searchParams.get('search') || '';
    const newFeatured = searchParams.get('featured') || '';
    setFilters(f => ({ ...f, category: newCategory, search: newSearch, featured: newFeatured, page: 1 }));
  }, [searchParams]);

  const updateFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', size: '', sort: '', search: '', featured: '', page: 1 });
    setSearchParams({});
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-sans font-medium text-deep-brown text-sm uppercase tracking-wider mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`block w-full text-left text-sm font-sans px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-deep-brown text-cream' : 'text-warm-gray hover:bg-sand'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`block w-full text-left text-sm font-sans px-3 py-2 rounded-lg transition-colors capitalize ${filters.category === cat ? 'bg-deep-brown text-cream' : 'text-warm-gray hover:bg-sand'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-sans font-medium text-deep-brown text-sm uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-taupe text-deep-brown"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
            className="w-full border border-sand rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-taupe text-deep-brown"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-sans font-medium text-deep-brown text-sm uppercase tracking-wider mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => updateFilter('size', filters.size === s ? '' : s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-sans capitalize transition-all ${filters.size === s ? 'bg-deep-brown text-cream border-deep-brown' : 'border-sand text-warm-gray hover:border-taupe'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button onClick={clearFilters} className="w-full text-sm text-rose-400 hover:text-rose-600 font-sans py-2 transition-colors">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="pt-[72px] min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-light-beige border-b border-sand/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl text-deep-brown mb-2">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Sheets` : 'All Bedsheets'}
          </h1>
          <p className="font-sans text-warm-gray text-sm">{total} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-soft p-5">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-sand rounded-xl px-4 py-2 text-sm font-sans text-warm-gray hover:border-taupe transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-warm-gray font-sans hidden sm:block">Sort by:</span>
                <select
                  value={filters.sort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="border border-sand rounded-xl px-4 py-2 text-sm font-sans text-deep-brown outline-none focus:border-taupe bg-white"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <span className="text-5xl block mb-4">🛏️</span>
                <h3 className="font-display text-2xl text-deep-brown mb-2">No products found</h3>
                <p className="font-sans text-warm-gray mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}
                        className={`w-9 h-9 rounded-full text-sm font-sans transition-all ${filters.page === p ? 'bg-deep-brown text-cream' : 'border border-sand text-warm-gray hover:border-taupe'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="w-72 bg-white h-full overflow-y-auto p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl text-deep-brown">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-taupe hover:text-deep-brown">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterPanel />
            <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-6">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
