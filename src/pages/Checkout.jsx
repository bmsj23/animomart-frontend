import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { formatCurrency } from '../utils/formatCurrency';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    fulfillment: 'shipping', // 'shipping' or 'meetup'
    meetupLocation: ''
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      // do not split the name; use the profile name as a single field
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setForm((f) => ({
        ...f,
        name: name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const clearForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal: '',
      fulfillment: 'shipping',
      meetupLocation: ''
    });
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    clearForm();
    navigate('/cart');
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, it) => sum + ((it.product?.price || 0) * (it.quantity || 1)), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // placeholder
  const total = subtotal + shipping;

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* order details form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone number</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
            </div>

            {/* Order Fulfillment method*/}
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Fulfillment</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 hover:cursor-pointer">
                  <input type="radio" name="fulfillment" value="shipping" checked={form.fulfillment === 'shipping'} onChange={handleChange} />
                  <span>Ship</span>
                </label>
                <label className="inline-flex items-center gap-2 hover:cursor-pointer">
                  <input type="radio" name="fulfillment" value="meetup" checked={form.fulfillment === 'meetup'} onChange={handleChange} />
                  <span>Meet up</span>
                </label>
              </div>
            </div>

            {form.fulfillment === 'shipping' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Street, building, unit (optional)" className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Postal code</label>
                    <input name="postal" value={form.postal} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2" />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Meet up location</label>
                <select name="meetupLocation" value={form.meetupLocation} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2">
                  <option value="">Select a spot</option>
                  <option>North Lounge</option>
                  <option>South Lounge</option>
                  <option>Chez Rafael Canteen</option>
                  <option>CBEAM Grounds</option>
                  <option>College Lobby</option>
                </select>
              </div>
            )}
          </form>
        </div>

        {/* order summary */}
        <aside className="w-full h-fit sticky top-24">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart?.items?.length ? (
                cart.items.map((it) => (
                  <div key={it._id || it.product?._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.product?.images?.[0] || '/api/placeholder/80/80'} alt={it.product?.name} className="w-12 h-12 object-cover rounded" />
                      <div className="text-sm">
                        <div className="font-medium">{it.product?.name}</div>
                        <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency((it.product?.price || 0) * (it.quantity || 1))}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Your cart is empty.</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium hover:cursor-pointer">Confirm & Pay</button>
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </aside>
      </div>

      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel checkout">
        <p>Are you sure you want to cancel the checkout? Your form will be cleared.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 border rounded-md">Cancel</button>
          <button onClick={handleConfirmCancel} className="px-4 py-2 bg-red-600 text-white rounded-md">Confirm</button>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
