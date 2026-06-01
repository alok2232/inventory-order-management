import { useState, useEffect } from 'react'
import { dashboardApi } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError('Failed to load dashboard data'))
  }, [])

  if (error) return <p className="text-red-500 p-4">{error}</p>
  if (!stats) return <p className="p-4 text-gray-400">Loading...</p>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={stats.total_products} accent="blue" />
        <StatCard label="Total Customers" value={stats.total_customers} accent="green" />
        <StatCard label="Total Orders" value={stats.total_orders} accent="purple" />
        <StatCard
          label="Total Revenue"
          value={`$${stats.total_revenue.toFixed(2)}`}
          accent="amber"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Low Stock Products{' '}
          <span className="text-gray-400 font-normal text-sm">(quantity &lt; 10)</span>
        </h3>

        {stats.low_stock_products.length === 0 ? (
          <p className="text-sm text-gray-400">All products have sufficient stock.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-gray-500">Name</th>
                <th className="pb-2 font-medium text-gray-500">SKU</th>
                <th className="pb-2 font-medium text-gray-500">Price</th>
                <th className="pb-2 font-medium text-gray-500">Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2 text-gray-500">{p.sku}</td>
                  <td className="py-2">${p.price.toFixed(2)}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {p.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  const bar = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  }[accent]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className={`h-1 w-10 ${bar} rounded mb-4`} />
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}
