import { Link, useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import ProductCard from '../components/common/ProductCard';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // use custom search hook
  const { results: products, isSearching: loading } = useSearch(query, {
    limit: 200,
    maxResults: null, // no limit on results page
    enableCache: true,
    debounceMs: 0 // no debounce on search page since query comes from URL
  });

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        <div className="mb-10 md:mb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">
            Search Results
          </h1>
          {query && (
            <p className="text-secondary text-base md:text-lg font-light">
              Showing {products.length} {products.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
            ))}
          </div>
        ) : !query ? (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">Start Searching</h3>
            <p className="text-secondary text-base md:text-lg font-light">
              Use the search bar above to find products
            </p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">No Results Found</h3>
            <p className="text-gray text-base md:text-lg mb-6 font-light">
              We couldn&apos;t find any products matching &quot;{query}&quot;
            </p>
            <p className="text-gray text-sm">
              Try using different keywords or browse our {" "}
              <Link to="/categories" className="font-medium text-primary hover:underline">categories</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;