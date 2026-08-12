import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordersApi } from '../api/client'
import { CheckCircle, Clock, XCircle, Copy, Check } from 'lucide-react'

export default function OrderStatus() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = () => ordersApi.get(id).then(setOrder).catch(console.error)
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [id])

  if (!order) return <p className="text-center text-gray-400 py-20">Loading...</p>

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-6 text-center">
      {order.status==='pending' && <><Clock size={48} className="mx-auto text-yellow-500 mb-3"/><h2 className="text-xl font-bold">Waiting for Approval</h2><p className="text-sm text-gray-500 mt-2">Admin will review your payment soon.</p></>}
      {order.status==='approved' && <><CheckCircle size={48} className="mx-auto text-emerald-500 mb-3"/><h2 className="text-xl font-bold">Approved!</h2>
        {order.keyDelivered && (
          <div className="mt-4 bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-2">
            <code className="font-bold text-orange-600 break-all">{order.keyDelivered}</code>
            <button onClick={()=>{navigator.clipboard.writeText(order.keyDelivered);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="p-2 bg-orange-100 rounded-lg text-orange-600">
              {copied?<Check size={18}/>:<Copy size={18}/>}
            </button>
          </div>
        )}
        {order.orderType==='reseller' && <p className="mt-3 text-emerald-600 font-medium">You are now a Reseller!</p>}
      </>}
      {order.status==='rejected' && <><XCircle size={48} className="mx-auto text-red-500 mb-3"/><h2 className="text-xl font-bold">Rejected</h2></>}
      <div className="mt-6 text-left bg-gray-50 rounded-xl p-4 text-sm space-y-1">
        <p><span className="text-gray-500">Order:</span> {order._id}</p>
        <p><span className="text-gray-500">Product:</span> {order.productName || order.orderType}</p>
        <p><span className="text-gray-500">Total:</span> ₹{order.total}</p>
        <p><span className="text-gray-500">Status:</span> {order.status}</p>
      </div>
      <Link to="/my-orders" className="inline-block mt-4 text-orange-600 text-sm">My Orders →</Link>
    </div>
  )
}
