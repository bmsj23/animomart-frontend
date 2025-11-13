import { User } from "lucide-react";
import Modal from "../common/Modal";

const ProfileEditForm = ({
  user,
  form,
  previewUrl,
  isSaving,
  showConfirm,
  onChange,
  onFileChange,
  onSaveClick,
  onCancel,
  onConfirmSave,
  onCloseConfirm,
}) => {
  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
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
            onClick={onSaveClick}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border rounded-md hover:cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>

      <Modal
        isOpen={showConfirm}
        onClose={onCloseConfirm}
        title="Confirm changes"
      >
        <p>Are you sure you want to save these changes to your profile?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseConfirm}
            className="px-4 py-2 border rounded-md hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmSave}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ProfileEditForm;