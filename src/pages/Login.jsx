import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { logger } from '../utils/logger';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      logger.error('Login failed:', err);
      if (err.message.includes('@dlsl.edu.ph')) {
        showError('Only @dlsl.edu.ph email addresses are allowed');
      } else {
        showError('Login failed. Please try again.');
      }
    }
  };

  const handleGoogleError = () => {
    showError('Google Sign-In was unsuccessful. Please try again.');
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="fixed inset-0 flex flex-col lg:flex-row overflow-hidden">
        {/* left side - login form */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-12 overflow-y-auto">
          <div className="w-full max-w-md animate-fadeIn animate-scaleIn">
            {/* logo */}
            <div className="mb-10">
              <div className="flex justify-center mb-8">
                <img
                  src="/assets/animomart_1.jpg"
                  alt="AnimoMart Logo"
                  className="w-64 h-36 rounded-2xl object-cover transform transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>

              {/* welcome text */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2 transition-opacity duration-500 ease-out">Welcome!</p>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 transition-transform duration-500 ease-out transform-gpu">Sign in</h1>
                <p className="text-sm text-gray-600 transition-opacity duration-500 ease-out">to continue to AnimoMart</p>
              </div>
            </div>

            {/* form card */}
            <div className="space-y-6">
              {/* google sign-in */}
              <div className="space-y-4">
                <div className="transition-shadow duration-300 hover:shadow-lg rounded-md">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  context="signin"
                  ux_mode="popup"
                  width="100%"
                />
                </div>
              </div>

              <div className="bg-surface rounded-lg p-4 border border-gray-200 transition-shadow duration-300 hover:shadow-sm">
                <p className="text-sm text-gray-700 text-center">
                  Note: Only <span className="font-semibold text-accent">@dlsl.edu.ph</span> email addresses are allowed
                </p>
              </div>
            </div>

            {/* footer text */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              De La Salle Lipa Campus Marketplace
            </p>
          </div>
        </div>

        {/* right side - illustration */}
        <div className="hidden lg:flex flex-1 bg-green-900 items-center justify-center p-12 relative overflow-hidden">

          {/* illustration content */}
          <div className="relative z-10 text-center max-w-lg animate-slide-in">
            <div className="mb-12 flex justify-center">

            </div>

            <h2 className="text-4xl font-bold text-gray-50 mb-4 font-sans leading-tight">
              Shop Smart, <span className="text-accent">Shop Local</span>
            </h2>
            <p className="text-gray-200 text-lg leading-relaxed">
              Your trusted campus marketplace for buying and selling with fellow Lasallians
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
