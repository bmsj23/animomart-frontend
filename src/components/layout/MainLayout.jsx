import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../common/Toast';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default MainLayout;
