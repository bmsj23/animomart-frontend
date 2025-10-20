import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await login(credentialResponse.credential);
      showSuccess('Welcome to AnimoMart!');
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-4">
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
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700">Safe & Secure</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700">Student Only</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
