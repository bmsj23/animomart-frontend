import { useState, useEffect, useRef } from 'react';
import { getProducts, hybridSearch } from '../api/products';
import { getParentCategory } from '../constants/categories';

export const useSearch = (query, options = {}) => {
  const {
    limit = 100,
    maxResults = 5,
    enableCache = true,
    cacheExpiry = 5 * 60 * 1000, // 5 minutes
    debounceMs = 300,
    minQueryLength = 2,
    useSemanticSearch = true // vector embeddings + keyword search
  } = options;

  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);
  const productsCache = useRef(null);
  const cacheTimestamp = useRef(null);

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsSearching(true);

        // hybrid search first as resort (vector embeddings + keyword)
        if (useSemanticSearch) {
          try {
            const response = await hybridSearch(query, {
              limit: maxResults || limit,
              minSimilarity: 0.6 // require 60% similarity for semantic results
            });
            console.log('hybrid search response:', response);
            if (response.success) {

              const exactMatches = response.exactMatches || response.data || [];
              const semanticSuggestions = response.suggestions || [];

              console.log(`hybrid search returned ${exactMatches.length} exact matches and ${semanticSuggestions.length} suggestions for "${query}"`);

              setResults(exactMatches);
              setSuggestions(semanticSuggestions);
              setIsSearching(false);
              return;
            }
          } catch (hybridError) {
            console.warn('hybrid search failed, falling back to keyword search:', hybridError);
          }
        }

        // fallback: traditional keyword search
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

        // search logic: match against name, description, and category
        const searchTerm = query.toLowerCase();
        const filtered = products.filter(product => {
          const productName = product.name?.toLowerCase() || '';
          const productDescription = product.description?.toLowerCase() || '';
          const productCategory = product.category?.toLowerCase() || '';

          // get parent category if product category is a subcategory
          const parentCategory = getParentCategory(product.category);
          const parentCategoryLower = parentCategory?.toLowerCase() || '';

          // match against name, description, and category
          return (
            productName.includes(searchTerm) ||
            productDescription.includes(searchTerm) ||
            productCategory.includes(searchTerm) ||
            parentCategoryLower.includes(searchTerm)
          );
        });

        // limit results according to maxResults
        const limitedResults = maxResults ? filtered.slice(0, maxResults) : filtered;
        setResults(limitedResults);
        setSuggestions([]); // clear suggestions when using fallback
      } catch (error) {
        console.error('search error:', error);
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, limit, maxResults, enableCache, cacheExpiry, debounceMs, minQueryLength, useSemanticSearch]);

  // manual cache clear function
  const clearCache = () => {
    productsCache.current = null;
    cacheTimestamp.current = null;
  };

  return { results, suggestions, isSearching, clearCache };
};