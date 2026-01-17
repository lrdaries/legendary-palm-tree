import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import ProductsService from '../services/products';
import { CATEGORIES } from '../constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchFilters {
  category: string;
  priceRange: {
    min: number;
    max: number;
  };
  inStock: boolean;
  sortBy: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'All',
    priceRange: { min: 0, max: 100000 },
    inStock: false,
    sortBy: 'relevance'
  });

  // Load search history from localStorage
  React.useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Get search suggestions
  const getSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await ProductsService.getSearchSuggestions(searchQuery);
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  // Debounced search suggestions
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        getSuggestions(query);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Add to search history
  const addToSearchHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const { convertPrice } = useCurrency();

  const itemsPerPage = 12;

  const handleSearch = async (page: number = 1) => {
    if (query.trim().length < 2) return;
    
    try {
      setIsSearching(true);
      addToSearchHistory(query.trim());
      setShowSuggestions(false);
      
      const searchResponse = await ProductsService.searchProducts(query.trim(), {
        category: filters.category !== 'All' ? filters.category : undefined,
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max < 100000 ? filters.priceRange.max : undefined,
        sortBy: filters.sortBy,
        page: page,
        limit: itemsPerPage
      });
      
      if (searchResponse.success) {
        setResults(searchResponse.data);
        setCurrentPage(searchResponse.pagination?.page || 1);
        setTotalPages(searchResponse.pagination?.totalPages || 1);
        setTotalResults(searchResponse.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      priceRange: { min: 0, max: 100000 },
      inStock: false,
      sortBy: 'relevance'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleSearch(page);
  };

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(currentPage);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [query, currentPage, filters]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setCurrentPage(1);
    setShowFilters(false);
    handleClearFilters();
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Advanced Search</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input and Filters */}
        <div className="p-6 border-b">
          <div className="flex gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(1);
                    }
                  }}
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  autoFocus
                />
                <button
                  onClick={() => handleSearch(1)}
                  disabled={isSearching || query.trim().length < 2}
                  className="absolute right-2 top-1/2 bg-[#722F37] text-white px-4 py-3 rounded-md hover:bg-[#5a335] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-black transition"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max < 1000 ? filters.priceRange.max : ''}
                    onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  In Stock Only
                </label>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-4">
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="px-6 pb-2">
          {results.length > 0 && (
            <p className="text-sm text-gray-600">
              Found {totalResults} results for "{query}" 
              {totalPages > 1 && ` - Page ${currentPage} of ${totalPages}`}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#722F37] mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-md mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#722F37]">
                          {convertPrice(product.price)}
                        </span>
                        <button
                          onClick={() => window.location.hash = `#/product/${product.id}`}
                          className="bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a335] transition text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && results.length === 0 && query.trim().length >= 2 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No products found for "{query}"</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t">
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-md hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
