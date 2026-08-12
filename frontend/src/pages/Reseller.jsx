import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { settingsApi, ordersApi } from '../api/client'

export default function Reseller() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({})
  const [step, setStep] = useState(1)
  const [ss, setSs] = useState('')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.isReseller) return
    settingsApi.public().then(setSettings).catch(console.error)
  }, [user, navigate])

  if (user?.isReseller) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 text-center shadow">
        <h1 className="text-xl font-bold text-emerald-600">You are a Reseller!</h1>
        <p className="text-sm text-gray-500 mt-2">You get {settings.resellerDiscountPercent || 10}% discount on all products.</p>
      </div>
    )
  }

  const price = settings.resellerPrice || 999

  const submit = async () => {
    if (!ss || !upiId) return alert('Upload SS + UPI ID')
    setLoading(true)
    try {
      const order = await ordersApi.create({
        userId: user.id,
        productName: 'Reseller Upgrade',
        total: price,
        price,
        quantity: 1,
        buyer: { name: user.name, email: user.email, phone: user.phone, telegram: user.telegram },
        paymentMethod: 'upi',
        paymentSs: ss,
        buyerUpiId: upiId,
        orderType: 'reseller',
      })
      navigate(`/order/${order._id}`)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow space-y-4">
      <h1 className="text-xl font-bold text-center">Become a Reseller</h1>
      <p className="text-center text-gray-500 text-sm">Pay ₹{price} once and get <strong>{settings.resellerDiscountPercent || 10}% discount</strong> on every product forever.</p>
      {step===1 && (
        <button onClick={()=>setStep(2)} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl">
          Pay ₹{price} →
        </button>
      )}
      {step===2 && (
        <div className="space-y-3">
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-sm">Pay ₹{price} to UPI</p>
            <p className="text-xl font-bold text-orange-600">{settings.upiId || 'sajan@upi'}</p>
          </div>
          <input type="file" accept="image/*" onChange={e=>{
            const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>setSs(r.result); r.readAsDataURL(f)
          }} className="w-full text-sm"/>
          {ss && <img src={ss} className="max-h-32 rounded border"/>}
          <input placeholder="Your UPI / Txn ID" value={upiId} onChange={e=>setUpiId(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm"/>
          <button onClick={submit} disabled={loading} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl">
            {loading?'...':'Submit for Approval'}
          </button>
        </div>
      )}
    </div>
  )
}
