import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAuth } from '../../context/AuthContext'
import { ordersApi, productsApi, settingsApi } from '../../api/client'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pending:0, products:0, saleActive:false })

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/admin'); return }
    Promise.all([ordersApi.list('pending'), productsApi.list(), settingsApi.public()])
      .then(([orders, prods, set]) => setStats({ pending: orders.length, products: (prods.products||[]).length, saleActive: set.saleActive }))
      .catch(console.error)
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/orders" className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending Orders</p>
          </Link>
          <Link to="/admin/products" className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-3xl font-bold text-blue-600">{stats.products}</p>
            <p className="text-sm text-gray-500">Products</p>
          </Link>
          <Link to="/admin/sale" className="bg-white rounded-2xl p-5 border shadow-sm">
            <p className="text-3xl font-bold">{stats.saleActive ? '🔴 ON' : 'OFF'}</p>
            <p className="text-sm text-gray-500">Sale Status</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
