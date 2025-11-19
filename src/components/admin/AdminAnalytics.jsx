import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { Download } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminAnalytics = ({ marketplaceData, onExport }) => {
  // prepare user growth data (last 30 days)
  const userGrowthData = marketplaceData?.userGrowth || [];

  // prepare revenue data (last 30 days)
  const revenueData = marketplaceData?.revenueOverTime || [];

  // prepare top products data
  const topProductsData = (marketplaceData?.topProducts || []).slice(0, 10);

  // prepare category distribution
  const categoryData = marketplaceData?.categoryDistribution || [];

  // prepare seller performance (top 5 sellers)
  const topSellersData = (marketplaceData?.topSellers || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* export button */}
      <div className="flex justify-end">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors hover:cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Analytics (CSV)
        </button>
      </div>

      {/* revenue and user growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* revenue over time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Revenue (Last 30 Days)</h3>
          {revenueData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>no revenue data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₱${value}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* user growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
          {userGrowthData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No user growth data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="New Users"
                />
                <Line
                  type="monotone"
                  dataKey="totalUsers"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* top products and category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* top selling products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          {topProductsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No product sales yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="sales" fill="#10b981" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* category distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Category Distribution</h3>
          {categoryData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No category data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0.01 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* top sellers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sellers</h3>
        {topSellersData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No seller data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellersData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={150}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;