import ProfileAvatar from '../common/ProfileAvatar';

const ProfileHeader = ({ isEditing, onEditClick }) => {
  return (
    <div className="flex items-start justify-between">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      {!isEditing && (
        <button
          onClick={onEditClick}
          className="ml-4 px-3 py-1 bg-green-800 text-white rounded-md text-md hover:cursor-pointer hover:bg-green-700 transition"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

const ProfileDisplay = ({ user }) => {
  return (
    <div className="flex items-center space-x-6">
      <ProfileAvatar user={user} size="3xl" className="w-40 h-40 mt-2" />

      <div className="flex-1 space-y-3 ml-6">
        <h3 className="text-2xl font-bold">
          {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'No name provided'}
        </h3>
        <p className="text-sm text-gray-600">{user?.username || 'No username provided'}</p>
        <p className="text-sm text-gray-600">{user?.email || 'No email provided'}</p>
        <p className="text-sm text-gray-600 mt-1">Phone Number: {user?.contactNumber || user?.phone || 'No phone number provided'}</p>
        {user?.role && (
          <p className="text-xs text-gray-500 mt-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        )}
        {user?.createdAt && (
          <p className="text-xs text-gray-500 mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export { ProfileHeader, ProfileDisplay };