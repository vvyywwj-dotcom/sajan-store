import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../api/client'

export default function MyOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    ordersApi.my().then(setOrders).catch(console.error).finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return <p className="text-center text-gray-400 py-12">Loading...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 && <p className="text-gray-400 text-center py-12">No orders yet</p>}
      <div className="space-y-3">
        {orders.map(o => (
          <Link key={o._id} to={`/order/${o._id}`} className="block bg-white rounded-2xl p-4 shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{o.productName || (o.orderType==='reseller' ? 'Reseller Upgrade' : 'Order')}</p>
                <p className="text-sm text-gray-500">{o.durationLabel} • ₹{o.total}</p>
                <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                o.status==='approved'?'bg-emerald-100 text-emerald-700':
                o.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'
              }`}>{o.status}</span>
            </div>
            {o.keyDelivered && <p className="mt-2 font-mono text-orange-600 text-sm">Key: {o.keyDelivered}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
