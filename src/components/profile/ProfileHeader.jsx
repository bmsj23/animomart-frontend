import ProfileAvatar from '../common/ProfileAvatar';

const ProfileHeader = ({ isEditing, onEditClick }) => {
  return (
    <div className="flex items-start justify-between">
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
      {!isEditing && (
        <button
          onClick={onEditClick}
          className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:cursor-pointer"
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
      <ProfileAvatar user={user} size="3xl" className="w-40 h-40" />

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
  );
};

export { ProfileHeader, ProfileDisplay };