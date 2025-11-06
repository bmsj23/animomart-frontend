import { useAdmin } from '../../hooks/useAdmin';
import { Users, Package, ShoppingBag, AlertCircle, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, loading, index }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="text-gray-900">
                  {value.toLocaleString()}
                </span>
              )}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {Icon && <Icon className="w-6 h-6 text-white" />}
          </div>
        </div>

        {/* progress bar animation */}
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000`}
            style={{
              width: loading ? '0%' : '100%',
              transitionDelay: `${index * 0.2}s`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { stats, loading } = useAdmin();

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'amber'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'green'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: AlertCircle,
      color: 'red'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-500">Welcome, Admin. Here's what's happening with your marketplace.</p>
        </div>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            loading={loading}
            index={index}
          />
        ))}
      </div>

      {/* quick insights section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* marketplace overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Marketplace Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Active Listings</span>
              <span className="text-lg font-bold text-gray-900">
                {loading ? '...' : stats.totalProducts}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Registered Users</span>
              <span className="text-lg font-bold text-gray-900">
                {loading ? '...' : stats.totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Completed Orders</span>
              <span className="text-lg font-bold text-gray-900">
                {loading ? '...' : stats.totalOrders}
              </span>
            </div>
          </div>
        </div>

        {/* recent activity placeholder */}
        <div className="bg-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6" />
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <p className="text-green-100 text-sm mb-6">
              Manage your marketplace efficiently with quick access to key features
            </p>
            <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer">
              <span className="font-medium">View All Users</span>
            </button>
            <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer">
              <span className="font-medium">Manage Products</span>
            </button>
            <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer">
              <span className="font-medium">Review Reports</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;