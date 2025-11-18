import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { getAllOrders, getAllProducts, getAllUsers } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { Users, Package, ShoppingBag, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import AdminAnalytics from '../../components/admin/AdminAnalytics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logger } from '../../utils/logger';

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
  const navigate = useNavigate();
  const { stats, loading } = useAdmin();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        getAllOrders({ limit: 1000 }),
        getAllProducts({ limit: 1000 }),
        getAllUsers({ limit: 1000 })
      ]);

      const orders = ordersRes.data?.orders || ordersRes.orders || [];
      const products = productsRes.data?.products || productsRes.products || [];
      const users = usersRes.data?.users || usersRes.users || [];

      // prepare analytics data
      const analytics = prepareAnalyticsData(orders, products, users);
      setAnalyticsData(analytics);
    } catch (err) {
      logger.error('failed to fetch analytics data:', err);
      error('Failed To Load Analytics Data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const prepareAnalyticsData = (orders, products, users) => {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        newUsers: 0,
        totalUsers: 0,
        fullDate: date.toISOString().split('T')[0]
      };
    });

    // aggregate revenue by date
    orders.forEach(order => {
      if (order.status === 'completed') {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const dayData = last30Days.find(d => d.fullDate === orderDate);
        if (dayData) {
          dayData.revenue += order.totalAmount;
        }
      }
    });

    // aggregate user growth
    let cumulativeUsers = users.filter(u => {
      const userDate = new Date(u.createdAt);
      return userDate < new Date(last30Days[0].fullDate);
    }).length;

    last30Days.forEach(day => {
      const dayStart = new Date(day.fullDate);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const newUsers = users.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= dayStart && userDate < dayEnd;
      }).length;

      day.newUsers = newUsers;
      cumulativeUsers += newUsers;
      day.totalUsers = cumulativeUsers;
    });

    // top products
    const productSalesMap = new Map();
    orders.forEach(order => {
      if (order.status === 'completed') {
        order.items?.forEach(item => {
          const productId = item.product?._id || item.product;
          const productName = item.product?.name || item.name || 'Unknown';
          const current = productSalesMap.get(productId) || { name: productName, sales: 0 };
          current.sales += item.quantity;
          productSalesMap.set(productId, current);
        });
      }
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // category distribution
    const categoryMap = new Map();
    products.forEach(product => {
      const category = product.category || 'uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // top sellers
    const sellerRevenueMap = new Map();
    orders.forEach(order => {
      if (order.status === 'completed') {
        const sellerId = order.seller?._id || order.seller;
        const sellerName = order.seller?.name || 'Unknown Seller';
        const current = sellerRevenueMap.get(sellerId) || { name: sellerName, revenue: 0 };
        current.revenue += order.totalAmount;
        sellerRevenueMap.set(sellerId, current);
      }
    });

    const topSellers = Array.from(sellerRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      userGrowth: last30Days,
      revenueOverTime: last30Days,
      topProducts,
      categoryDistribution,
      topSellers
    };
  };

  const handleExportAnalytics = () => {
    if (!analyticsData) return;

    // prepare CSV data
    const csvRows = [];

    // header
    csvRows.push('animomart platform analytics report');
    csvRows.push(`generated on: ${new Date().toLocaleString()}`);
    csvRows.push('');

    // platform stats
    csvRows.push('platform statistics');
    csvRows.push('metric,value');
    csvRows.push(`total users,${stats.totalUsers}`);
    csvRows.push(`total products,${stats.totalProducts}`);
    csvRows.push(`total orders,${stats.totalOrders}`);
    csvRows.push(`pending reports,${stats.pendingReports}`);
    csvRows.push('');

    // top products
    csvRows.push('top selling products');
    csvRows.push('product name,units sold');
    analyticsData.topProducts.forEach(p => {
      csvRows.push(`"${p.name}",${p.sales}`);
    });
    csvRows.push('');

    // top sellers
    csvRows.push('top performing sellers');
    csvRows.push('seller name,revenue (PHP)');
    analyticsData.topSellers.forEach(s => {
      csvRows.push(`"${s.name}",${s.revenue}`);
    });
    csvRows.push('');

    // category distribution
    csvRows.push('product category distribution');
    csvRows.push('category,count');
    analyticsData.categoryDistribution.forEach(c => {
      csvRows.push(`${c.name},${c.value}`);
    });

    // create and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animomart-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer"
            >
              <span className="font-medium">View All Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer"
            >
              <span className="font-medium">Manage Products</span>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-left transition-colors backdrop-blur-sm hover:cursor-pointer"
            >
              <span className="font-medium">Review Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* analytics charts */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : analyticsData ? (
        <AdminAnalytics
          marketplaceData={analyticsData}
          onExport={handleExportAnalytics}
        />
      ) : null}

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