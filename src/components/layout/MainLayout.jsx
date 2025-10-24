import Navbar from './Navbar';
import Footer from './Footer';
import Toast from '../common/Toast';

const MainLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <Toast />
    </div>
  );
};

export default MainLayout;
