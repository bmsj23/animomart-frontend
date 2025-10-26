import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { updateMyProfile } from "../api/users";
import { uploadProfilePicture } from "../api/upload";
import Modal from "../components/common/Modal";

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

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || "",
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
      profilePicture: user?.profilePicture || "",
    });
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setSelectedFile(null);
    setPreviewUrl("");
  };

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
                    className={`w-full text-left px-4 py-3 text-md font-medium rounded-md transition-colors focus:outline-none ${
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
              <div
                id="panel-profile"
                role="tabpanel"
                aria-labelledby="tab-profile"
                hidden={activeTab !== "profile"}
                tabIndex={0}
              >
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
                      <img
                        src={user?.profilePicture || 'https://via.placeholder.com/80'}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover"
                      />

                      <div>
                        <h3 className="text-lg font-semibold">
                          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'No name provided'}
                        </h3>
                        <p className="text-sm text-gray-600">{user?.email || 'No email provided'}</p>
                        <p className="text-sm text-gray-600 mt-1">Phone: {user?.phone || 'No phone provided'}</p>
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
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <label className="block text-md font-medium text-gray-700">Profile Image</label>
                        <img
                          src={previewUrl || form.profilePicture || 'https://via.placeholder.com/80'}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover"
                        />
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
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />
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

              <div
                id="panel-listings"
                role="tabpanel"
                aria-labelledby="tab-listings"
                hidden={activeTab !== "listings"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Listings</h2>
                <p className="text-gray-600">
                  Your product listings will appear here.
                </p>
              </div>

              <div
                id="panel-purchases"
                role="tabpanel"
                aria-labelledby="tab-purchases"
                hidden={activeTab !== "purchases"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Purchases</h2>
                <p className="text-gray-600">
                  Your purchase history will appear here.
                </p>
              </div>

              <div
                id="panel-sales"
                role="tabpanel"
                aria-labelledby="tab-sales"
                hidden={activeTab !== "sales"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">My Sales</h2>
                <p className="text-gray-600">
                  Your sales history will appear here.
                </p>
              </div>

              <div
                id="panel-reviews"
                role="tabpanel"
                aria-labelledby="tab-reviews"
                hidden={activeTab !== "reviews"}
                tabIndex={0}
              >
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                <p className="text-gray-600">
                  Reviews you've received will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
