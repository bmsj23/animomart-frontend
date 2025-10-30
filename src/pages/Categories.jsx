import { CATEGORY_DATA } from '../constants/categories';
import CategoryCard from '../components/common/CategoryCard';

const Categories = () => {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-main mb-4 tracking-tight">
            Categories
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover curated selections across our signature categories
          </p>

          {/* subtle divider line */}
          <div className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {CATEGORY_DATA.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;