import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAuth } from '../../context/AuthContext'
import { settingsApi } from '../../api/client'

export default function AdminSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [s, setS] = useState({})
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/admin'); return }
    settingsApi.get().then(setS).catch(console.error)
  }, [user, navigate])

  const save = async () => {
    try {
      await settingsApi.update(s)
      setMsg('Saved!'); setTimeout(()=>setMsg(''),2000)
    } catch (e) { alert(e.message) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        {msg && <div className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl mb-3 text-sm">{msg}</div>}
        <div className="bg-white rounded-2xl p-5 border space-y-3">
          {[
            ['storeName','Store Name'],
            ['upiId','UPI ID'],
            ['binanceId','Binance ID'],
            ['resellerPrice','Reseller Price (₹)'],
            ['resellerDiscountPercent','Reseller Discount %'],
          ].map(([k,label])=>(
            <div key={k}>
              <label className="text-xs text-gray-500">{label}</label>
              <input value={s[k]??''} onChange={e=>setS({...s,[k]: k.includes('Percent')||k.includes('Price')?Number(e.target.value):e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-xl border text-sm"/>
            </div>
          ))}
          <button onClick={save} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl">Save</button>
        </div>
      </div>
    </div>
  )
}
