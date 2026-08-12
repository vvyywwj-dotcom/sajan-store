import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAuth } from '../../context/AuthContext'
import { productsApi, settingsApi } from '../../api/client'

export default function AdminSale() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [saleActive, setSaleActive] = useState(false)

  const load = async () => {
    const [p, s] = await Promise.all([productsApi.list(), settingsApi.public()])
    setProducts(p.products||[])
    setSaleActive(s.saleActive)
  }

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/admin'); return }
    load().catch(console.error)
  }, [user, navigate])

  const toggleSale = async () => {
    const next = !saleActive
    await settingsApi.toggleSale(next)
    setSaleActive(next)
  }

  const toggleProduct = async (p) => {
    const isOnSale = !p.isOnSale
    const saleDiscountPercent = isOnSale ? (p.saleDiscountPercent || 20) : 0
    await productsApi.setSale(p._id, { isOnSale, saleDiscountPercent })
    load()
  }

  const setDiscount = async (p, val) => {
    await productsApi.setSale(p._id, { isOnSale: p.isOnSale, saleDiscountPercent: Number(val) })
    load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Sale Management</h1>
        <div className="bg-white rounded-2xl p-5 border mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Global Sale Status</p>
            <p className="text-sm text-gray-500">{saleActive ? 'Sale is LIVE' : 'Sale is OFF'}</p>
          </div>
          <button onClick={toggleSale} className={`px-6 py-2.5 rounded-xl font-bold text-white ${saleActive?'bg-red-500':'bg-emerald-500'}`}>
            {saleActive ? 'Stop Sale' : 'Start Sale'}
          </button>
        </div>
        <h2 className="font-semibold mb-3">Add / Remove Products from Sale</h2>
        <div className="space-y-2">
          {products.map(p=>(
            <div key={p._id} className="bg-white rounded-xl p-3 border flex items-center gap-3">
              {p.image && <img src={p.image} className="w-10 h-10 rounded object-cover"/>}
              <div className="flex-1">
                <p className="font-medium text-sm">{p.name}</p>
                {p.isOnSale && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Discount %</span>
                    <input type="number" value={p.saleDiscountPercent||0} onChange={e=>setDiscount(p,e.target.value)}
                      className="w-16 px-2 py-0.5 border rounded text-sm"/>
                  </div>
                )}
              </div>
              <button onClick={()=>toggleProduct(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${p.isOnSale?'bg-red-100 text-red-600':'bg-emerald-100 text-emerald-700'}`}>
                {p.isOnSale ? 'Remove from Sale' : 'Add to Sale'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
