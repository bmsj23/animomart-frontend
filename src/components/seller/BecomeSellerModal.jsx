import { useState } from 'react';
import { Store, MapPin, FileText, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { updateSellerInfo } from '../../api/users';
import { logger } from '../../utils/logger';

const BecomeSellerModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    allowsShipping: true,
    campusAddress: '',
    contactNumber: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.bio.trim()) {
      newErrors.bio = 'Seller Bio is required';
    } else if (formData.bio.length < 20) {
      newErrors.bio = 'Bio must be at least 20 characters';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.campusAddress.trim()) {
      newErrors.campusAddress = 'Campus Address is Required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is Required';
    } else if (!/^(09|\+639)\d{9}$/.test(formData.contactNumber.replace(/[-\s]/g, ''))) {
      newErrors.contactNumber = 'Please Enter A Valid Philippine Phone Number';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must Agree to the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    try {
      setLoading(true);
      const response = await updateSellerInfo({
        sellerInfo: {
          bio: formData.bio,
          allowsShipping: formData.allowsShipping
        },
        campusAddress: formData.campusAddress,
        contactNumber: formData.contactNumber
      });

      onSuccess(response.data);
      onClose();
      setStep(1);
      setFormData({
        bio: '',
        allowsShipping: true,
        campusAddress: '',
        contactNumber: '',
        agreeToTerms: false
      });
    } catch (error) {
      logger.error('failed to become seller:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to register as Seller' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        {/* progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              Business Info
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              Contact & Terms
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-green-800' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-green-800' : 'bg-gray-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* step 1: business information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Store className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Become A Seller</h2>
                <p className="text-gray-600">Share Your Business Details With Buyers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell buyers about yourself, what you sell..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="allowsShipping"
                    checked={formData.allowsShipping}
                    onChange={handleChange}
                    className="mt-1 hover:cursor-pointer"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Allow Shipping
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Check this if you can ship items to buyers (in addition to campus meetups)
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-green-800 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors hover:cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}

          {/* step 2: contact information and terms */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Details</h2>
                <p className="text-gray-600">Help Buyers Reach You</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campus Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="campusAddress"
                  value={formData.campusAddress}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.campusAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="E.g. DLSL Main Gate, Library, etc."
                />
                {errors.campusAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.campusAddress}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Where buyers can meet you on campus</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="09XX XXX XXXX"
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 hover:cursor-pointer"
                  />
                  <label className="text-sm text-gray-700">
                    I Agree To The{' '}
                    <a href="/terms" className="text-green-600 hover:underline hover:cursor-pointer" target="_blank">
                      Seller Terms And Conditions
                    </a>{' '}
                    And Understand That I Am Responsible For My Listings And Transactions.
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="mt-2 text-sm text-red-500">{errors.agreeToTerms}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors hover:cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-800 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Become A Seller'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default BecomeSellerModal;