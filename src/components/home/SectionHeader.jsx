import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ title, viewAllLink, loading, onGreenBg = false }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className={`font-serif text-3xl md:text-4xl mb-2 tracking-tight ${onGreenBg ? 'text-white' : 'text-main'}`}>
          {title}
        </h2>
      </div>

      {viewAllLink && !loading && (
        <button
          onClick={() => navigate(viewAllLink)}
          className={`group flex items-center align-text-top gap-2 transition-all font-medium text-sm md:text-base hover:cursor-pointer hover:gap-3 ${onGreenBg ? 'text-white hover:text-white/80' : 'text-primary hover:text-primary/80'}`}
        >
          <span className="hidden sm:inline">View All</span>
          <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;