import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { createProduct, updateProduct, getProduct } from '../../api/products';
import { uploadImage } from '../../api/upload';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CATEGORY_DATA } from '../../constants/categories';
import { logger } from '../../utils/logger';

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    mainCategory: '',
    category: '',
    condition: 'New',
    images: [],
    shippingAvailable: false,
    shippingFee: ''
  });

  const [errors, setErrors] = useState({});
  const [charCounts, setCharCounts] = useState({ name: 0, description: 0 });

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProduct(id);
      const product = response.data?.product || response.product || response.data || response;

      // find main category from subcategory
      const mainCat = CATEGORY_DATA.find(cat => cat.subcategories.includes(product.category));

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        mainCategory: mainCat?.name || '',
        category: product.category,
        condition: product.condition,
        images: product.images || [],
        shippingAvailable: product.shippingAvailable || false,
        shippingFee: product.shippingFee?.toString() || ''
      });

      setCharCounts({
        name: product.name.length,
        description: product.description.length
      });
    } catch (err) {
      logger.error('failed to fetch product:', err);
      error('Failed To Load Product');
      navigate('/seller/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // update character counts
    if (name === 'name' || name === 'description') {
      setCharCounts(prev => ({ ...prev, [name]: value.length }));
    }

    // clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // reset subcategory when main category changes
    if (name === 'mainCategory') {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 5) {
      error('Maximum 5 Images Allowed');
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(file => {
        const formDataObj = new FormData();
        formDataObj.append('image', file);
        return uploadImage(formDataObj);
      });

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(res => res.data?.url || res.url);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));

      success(`${files.length} Image(s) Uploaded`);
    } catch (err) {
      logger.error('failed to upload images:', err);
      error('Failed To Upload Images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'product name is required';
    } else if (formData.name.length < 3 || formData.name.length > 200) {
      newErrors.name = 'name must be 3-200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'description is required';
    } else if (formData.description.length < 10 || formData.description.length > 2000) {
      newErrors.description = 'description must be 10-2000 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'valid price is required';
    }

    const stock = parseInt(formData.stock);
    if (formData.stock === '' || isNaN(stock) || stock < 0) {
      newErrors.stock = 'valid stock quantity is required';
    }

    if (!formData.category) {
      newErrors.category = 'category is required';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'at least 1 image is required';
    }

    if (formData.shippingAvailable) {
      const shippingFee = parseFloat(formData.shippingFee);
      if (!formData.shippingFee || isNaN(shippingFee) || shippingFee < 0) {
        newErrors.shippingFee = 'valid shipping fee is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      error('Please fix the errors', error);
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        condition: formData.condition,
        images: formData.images,
        shippingAvailable: formData.shippingAvailable
      };

      if (formData.shippingAvailable) {
        productData.shippingFee = parseFloat(formData.shippingFee);
      }

      if (isEditMode) {
        await updateProduct(id, productData);
        success('Product Updated Successfully');
      } else {
        await createProduct(productData);
        success('Product Created Successfully');
      }

      navigate('/seller/products');
    } catch (err) {
      logger.error('failed to save product:', err);
      error(err.response?.data?.message || 'Failed to Save Product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const selectedCategory = CATEGORY_DATA.find(cat => cat.name === formData.mainCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isEditMode ? 'Update your product details' : 'Fill in the details to list your product'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* product name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={200}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g. calculus textbook 9th edition"
          />
          <div className="flex justify-between mt-1">
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            <p className="text-xs text-gray-500 ml-auto">{charCounts.name}/200</p>
          </div>
        </div>

        {/* description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={2000}
            rows={6}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="describe your product in detail..."
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-xs text-gray-500 ml-auto">{charCounts.description}/2000</p>
          </div>
        </div>

        {/* price and stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₱) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              step="1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
          </div>
        </div>

        {/* category selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Category <span className="text-red-500">*</span>
            </label>
            <select
              name="mainCategory"
              value={formData.mainCategory}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 hover:cursor-pointer"
            >
              <option value="">select main category</option>
              {CATEGORY_DATA.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={!formData.mainCategory}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed hover:cursor-pointer ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">select subcategory</option>
              {selectedCategory?.subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>
        </div>

        {/* condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONDITION_OPTIONS.map(condition => (
              <button
                key={condition}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, condition }))}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:cursor-pointer ${
                  formData.condition === condition
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {condition}
              </button>
            ))}
          </div>
        </div>

        {/* images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">Upload 1-5 images. First image will be the cover.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 px-2 py-1 bg-green-600 text-white text-xs rounded">
                    cover
                  </span>
                )}
              </div>
            ))}

            {formData.images.length < 5 && (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors hover:cursor-pointer">
                {uploadingImages ? (
                  <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">Upload Image</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
        </div>

        {/* shipping */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="shippingAvailable"
              id="shippingAvailable"
              checked={formData.shippingAvailable}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 hover:cursor-pointer"
            />
            <label htmlFor="shippingAvailable" className="text-sm font-medium text-gray-700 hover:cursor-pointer">
              Shipping Available
            </label>
          </div>

          {formData.shippingAvailable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Fee (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="shippingFee"
                value={formData.shippingFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.shippingFee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.shippingFee && <p className="text-sm text-red-500 mt-1">{errors.shippingFee}</p>}
            </div>
          )}
        </div>

        {/* form actions */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploadingImages}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;