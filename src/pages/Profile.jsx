import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { updateMyProfile } from "../api/users";
import { uploadProfilePicture } from "../api/upload";

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

  const [form, setForm] = useState({
    name: user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    email: user?.email || "",
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
    e.preventDefault();
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
        name: form.name,
        ...(form.email ? { email: form.email } : {}),
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

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      name: user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      email: user?.email || "",
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

  //Keyboard navigation for tabs
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

            {/* Display panels */}
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
                        className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                      >
                        Edit Profile
                      </button>
                    </div>

                    <div className="flex items-center space-x-6">
                      <img
                        src={user?.profilePicture || 'https://via.placeholder.com/80'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />

                      <div>
                        <h3 className="text-lg font-semibold">
                          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'No name provided'}
                        </h3>
                        <p className="text-sm text-gray-600">{user?.email || 'No email provided'}</p>
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
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <img
                          src={previewUrl || form.profilePicture || 'https://via.placeholder.com/80'}
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          id="profile-file-input"
                          type="file"
                          accept="image/*"
                          onChange={onFileChange}
                          className="hidden"
                        />
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">Full name</label>
                          <button
                            type="button"
                            onClick={() => document.getElementById('profile-file-input')?.click()}
                            className="text-sm text-green-600"
                          >
                            Change photo
                          </button>
                        </div>
                        <input
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-3">Email</label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={onChange}
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />

                        <label className="block text-sm font-medium text-gray-700 mt-3">Profile picture URL</label>
                        <input
                          name="profilePicture"
                          value={form.profilePicture}
                          onChange={onChange}
                          className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-md"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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
