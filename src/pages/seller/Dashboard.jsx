import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { getMyListings } from '../../api/products';
import { getMySales, getOrderStats } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isSeller } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    if (!isSeller) {
      navigate('/sell');
      return;
    }
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeller, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        getMyListings({ limit: 100 }),
        getMySales({ limit: 10 }),
        getOrderStats()
      ]);

      // calculate stats
      const products = productsRes.data?.products || productsRes.products || [];
      const activeProducts = products.filter(p => p.status === 'active').length;
      const totalProducts = products.length;

      // find low stock products
      const lowStock = products
        .filter(p => p.stock > 0 && p.stock <= 5 && p.status === 'active')
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setLowStockProducts(lowStock);

      // order stats
      const orders = ordersRes.data?.orders || ordersRes.orders || [];
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setRecentOrders(orders.slice(0, 5));

      const statsData = statsRes.data || statsRes;
      setStats({
        totalProducts,
        activeProducts,
        pendingOrders,
        totalRevenue: statsData.totalRevenue || 0,
        completedOrders: statsData.completedOrders || 0,
        averageOrderValue: statsData.averageOrderValue || 0
      });
    } catch (err) {
      console.error('failed to fetch dashboard data:', err);
      error('Failed To Load Dashboard Data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Overview Of Your Store Performance</p>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          subtitle={`${stats?.activeProducts || 0} Active`}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="orange"
          link="/seller/orders?status=pending"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          subtitle={`${stats?.completedOrders || 0} Completed Orders`}
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats?.averageOrderValue || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          link="/seller/products?filter=low-stock"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* recent orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/seller/orders" className="text-sm text-green-600 hover:text-green-700 hover:cursor-pointer">
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No Orders Yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/seller/orders/${order._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors hover:cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber || order._id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* low stock alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/seller/products" className="text-sm text-green-600 hover:text-green-700 hover:cursor-pointer">
              View All
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">All Products Have Sufficient Stock</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/seller/products/${product._id}/edit`}
                  className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors hover:cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-red-600 font-semibold">
                          {product.stock} Left
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle, link }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  const content = (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="hover:cursor-pointer block transform transition-transform hover:scale-105">
      {content}
    </Link>
  ) : (
    content
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default Dashboard;