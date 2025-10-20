import { useState } from 'react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'listings', label: 'My Listings' },
    { id: 'purchases', label: 'My Purchases' },
    { id: 'sales', label: 'My Sales' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <p className="text-gray-600">Profile settings will appear here.</p>
            </div>
          )}
          {activeTab === 'listings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Listings</h2>
              <p className="text-gray-600">Your product listings will appear here.</p>
            </div>
          )}
          {activeTab === 'purchases' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Purchases</h2>
              <p className="text-gray-600">Your purchase history will appear here.</p>
            </div>
          )}
          {activeTab === 'sales' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Sales</h2>
              <p className="text-gray-600">Your sales history will appear here.</p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <p className="text-gray-600">Reviews you've received will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
