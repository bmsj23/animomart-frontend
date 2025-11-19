import { useState, useEffect } from 'react';
import { Search, MoreVertical, Ban, CheckCircle, Trash2, Mail, Calendar } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/common/Modal';
import { logger } from '../../utils/logger';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, type: '', user: null });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { success, error } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.data?.users || []);
    } catch (err) {
      logger.error('error fetching users:', err);
      error('failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuspendUser = async (userId) => {
    try {
      await adminApi.suspendUser(userId, { reason: 'suspended by admin' });
      success('user suspended successfully');
      fetchUsers();
      setActionModal({ show: false, type: '', user: null });
    } catch (err) {
      logger.error('error suspending user:', err);
      error('failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminApi.activateUser(userId);
      success('User activated successfully');
      fetchUsers();
      setActionModal({ show: false, type: '', user: null });
    } catch (err) {
      logger.error('error activating user:', err);
      error('failed to activate user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      success('User deleted successfully');
      fetchUsers();
      setActionModal({ show: false, type: '', user: null });
    } catch (err) {
      logger.error('error deleting user:', err);
      error('failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Users</h1>
          <p className="text-sm sm:text-base text-gray-500">Manage all registered users</p>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-xl shadow-sm">
          <span className="text-xs sm:text-sm font-medium text-gray-600">Total Users:</span>
          <span className="text-base sm:text-lg font-bold text-gray-900">{users.length}</span>
        </div>
      </div>

      {/* search bar */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </div>

      {/* users table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm sm:text-base text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            {/* mobile card view */}
            <div className="md:hidden divide-y divide-gray-200">{
              filteredUsers.map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture || 'https://via.placeholder.com/40'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === user._id ? null : user._id)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>

                  {/* mobile dropdown */}
                  {activeDropdown === user._id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => {
                            setActionModal({ show: true, type: 'suspend', user });
                            setActiveDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          Suspend User
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActionModal({ show: true, type: 'activate', user });
                            setActiveDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          Activate User
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActionModal({ show: true, type: 'delete', user });
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:cursor-pointer"
                      >
                        Delete User
                      </button>
                    </div>
                  )}
                </div>
              ))
            }</div>

            {/* desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profilePicture || 'https://via.placeholder.com/40'}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin'}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        user.isSuspended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isSuspended ? (
                          <>
                            <Ban className="w-3 h-3" />
                            suspended
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            active
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-9 py-4 whitespace-nowrap text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {selectedUser?._id === user._id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 ${
                            index >= filteredUsers.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                          }`}>
                            {!user.isSuspended ? (
                              <button
                                onClick={() => {
                                  setActionModal({ show: true, type: 'suspend', user });
                                  setSelectedUser(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 hover:cursor-pointer"
                              >
                                <Ban className="w-4 h-4" />
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActionModal({ show: true, type: 'activate', user });
                                  setSelectedUser(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 hover:cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActionModal({ show: true, type: 'delete', user });
                                setSelectedUser(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 hover:cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* action modals */}
      <Modal
        isOpen={actionModal.show}
        onClose={() => setActionModal({ show: false, type: '', user: null })}
        title={
          actionModal.type === 'suspend' ? 'Suspend User' :
          actionModal.type === 'activate' ? 'Activate User' :
          'Delete User'
        }
        description={
          actionModal.type === 'suspend' ? `Are you sure you want to suspend ${actionModal.user?.name}? They will not be able to access the platform.` :
          actionModal.type === 'activate' ? `Activate ${actionModal.user?.name}'s account? They will regain access to the platform.` :
          `permanently delete ${actionModal.user?.name}? this action cannot be undone.`
        }
        icon={
          actionModal.type === 'suspend' ? <Ban className="w-5 h-5" /> :
          actionModal.type === 'activate' ? <CheckCircle className="w-5 h-5" /> :
          <Trash2 className="w-5 h-5" />
        }
        iconBgColor={
          actionModal.type === 'delete' ? 'bg-red-100' :
          actionModal.type === 'suspend' ? 'bg-orange-100' :
          'bg-green-100'
        }
        iconColor={
          actionModal.type === 'delete' ? 'text-red-600' :
          actionModal.type === 'suspend' ? 'text-orange-600' :
          'text-green-600'
        }
        actions={
          <>
            <button
              onClick={() => setActionModal({ show: false, type: '', user: null })}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (actionModal.type === 'suspend') handleSuspendUser(actionModal.user._id);
                else if (actionModal.type === 'activate') handleActivateUser(actionModal.user._id);
                else if (actionModal.type === 'delete') handleDeleteUser(actionModal.user._id);
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors hover:cursor-pointer ${
                actionModal.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-800 hover:bg-green-700'
              }`}
            >
              Confirm
            </button>
          </>
        }
      />
    </div>
  );
};

export default Users;