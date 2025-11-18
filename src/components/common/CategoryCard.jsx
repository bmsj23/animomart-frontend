import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/categories/${encodeURIComponent(category.name)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer"
    >
      {/* category image */}
      <div className="relative bg-white rounded-2xl overflow-hidden mb-6 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out"
           style={{ aspectRatio: '4/5' }}
      >
        {/* image with subtle zoom on hover */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500 ease-out" />
        </div>

        {/* floating chevron button */}
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm group-hover:bg-green-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ease-out transform group-hover:scale-110">
          <ChevronRight className="w-5 h-5 text-main group-hover:text-[rgb(var(--color-secondary))] transition-colors duration-300" />
        </div>
      </div>

      {/* category info */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl md:text-3xl font-light text-main group-hover:text-primary transition-colors duration-300">
          {category.name}
        </h3>
        <p className="text-sm text-gray leading-relaxed line-clamp-2 max-w-xs mx-auto">
          {category.description}
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;