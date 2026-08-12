import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productsApi, ordersApi, settingsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Check } from 'lucide-react'

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [settings, setSettings] = useState({})
  const [saleActive, setSaleActive] = useState(false)
  const [duration, setDuration] = useState(null)
  const [qty, setQty] = useState(1)
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [form, setForm] = useState({ name:'', phone:'', telegram:'', email:'' })
  const [ss, setSs] = useState('')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    productsApi.get(id).then(p => { setProduct(p); if(p.durations?.[0]) setDuration(p.durations[0]) }).catch(()=>navigate('/'))
    settingsApi.public().then(s => { setSettings(s); setSaleActive(s.saleActive) }).catch(console.error)
    if (user) setForm(f => ({ ...f, name: user.name||'', email: user.email||'', phone: user.phone||'', telegram: user.telegram||'' }))
  }, [id, user, navigate])

  if (!product) return null

  const calcPrice = (base) => {
    let p = base
    if (saleActive && product.isOnSale && product.saleDiscountPercent) p = Math.round(p * (1 - product.saleDiscountPercent/100))
    if (user?.isReseller && settings.resellerDiscountPercent) p = Math.round(p * (1 - settings.resellerDiscountPercent/100))
    return p
  }

  const unitPrice = duration ? calcPrice(duration.price) : 0
  const total = unitPrice * qty
  const discount = duration ? (duration.price * qty - total) : 0

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setSs(r.result)
    r.readAsDataURL(f)
  }

  const submit = async () => {
    if (!ss || !upiId) return alert('Upload SS and enter UPI/Txn ID')
    setLoading(true)
    try {
      const order = await ordersApi.create({
        userId: user?.id || null,
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        durationLabel: duration.label,
        durationId: duration._id,
        price: unitPrice,
        quantity: qty,
        total,
        discountApplied: discount,
        buyer: form,
        paymentMethod,
        paymentSs: ss,
        buyerUpiId: upiId,
        isResellerOrder: !!user?.isReseller,
        orderType: 'product',
      })
      navigate(`/order/${order._id}`)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-orange-600 text-sm mb-4"><ArrowLeft size={16}/> Back</Link>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 flex gap-4 border">
            {product.image && <img src={product.image} className="w-16 h-16 rounded-xl object-cover"/>}
            <div><h2 className="font-bold">{product.name}</h2><p className="text-sm text-gray-500">{product.description}</p></div>
          </div>
          <div className="bg-white rounded-2xl p-4 border">
            <h3 className="font-semibold mb-3">Choose Duration</h3>
            {product.durations?.map(d => {
              const price = calcPrice(d.price)
              return (
                <button key={d._id||d.label} onClick={()=>setDuration(d)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border-2 mb-2 ${duration?._id===d._id||duration?.label===d.label?'border-emerald-400 bg-emerald-50':'border-gray-100'}`}>
                  <span className="flex items-center gap-2 text-sm">
                    {(duration?._id===d._id||duration?.label===d.label) && <Check size={14} className="text-emerald-600"/>}
                    {d.label} <span className="text-xs text-gray-400">({d.keys?.length||0} keys)</span>
                  </span>
                  <span className="font-bold text-orange-600">
                    ₹{price}{price!==d.price && <span className="text-xs text-gray-400 line-through ml-1">₹{d.price}</span>}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="bg-white rounded-2xl p-4 border flex justify-between items-center">
            <span className="font-semibold">Quantity</span>
            <div className="flex items-center gap-3">
              <button onClick={()=>setQty(Math.max(1,qty-1))} className="w-8 h-8 border rounded-lg">-</button>
              <span className="font-bold">{qty}</span>
              <button onClick={()=>setQty(qty+1)} className="w-8 h-8 border rounded-lg">+</button>
            </div>
          </div>
          {step>=1 && (
            <div className="bg-white rounded-2xl p-4 border space-y-2">
              <h3 className="font-semibold">Buyer Details</h3>
              {['name','phone','telegram','email'].map(k=>(
                <input key={k} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border text-sm" required />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            {['upi','binance'].map(m=>(
              <button key={m} onClick={()=>setPaymentMethod(m)}
                className={`w-full p-3 rounded-xl border-2 mb-2 text-left ${paymentMethod===m?'border-orange-400 bg-orange-50':''}`}>
                <p className="font-bold uppercase">{m}</p>
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 border text-sm space-y-1">
            <div className="flex justify-between"><span>{product.name} - {duration?.label}</span><span>₹{unitPrice}</span></div>
            <div className="flex justify-between"><span>Qty</span><span>{qty}x</span></div>
            {discount>0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span className="text-orange-600">₹{total}</span></div>
          </div>
          {step===1 && (
            <button onClick={()=>{ if(!form.name||!form.email) return alert('Fill details'); setStep(2) }}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl">Proceed to Payment →</button>
          )}
          {step===2 && (
            <div className="bg-white rounded-2xl p-4 border space-y-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-sm">Pay ₹{total} to</p>
                <p className="text-xl font-bold text-orange-600 select-all">
                  {paymentMethod==='upi' ? (settings.upiId||'sajan@upi') : (settings.binanceId||'sajanbinance')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Screenshot *</label>
                <input type="file" accept="image/*" onChange={onFile} className="mt-1 w-full text-sm"/>
                {ss && <img src={ss} className="mt-2 max-h-32 rounded border"/>}
              </div>
              <input placeholder="Your UPI / Txn ID *" value={upiId} onChange={e=>setUpiId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm"/>
              <button onClick={submit} disabled={loading} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl">
                {loading?'Submitting...':'Submit Order'}
              </button>
              <button onClick={()=>setStep(1)} className="w-full text-sm text-gray-500">← Back</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
