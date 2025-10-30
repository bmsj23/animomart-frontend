import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { updateMyProfile } from "../api/users";
import { uploadProfilePicture } from "../api/upload";
import { getMyListings } from "../api/products";
import { getMyPurchases, getMySales } from "../api/orders";
import { getMyReviews } from "../api/reviews";
import { formatCurrency } from "../utils/formatCurrency";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/common/Modal";
import { User } from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "listings", label: "My Listings" },
    { id: "purchases", label: "My Purchases" },
    { id: "sales", label: "My Sales" },
    { id: "reviews", label: "Reviews" },
  ];

  const { user, updateUser } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const location = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);

  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState(null);

  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);

  const [authoredReviews, setAuthoredReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  const [form, setForm] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || user?.picture || "",
  });

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // show preview
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    // set form preview immediately so user sees change
    setForm((s) => ({ ...s, profilePicture: url }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSaving(true);
    try {
      // call API to update profile
      let profilePicUrl = form.profilePicture;

      // if user selected a new file, upload it first
      if (selectedFile) {
        const uploaded = await uploadProfilePicture(selectedFile);
        // try common response shapes
        profilePicUrl =
          uploaded?.url ||
          uploaded?.secure_url ||
          uploaded?.path ||
          uploaded?.imageUrl ||
          uploaded?.data?.url ||
          uploaded?.src ||
          uploaded?.image ||
          profilePicUrl;
      }

      const updated = await updateMyProfile({
        username: form.username,
        phone: form.phone,
        profilePicture: profilePicUrl,
      });

      // update auth context and localStorage
      // AuthContext provides updateUser
      // We call updateUser if available on context
      // To avoid importing AuthContext directly, call updateUser via useAuth
      // (useAuth returns updateUser)
      if (updateUser) updateUser(updated.user || updated);

      // cleanup local preview/file
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (e) {
          // ignore
        }
      }
      setSelectedFile(null);
      setPreviewUrl("");

      showSuccess("Profile updated");
      setIsEditing(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to update profile";
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmSave = async () => {
    // close modal then run save
    setShowConfirm(false);
    try {
      await handleSave();
      // ensure we exit edit mode and show updated profile
      setIsEditing(false);
    } catch (err) {
      // handleSave already shows errors via toasts
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      username: user?.username || "",
      phone: user?.phone || "",
      profilePicture: user?.profilePicture || user?.picture || "",
    });
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Load user's listings when switching to Listings tab
  useEffect(() => {
    const loadListings = async () => {
      setListingsLoading(true);
      setListingsError(null);
      try {
        const data = await getMyListings();

        // backend returns { success: true, data: { products: [...], total, page, pages } }
        let products = [];
        if (data?.data?.products) {
          products = data.data.products;
        } else if (data?.products) {
          products = data.products;
        } else if (Array.isArray(data?.data)) {
          products = data.data;
        } else if (Array.isArray(data)) {
          products = data;
        }

        setMyListings(products);
      } catch (err) {
        setListingsError(err?.response?.data?.message || err.message || 'Failed to load listings');
      } finally {
        setListingsLoading(false);
      }
    };

    if (activeTab === 'listings') {
      loadListings();
    }

    // load purchases when switching to purchases tab
    const loadPurchases = async () => {
      setPurchasesLoading(true);
      setPurchasesError(null);
      try {
        const data = await getMyPurchases();

        // backend returns { success: true, data: { orders: [...] } }
        let orders = [];
        if (data?.data?.orders) {
          orders = data.data.orders;
        } else if (data?.orders) {
          orders = data.orders;
        } else if (Array.isArray(data?.data)) {
          orders = data.data;
        } else if (Array.isArray(data)) {
          orders = data;
        }

        // extract purchased products from orders defensively
        const items = [];
        if (Array.isArray(orders)) {
          orders.forEach((order) => {
            const orderItems = order.items || order.products || order.orderItems || [];
            if (Array.isArray(orderItems) && orderItems.length) {
              orderItems.forEach((it) => {
                // item might wrap a product object or be a direct product
                const product = it.product || it.productId || it.productInfo || it;
                if (product) items.push(product);
              });
            }
          });
        } else {
          // defensive logging to help identify unexpected shapes from the backend
          console.error('loadPurchases: expected orders array but got:', orders, 'raw response:', data);
        }

        // de-duplicate by _id if present
        const unique = [];
        const seen = new Set();
        items.forEach((p) => {
          const id = p?._id || p?.id || JSON.stringify(p);
          if (!seen.has(id)) {
            seen.add(id);
            unique.push(p);
          }
        });

        setPurchases(unique);
      } catch (err) {
        setPurchasesError(err?.response?.data?.message || err.message || 'Failed to load purchases');
      } finally {
        setPurchasesLoading(false);
      }
    };

    if (activeTab === 'purchases') {
      loadPurchases();
    }

    // load sales when switching to sales tab
    const loadSales = async () => {
      setSalesLoading(true);
      setSalesError(null);
      try {
        const data = await getMySales();
        // expected shapes: array of orders OR { orders: [...] } OR { data: [...] }
        const orders = Array.isArray(data) ? data : data?.orders || data?.data || [];

        // flatten order items into sale entries with buyer + order metadata
        const saleEntries = [];
        if (Array.isArray(orders)) {
          orders.forEach((order) => {
            const orderItems = order.items || order.products || order.orderItems || [];
            if (Array.isArray(orderItems) && orderItems.length) {
              orderItems.forEach((it) => {
                const product = it.product || it.productId || it.productInfo || it;
                const quantity = it.quantity || it.qty || it.count || 1;
                const price = it.price || it.amount || product?.price || order.total || 0;
                saleEntries.push({
                  orderId: order._id || order.id,
                  product,
                  buyer: order.buyer || order.customer || order.user || order.buyerInfo,
                  quantity,
                  price,
                  status: order.status || order.orderStatus,
                  createdAt: order.createdAt || order.date || order.purchasedAt,
                });
              });
            }
          });
        } else {
          console.error('loadSales: expected orders array but got:', orders, 'raw response:', data);
        }

        setSales(saleEntries);
      } catch (err) {
        setSalesError(err?.response?.data?.message || err.message || 'Failed to load sales');
      } finally {
        setSalesLoading(false);
      }
    };

    if (activeTab === 'sales') {
      loadSales();
    }

    // load authored reviews when Reviews tab is active
    const loadAuthoredReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const data = await getMyReviews();
        // expected shapes: array OR { reviews: [...] } OR { data: [...] }
        const reviews = Array.isArray(data) ? data : data?.reviews || data?.data || [];
        setAuthoredReviews(reviews);
      } catch (err) {
        setReviewsError(err?.response?.data?.message || err.message || 'Failed to load reviews');
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeTab === 'reviews') {
      loadAuthoredReviews();
    }
  }, [activeTab]);

  //Keyboard navigation for Profile Menu
  const handleKeyDown = (e, index) => {
    const key = e.key;
    let newIndex = index;

    if (key === "ArrowRight" || key === "ArrowDown") {
      newIndex = (index + 1) % tabs.length;
      setActiveTab(tabs[newIndex].id);
      document.getElementById(`tab-${tabs[newIndex].id}`)?.focus();
      e.preventDefault();
    } else if (key === "ArrowLeft" || key === "ArrowUp") {
      newIndex = (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[newIndex].id);
      document.getElementById(`tab-${tabs[newIndex].id}`)?.focus();
      e.preventDefault();
    } else if (key === "Home") {
      setActiveTab(tabs[0].id);
      document.getElementById(`tab-${tabs[0].id}`)?.focus();
      e.preventDefault();
    } else if (key === "End") {
      setActiveTab(tabs[tabs.length - 1].id);
      document.getElementById(`tab-${tabs[tabs.length - 1].id}`)?.focus();
      e.preventDefault();
    }
  };

  // if URL contains ?tab=... set the active tab on mount/navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6">
          <div className="md:flex md:space-x-6">
            {/* Profile Menu List */}
            <div className="md:w-64 mb-4 md:mb-0">
              <nav
                className="flex flex-col space-y-2"
                role="tablist"
                aria-orientation="vertical"
                aria-label="Profile sections"
              >
                {tabs.map((tab, idx) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`w-full text-left px-4 py-3 text-md font-medium rounded-md transition-colors focus:outline-none hover:cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Display Panel */}
            <div className="flex-1">
              {/* Profile Tab */}
              <div
                id="panel-profile"
                role="tabpanel"
                aria-labelledby="tab-profile"
                hidden={activeTab !== "profile"}
                tabIndex={0}
              >
                {/* View Profile Details */}
                {!isEditing ? (
                  <>
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      {(user?.profilePicture || user?.picture) ? (
                        <img
                          src={(user?.profilePicture || user?.picture)?.replace(/=s\d+-c/, '=s400-c')}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gray-300">
                          <User className="w-20 h-20 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold">
                          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'No name provided'}
                        </h3>
                        <p className="text-sm text-gray-600">{user?.email || 'No email provided'}</p>
                        <p className="text-sm text-gray-600 mt-1">Phone: {user?.phone || 'No phone number provided'}</p>
                        {user?.role && (
                          <p className="text-xs text-gray-500 mt-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                        )}
                        {user?.createdAt && (
                          <p className="text-xs text-gray-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                  {/* Edit Profile */}
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <label className="block text-md font-medium text-gray-700">Profile Image</label>
                        {previewUrl || (form.profilePicture || user?.picture) ? (
                          <img
                            src={previewUrl || (form.profilePicture || user?.picture)?.replace(/=s\d+-c/, '=s400-c')}
                            alt="Profile"
                            className="w-40 h-40 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-40 h-40 rounded-full flex items-center justify-center bg-gray-300">
                            <User className="w-20 h-20 text-gray-500" />
                          </div>
                        )}
                        <button
                            type="button"
                            onClick={() => document.getElementById('profile-file-input')?.click()}
                            className="text-sm text-green-600 hover:cursor-pointer"
                          >
                            Change photo
                        </button>
                      </div>

                      <div className="flex-1">
                        <input
                          id="profile-file-input"
                          type="file"
                          accept="image/*"
                          onChange={onFileChange}
                          className="hidden"
                        />

                        <label className="block text-md font-medium text-gray-700 mb-2">Username</label>
                        <input
                          name="username"
                          value={form.username}
                          onChange={onChange}
                          placeholder={user?.username || 'e.g., john_doe'}
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />

                        <div className="flex items-center justify-between mt-4">
                          <label className="block text-md font-medium text-gray-700 mb-2">Full Name</label>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'No name provided'}</p>

                        <label className="block text-md font-medium text-gray-700 mt-3 mb-2">Email</label>
                        <p className="mt-1 text-sm text-gray-700">{user?.email || 'No email provided'}</p>

                        <label className="block text-md font-medium text-gray-700 mt-3 mb-2">Phone Number</label>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={onChange}
                          placeholder="e.g., +63 912 345 6789"
                          pattern="^\+[0-9\s\-()]{7,20}$"
                          title="Enter phone in international format: +[country code] [number], e.g. +63 912 345 6789"
                          aria-describedby="phone-format-desc"
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />
                        <p id="phone-format-desc" className="text-xs text-gray-500 mt-1">Format: +[country code] [number], e.g. +63 912 345 6789</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:cursor-pointer"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-4 py-2 border rounded-md hover:cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                <Modal
                  isOpen={showConfirm}
                  onClose={() => setShowConfirm(false)}
                  title="Confirm changes"
                >
                  <p>Are you sure you want to save these changes to your profile?</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 border rounded-md hover:cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:cursor-pointer"
                    >
                      {isSaving ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </Modal>
                  </>
                )}
              </div>

              {/* My Listings Tab */}
              <div
                id="panel-listings"
                role="tabpanel"
                aria-labelledby="tab-listings"
                hidden={activeTab !== "listings"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Listings</h2>
                {listingsLoading ? (
                  <LoadingSpinner size="lg" />
                ) : listingsError ? (
                  <p className="text-red-600">{listingsError}</p>
                ) : myListings.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-700 mb-4">You haven't listed any products yet.</p>
                    <Link to="/sell" className="px-4 py-2 bg-green-600 text-white rounded-md">List a product</Link>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {myListings.map((product) => (
                      <div key={product._id} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                        <Link to={`/products/${product._id}`} className="block">
                          <img
                            src={product.image || product.images?.[0] || '/api/placeholder/400/320'}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        </Link>

                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 font-bold">{formatCurrency(product.price)}</span>
                            <span className="text-xs text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchases Tab */}
              <div
                id="panel-purchases"
                role="tabpanel"
                aria-labelledby="tab-purchases"
                hidden={activeTab !== "purchases"}
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold mb-4">My Purchases</h2>
                </div>
                {purchasesLoading ? (
                  <LoadingSpinner size="lg" />
                ) : purchasesError ? (
                  <p className="text-red-600">{purchasesError}</p>
                ) : purchases.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-700 mb-4">You haven't purchased any products yet.</p>
                    <Link to="/browse" className="px-4 py-2 bg-green-600 text-white rounded-md">Browse products</Link>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {purchases.map((product) => (
                      <div key={product._id || product.id || product.name} className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                        <Link to={product._id ? `/products/${product._id}` : '#'} className="block">
                          <img
                            src={product.image || product.images?.[0] || '/api/placeholder/400/320'}
                            alt={product.name || 'Purchased product'}
                            className="w-full h-48 object-cover"
                          />
                        </Link>

                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name || 'Product'}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-green-700 font-bold">{formatCurrency(product.price || product.amount || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sales Tab */}
              <div
                id="panel-sales"
                role="tabpanel"
                aria-labelledby="tab-sales"
                hidden={activeTab !== "sales"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Sales</h2>
                {salesLoading ? (
                  <LoadingSpinner size="lg" />
                ) : salesError ? (
                  <p className="text-red-600">{salesError}</p>
                ) : sales.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-700 mb-4">You haven't made any sales yet.</p>
                    <Link to="/profile?tab=listings" className="px-4 py-2 bg-green-600 text-white rounded-md">View my listings</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sales.map((entry, idx) => (
                      <div key={entry.orderId + '-' + idx} className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-32 flex-shrink-0">
                          <img src={entry.product?.image || entry.product?.images?.[0] || '/api/placeholder/400/320'} alt={entry.product?.name || 'Product'} className="w-full h-24 object-cover rounded" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{entry.product?.name || 'Product'}</h3>
                          <p className="text-sm text-gray-600">Buyer: {entry.buyer?.name || entry.buyer?.email || entry.buyer?.username || 'Unknown'}</p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-700">
                            <span className="font-medium text-green-700">{formatCurrency(entry.price)}</span>
                            <span>Qty: {entry.quantity}</span>
                            {entry.createdAt && <span>• {new Date(entry.createdAt).toLocaleDateString()}</span>}
                            {entry.status && <span className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded">{entry.status}</span>}
                          </div>
                        </div>
                        <div>
                          {entry.orderId ? (
                            <Link to={`/orders/${entry.orderId}`} className="px-3 py-1 border rounded text-sm">View order</Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Tab (to test pa) */}
              <div
                id="panel-reviews"
                role="tabpanel"
                aria-labelledby="tab-reviews"
                hidden={activeTab !== "reviews"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
                {reviewsLoading ? (
                  <LoadingSpinner size="lg" />
                ) : reviewsError ? (
                  <p className="text-red-600">{reviewsError}</p>
                ) : authoredReviews.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-700 mb-4">You haven't written any reviews yet.</p>
                    <Link to="/browse" className="px-4 py-2 bg-green-600 text-white rounded-md">Browse products</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {authoredReviews.map((r) => (
                      <div key={r._id || r.id || `${r.product?._id || r.product?.id}-${r.createdAt}` } className="bg-white border border-gray-100 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-20 flex-shrink-0">
                            <Link to={r.product?._id ? `/products/${r.product._id}` : '#'}>
                              <img src={r.product?.image || r.product?.images?.[0] || '/api/placeholder/160/160'} alt={r.product?.name || 'Product'} className="w-full h-16 object-cover rounded" />
                            </Link>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-sm">{r.product?.name || r.title || 'Product'}</h3>
                              <span className="text-xs text-gray-500">{r.rating ? `${r.rating}/5` : ''}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{r.body || r.comment || r.text}</p>
                            {r.createdAt && <p className="text-xs text-gray-400 mt-2">Reviewed on {new Date(r.createdAt).toLocaleDateString()}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
