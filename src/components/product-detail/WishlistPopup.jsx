import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistPopup = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounceIn">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Added to Wishlist!</h3>
          <p className="text-gray-600 mb-6">1 item successfully added to your wishlist.</p>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate('/wishlist')}
                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 hover:cursor-pointer font-medium transition-colors flex items-center justify-center gap-2"
              >
                View Wishlist
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-300 hover:cursor-pointer font-medium transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPopup;
