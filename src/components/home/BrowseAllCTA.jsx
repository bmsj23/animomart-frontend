import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BrowseAllCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-surface rounded-sm border border-gray-100 p-12 md:p-16 text-center overflow-hidden mt-20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <h3 className="font-serif text-3xl md:text-5xl text-main mb-4 tracking-tight">
          Want to See More?
        </h3>
        <p className="text-gray text-base md:text-lg max-w-2xl mx-auto mb-8 font-light">
          Browse our complete collection of products with advanced filters
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="group inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-full font-medium text-base md:text-lg hover:bg-primary/90 transition-all hover:gap-4 hover:cursor-pointer shadow-lg hover:shadow-xl"
        >
          Browse All Products
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default BrowseAllCTA;