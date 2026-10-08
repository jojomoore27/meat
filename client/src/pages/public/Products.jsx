import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Filter, ArrowUpDown, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { getWhatsAppOrderUrl } from '../../utils/whatsapp';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortOption, setSortOption] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const urlCat = searchParams.get('category') || 'all';
    const urlSearch = searchParams.get('search') || '';
    setSelectedCategory(urlCat);
    setSearchTerm(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = { sort: sortOption };
        if (selectedCategory && selectedCategory !== 'all') {
          queryParams.category = selectedCategory;
        }
        if (searchTerm && searchTerm.trim() !== '') {
          queryParams.search = searchTerm.trim();
        }

        const [catsRes, prodsRes] = await Promise.allSettled([
          api.getCategories(),
          api.getProducts(queryParams)
        ]);

        if (catsRes.status === 'fulfilled' && catsRes.value?.categories) {
          setCategories(catsRes.value.categories);
        }
        if (prodsRes.status === 'fulfilled' && prodsRes.value?.products) {
          setProducts(prodsRes.value.products);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCategory, sortOption]);

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
    const newParams = {};
    if (categorySlug !== 'all') newParams.category = categorySlug;
    if (searchTerm && searchTerm.trim() !== '') newParams.search = searchTerm.trim();
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSearchParams({});
  };

  // Handle live search
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const queryParams = { sort: sortOption };
    if (selectedCategory && selectedCategory !== 'all') {
      queryParams.category = selectedCategory;
    }
    if (searchTerm && searchTerm.trim() !== '') {
      queryParams.search = searchTerm.trim();
    }
    api.getProducts(queryParams).then(res => {
      if (res.products) setProducts(res.products);
    }).catch(err => {
      console.error('Search error:', err);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleOpenOrder = (product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
          Our Artisanal Catalog
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-farm-forest dark:text-white mt-2 mb-4">
          Grass-Fed Beef Cuts & Shares
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-light">
          Browse our pasture-raised cuts below. To order, click <strong>"Order This Item"</strong> on any cut to immediately connect with our farm on WhatsApp (+1 305 213 2655). No online payment required.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#151c17] p-4 sm:p-6 rounded-2xl border border-farm-sand/40 dark:border-white/5 shadow-premium mb-10 space-y-4">
        
        {/* Top Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cuts (e.g. Ribeye, Brisket, Ground Beef, Bones)..."
              className="w-full pl-11 pr-24 py-3 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar border-t border-gray-100 dark:border-white/5">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-farm-forest text-white shadow-sm'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-farm-cream'
            }`}
          >
            All Cuts
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-farm-forest text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-farm-cream'
              }`}
            >
              {cat.name} {cat.product_count !== undefined ? `(${cat.product_count})` : ''}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-farm-grass border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading authentic pasture cuts...</p>
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-[#151c17] rounded-2xl border border-farm-sand/40 dark:border-white/5 p-8 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-farm-sand mx-auto mb-4" />
          <h3 className="font-display font-semibold text-xl text-farm-forest dark:text-white mb-2">
            No Cuts Match Your Filter
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            We couldn't find any beef cuts matching your search query or selected category.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-[#151c17] rounded-2xl border border-farm-sand/40 dark:border-white/5 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col group"
            >
              {/* Image & Price */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-black/20">
                <img
                  src={product.main_image || '/images/artisanal_ribeye_steak.jpg'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/artisanal_ribeye_steak.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-farm-forest/90 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg uppercase tracking-wider">
                    {product.category_name || 'Artisanal Beef'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-farm-forest dark:text-farm-sand font-display">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal"> / unit</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-farm-grass mb-1">{product.sku}</div>
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white line-clamp-1 group-hover:text-farm-grass transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {product.short_description}
                  </p>
                </div>

                {/* ORDER THIS ITEM BUTTON - Direct to WhatsApp */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                  <a
                    href={getWhatsAppOrderUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-farm-sand" />
                    <span>Order This Item</span>
                  </a>

                  <Link
                    to={`/products/${product.slug}`}
                    className="block text-center text-xs text-gray-500 hover:text-farm-forest dark:hover:text-white transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Grid End */}

    </div>
  );
}
