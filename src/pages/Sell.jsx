import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createProduct } from '../api/products';
import { updateSellerInfo } from '../api/users';
import { uploadMultipleImages } from '../api/upload';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CATEGORY_DATA, getSubcategories } from '../constants/categories';

const CONDITIONS = [
  { value: "New", label: "Brand New" },
  { value: "Like New", label: "Like New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" }
];

const Sell = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showBecomeSellerForm, setShowBecomeSellerForm] = useState(false);

  // seller info form
  const [sellerInfo, setSellerInfo] = useState({
    businessName: '',
    businessDescription: '',
    pickupLocation: ''
  });

  // product form with main category and subcategory
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mainCategory: '',
    subcategory: '',
    condition: 'Good',
    stock: '1',
    meetupLocations: ''
  });

  // subcategories based on selected main category
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  useEffect(() => {
    // check if user is a seller
    // temporarily skip seller check. all authenticated users can sell fir biw
    // this is because the backend doesn't properly set isSeller field
    setShowBecomeSellerForm(false);

    // current to do for this: fix backend to properly set isSeller flag
    // const isSeller = user?.isSeller || user?.businessName;
    // if (!isSeller) {
    //   setShowBecomeSellerForm(true);
    // } else {
    //   setShowBecomeSellerForm(false);
    // }
  }, [user]);

  // handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 5) {
      showError('Maximum 5 images allowed');
      return;
    }

    // validate file types and sizes
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        showError(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} is not an image`);
        return false;
      }
      return true;
    });

    setImageFiles([...imageFiles, ...validFiles]);

    // create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // remove image
  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // become seller
  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await updateSellerInfo({
        isSeller: true,
        ...sellerInfo
      });

      // update user in context using the updateUser function
      const updatedUser = {
        ...user,
        isSeller: true,
        businessName: sellerInfo.businessName,
        businessDescription: sellerInfo.businessDescription,
        pickupLocation: sellerInfo.pickupLocation,
        ...response.data
      };

      updateUser(updatedUser);
      setShowBecomeSellerForm(false);
    } catch (err) {
      console.error('Failed to become seller:', err);
      showError(err.response?.data?.message || 'Failed to register as seller');
    } finally {
      setLoading(false);
    }
  };

  // create product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      showError('Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // upload images first
      console.log('Uploading images...', imageFiles);
      const uploadResponse = await uploadMultipleImages(imageFiles);
      console.log('Upload response:', uploadResponse);

      // extract urls from response {backend returns array of urls/objects}
      let imageUrls = [];
      if (Array.isArray(uploadResponse.data)) {
        // if data is array of objects with url property
        imageUrls = uploadResponse.data.map(img => img.url || img);
      } else if (uploadResponse.data?.urls) {
        imageUrls = uploadResponse.data.urls;
      } else {
        imageUrls = uploadResponse.data || [];
      }
      console.log('Image URLs:', imageUrls);

      // prepare product data
      const meetupLocationsArray = formData.meetupLocations
        .split(',')
        .map(loc => loc.trim())
        .filter(loc => loc.length > 0);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.subcategory, // use subcategory as the category
        condition: formData.condition,
        stock: parseInt(formData.stock),
        images: imageUrls,
        meetupLocations: meetupLocationsArray
      };

      console.log('Creating product with data:', productData);

      // create product
      const response = await createProduct(productData);
      console.log('Product created:', response);
      navigate(`/products/${response.data._id}`);
    } catch (err) {
      console.error('Failed to create product:', err);
      console.error('Error details:', err.response?.data);
      showError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  // become seller form
  if (showBecomeSellerForm) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
            <p className="text-gray-600">Fill in your seller details to start selling on AnimoMart</p>
          </div>

          <form onSubmit={handleBecomeSeller} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={sellerInfo.businessName}
                onChange={(e) => setSellerInfo({ ...sellerInfo, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., TechHub DLSL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                required
                value={sellerInfo.businessDescription}
                onChange={(e) => setSellerInfo({ ...sellerInfo, businessDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe what you sell..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <input
                type="text"
                required
                value={sellerInfo.pickupLocation}
                onChange={(e) => setSellerInfo({ ...sellerInfo, pickupLocation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Main Building Lobby, DLSL"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <LoadingSpinner /> : 'Become a Seller'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // product creation form
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell an Item</h1>
      <p className="text-gray-600 mb-8">List your item for sale on AnimoMart</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images * (Max 5)
          </label>

          {/* image previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* upload button */}
          {imageFiles.length < 5 && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors block">
              <Plus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Click to upload images</p>
              <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., iPhone 13 Pro Max 256GB"
          />
        </div>

        {/* description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe your item in detail..."
          />
        </div>

        {/* category and condition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Category *
            </label>
            <select
              value={formData.mainCategory}
              onChange={(e) => {
                const mainCat = e.target.value;
                setFormData({
                  ...formData,
                  mainCategory: mainCat,
                  subcategory: '' // reset subcategory when main category changes
                });
                setAvailableSubcategories(getSubcategories(mainCat));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {CATEGORY_DATA.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory *
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!formData.mainCategory || availableSubcategories.length === 0}
              required
            >
              <option value="">
                {!formData.mainCategory
                  ? 'Select main category first'
                  : availableSubcategories.length === 0
                  ? 'No subcategories available'
                  : 'Select a subcategory'}
              </option>
              {availableSubcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* condition selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {CONDITIONS.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* price and stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₱) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
        </div>

        {/* meetup locations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meetup Locations (Optional)
          </label>
          <input
            type="text"
            value={formData.meetupLocations}
            onChange={(e) => setFormData({ ...formData, meetupLocations: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Separate multiple locations with commas (e.g., Main Building, Library, Cafeteria)"
          />
          <p className="text-sm text-gray-500 mt-1">Where buyers can meet you to pick up the item</p>
        </div>

        {/* submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <LoadingSpinner /> : 'List Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sell;
