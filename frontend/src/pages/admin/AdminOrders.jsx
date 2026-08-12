import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAuth } from '../../context/AuthContext'
import { ordersApi } from '../../api/client'
import { Check, X, Eye } from 'lucide-react'

export default function AdminOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('pending')
  const [view, setView] = useState(null)

  const load = () => ordersApi.list(filter).then(setOrders).catch(console.error)

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/admin'); return }
    load()
  }, [user, navigate, filter])

  const act = async (id, status) => {
    try {
      await ordersApi.setStatus(id, status)
      setView(null)
      load()
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="flex gap-2 mb-4">
          {['pending','approved','rejected','all'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-sm capitalize ${filter===f?'bg-orange-500 text-white':'bg-white border'}`}>{f}</button>
          ))}
        </div>
        <div className="space-y-2">
          {orders.map(o=>(
            <div key={o._id} className="bg-white rounded-xl p-3 border flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{o.productName || o.orderType} <span className="text-xs font-normal text-gray-400">₹{o.total}</span></p>
                <p className="text-xs text-gray-500">{o.buyer?.name} • {o.buyer?.phone}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${o.status==='pending'?'bg-yellow-100 text-yellow-700':o.status==='approved'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{o.status}</span>
                {o.keyDelivered && <p className="text-xs font-mono text-orange-600 mt-0.5">{o.keyDelivered}</p>}
              </div>
              <button onClick={()=>setView(o)} className="p-2 text-gray-500"><Eye size={16}/></button>
              {o.status==='pending' && <>
                <button onClick={()=>act(o._id,'approved')} className="p-2 text-emerald-600"><Check size={16}/></button>
                <button onClick={()=>act(o._id,'rejected')} className="p-2 text-red-500"><X size={16}/></button>
              </>}
            </div>
          ))}
          {orders.length===0 && <p className="text-center text-gray-400 py-10">No orders</p>}
        </div>
      </div>
      {view && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-4">
            <div className="flex justify-between mb-3"><h2 className="font-bold">Order Detail</h2><button onClick={()=>setView(null)}><X size={18}/></button></div>
            <div className="text-sm space-y-1">
              <p>ID: {view._id}</p>
              <p>Type: {view.orderType} • {view.productName}</p>
              <p>Total: ₹{view.total}</p>
              <p>Buyer: {view.buyer?.name} / {view.buyer?.phone} / {view.buyer?.telegram}</p>
              <p>UPI/Txn: {view.buyerUpiId}</p>
              {view.paymentSs && <img src={view.paymentSs} className="rounded border max-h-48 mt-2"/>}
            </div>
            {view.status==='pending' && (
              <div className="flex gap-2 mt-4">
                <button onClick={()=>act(view._id,'approved')} className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl">Approve</button>
                <button onClick={()=>act(view._id,'rejected')} className="px-4 border border-red-200 text-red-500 rounded-xl">Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
