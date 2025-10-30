import { useState, useEffect, useRef } from 'react';
import { getProducts } from '../api/products';
import { getParentCategory } from '../constants/categories';

export const useSearch = (query, options = {}) => {
  const {
    limit = 100,
    maxResults = 5,
    enableCache = true,
    cacheExpiry = 5 * 60 * 1000, // 5 minutes
    debounceMs = 300,
    minQueryLength = 2
  } = options;

  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);
  const productsCache = useRef(null);
  const cacheTimestamp = useRef(null);

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);

        let products = [];
        const now = Date.now();

        // check cache if enabled
        if (enableCache && productsCache.current && cacheTimestamp.current && (now - cacheTimestamp.current) < cacheExpiry) {
          products = productsCache.current;
        } else {
          const response = await getProducts({ limit });
          if (response.success) {
            products = response.data.products || [];
            if (enableCache) {
              productsCache.current = products;
              cacheTimestamp.current = now;
            }
          }
        }

        // search logic: match against name and category
        const searchTerm = query.toLowerCase();
        const filtered = products.filter(product => {
          const productName = product.name?.toLowerCase() || '';
          const productCategory = product.category?.toLowerCase() || '';

          // get parent category if product category is a subcategory
          const parentCategory = getParentCategory(product.category);
          const parentCategoryLower = parentCategory?.toLowerCase() || '';

          // match against name and category
          return (
            productName.includes(searchTerm) ||
            productCategory.includes(searchTerm) ||
            parentCategoryLower.includes(searchTerm)
          );
        });

        // limit results according to maxResults
        const limitedResults = maxResults ? filtered.slice(0, maxResults) : filtered;
        setResults(limitedResults);
      } catch (error) {
        console.error('search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, limit, maxResults, enableCache, cacheExpiry, debounceMs, minQueryLength]);

  // manual cache clear function
  const clearCache = () => {
    productsCache.current = null;
    cacheTimestamp.current = null;
  };

  return { results, isSearching, clearCache };
};