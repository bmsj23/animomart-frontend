import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../api/products';
import { logger } from '../utils/logger';
import HeroSection from '../components/home/HeroSection';
import ProductsSection from '../components/home/ProductsSection';
import BrowseAllCTA from '../components/home/BrowseAllCTA';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivalsElectronics, setNewArrivalsElectronics] = useState([]);
  const [newArrivalsClothing, setNewArrivalsClothing] = useState([]);
  const [newArrivalsBooks, setNewArrivalsBooks] = useState([]);
  const [loading, setLoading] = useState({
    featured: true,
    electronics: true,
    clothing: true,
    books: true
  });

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, featured: true }));
      const response = await getProducts({
        limit: 8,
        sort: 'newest'
      });
      setFeaturedProducts(response.data.products || []);
    } catch (err) {
      logger.error('Failed to fetch featured products:', err);
    } finally {
      setLoading(prev => ({ ...prev, featured: false }));
    }
  }, []);

  const fetchNewArrivalsByCategory = useCallback(async (category, setter, loadingKey) => {
    try {
      setLoading(prev => ({ ...prev, [loadingKey]: true }));
      const response = await getProducts({
        category,
        limit: 8,
        sort: 'newest'
      });
      setter(response.data.products || []);
    } catch (err) {
      logger.error(`Failed to fetch ${category} new arrivals:`, err);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivalsByCategory('Electronics', setNewArrivalsElectronics, 'electronics');
    fetchNewArrivalsByCategory('Clothing', setNewArrivalsClothing, 'clothing');
    fetchNewArrivalsByCategory('Books', setNewArrivalsBooks, 'books');
  }, [fetchFeaturedProducts, fetchNewArrivalsByCategory]);

  return (
    <div className="min-h-screen">
      {/* hero section */}
      <HeroSection />

      {/* featured products section */}
      <div className="relative bg-green-700 overflow-hidden">
        {/* noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
          <ProductsSection
            title="Featured Products"
            viewAllLink="/browse"
            products={featuredProducts}
            loading={loading.featured}
            onGreenBg={true}
          />
        </div>

        {/* wave transition*/}
        <div className="absolute bottom-0 left-0 right-0 h-24">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64 C240,100 480,100 720,80 C960,60 1200,40 1440,64 L1440,120 L0,120 Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </div>

      {/* new arrivals sections */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-12">
          <ProductsSection
            title="New Arrivals in Electronics"
            viewAllLink="/browse?category=Electronics&sort=newest"
            products={newArrivalsElectronics}
            loading={loading.electronics}
          />

          <ProductsSection
            title="New Arrivals in Clothing"
            viewAllLink="/browse?category=Clothing&sort=newest"
            products={newArrivalsClothing}
            loading={loading.clothing}
          />

          <ProductsSection
            title="New Arrivals in Books"
            viewAllLink="/browse?category=Books&sort=newest"
            products={newArrivalsBooks}
            loading={loading.books}
          />

          <BrowseAllCTA />
        </div>
      </div>
    </div>
  );
};

export default Home;