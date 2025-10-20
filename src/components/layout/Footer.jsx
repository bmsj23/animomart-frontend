import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4">AnimoMart</h3>
            <p className="text-sm text-gray-600">
              De La Salle Lipa's exclusive campus marketplace for students to buy and sell products safely and conveniently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-green-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-gray-600 hover:text-green-600">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-sm text-gray-600 hover:text-green-600">
                  Sell an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Safety Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-green-600">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-gray-600">
            © {currentYear} AnimoMart - De La Salle Lipa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
