import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Shield, Users, Zap } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white px-4">
        <div className="max-w-md w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-3xl">A</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AnimoMart</h1>
            <p className="text-gray-600">De La Salle Lipa Campus Marketplace</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-6">Sign in with your DLSL account to continue</p>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Only <span className="font-semibold text-green-600">@dlsl.edu.ph</span> email addresses are allowed
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 mb-2">
                <Shield className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-xs font-medium text-gray-700">Safe & Secure</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 mb-2">
                <Users className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-xs font-medium text-gray-700">Student Only</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 mb-2">
                <Zap className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-xs font-medium text-gray-700">Fast & Easy</p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
