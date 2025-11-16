import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-900 border-t border-green-800 mt-auto text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between">
          {/* logo left with tagline (stacked on small, side-by-side on md+) */}
          <div className="mb-4 md:mb-0 flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-4">
            <img src="/assets/footer_animomart.png" alt="AnimoMart" className="h-14 mx-auto md:mx-0 rounded-lg" />
            <p className="text-sm text-gray-200 max-w-md">
              De La Salle Lipa's exclusive campus marketplace for DLSL community to buy and sell products safely and conveniently.
            </p>
          </div>

          {/* links right (centered on small screens) */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center">
              <li>
                <Link to="/" className="text-sm text-white hover:text-green-200 font-medium">
                  HOME
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-white hover:text-green-200 font-medium">
                  CATEGORIES
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-sm text-white hover:text-green-200 font-medium">
                  SELL AN ITEM
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-green-800 mt-6 pt-6 text-center">
          <p className="text-sm text-green-200">© {currentYear} AnimoMart - GEB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;