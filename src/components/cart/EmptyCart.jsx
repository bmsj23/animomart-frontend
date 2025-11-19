import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <div className="py-30 flex flex-col items-center justify-center gap-4 text-gray-600 animate-fade-in">
      <img
        src="/assets/EmptyCart.png"
        alt="Empty cart"
        className="w-56 h-56 md:w-80 md:h-80 object-contain animate-slide-in"
      />
      <div className="text-2xl md:text-2xl font-medium text-gray-700 font-serif">Your cart is empty.</div>
        <p className="text-sm md:text-lg text-gray-500 text-center max-w-md">Let's find some great items to fill it up!</p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium hover:cursor-pointer delay-200"
      >
        Start Shopping
      </button>
    </div>
  );
};

export default EmptyCart;