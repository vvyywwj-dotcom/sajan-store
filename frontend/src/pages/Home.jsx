import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi, settingsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [saleActive, setSaleActive] = useState(false)
  const [settings, setSettings] = useState({})
  const [filter, setFilter] = useState('All')
  const { user } = useAuth()

  useEffect(() => {
    productsApi.list().then(d => { setProducts(d.products||[]); setSaleActive(d.saleActive) }).catch(console.error)
    settingsApi.public().then(setSettings).catch(console.error)
  }, [])

  const cats = ['All', ...new Set(products.map(p => p.category || p.badge))]
  const filtered = filter==='All' ? products : products.filter(p => p.category===filter || p.badge===filter)

  const getPrice = (p) => {
    if (!p.durations?.length) return { min:0, max:0 }
    let prices = p.durations.map(d => d.price)
    if (saleActive && p.isOnSale && p.saleDiscountPercent) {
      prices = prices.map(pr => Math.round(pr * (1 - p.saleDiscountPercent/100)))
    }
    if (user?.isReseller && settings.resellerDiscountPercent) {
      prices = prices.map(pr => Math.round(pr * (1 - settings.resellerDiscountPercent/100)))
    }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }

  return (
    <div>
      {saleActive && (
        <div className="bg-red-500 text-white rounded-2xl p-4 mb-4 text-center font-bold animate-pulse">
          🔥 SALE IS LIVE — Limited time offers!
        </div>
      )}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-5 text-white mb-6">
        <h2 className="text-xl font-bold">Sajan Store</h2>
        <p className="text-sm opacity-90">Premium Keys • Instant after Approval</p>
        {!user?.isReseller && (
          <Link to="/reseller" className="inline-block mt-2 bg-white text-orange-600 text-sm font-bold px-3 py-1 rounded-full">
            Become Reseller ₹{settings.resellerPrice || 999}
          </Link>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {cats.map(c => (
          <button key={c} onClick={()=>setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter===c?'bg-orange-500 text-white':'bg-white border'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(p => {
          const {min,max} = getPrice(p)
          return (
            <Link key={p._id} to={`/checkout/${p._id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md">
              <div className="relative aspect-square bg-gray-100">
                {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>}
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">{p.badge||p.category}</span>
                {saleActive && p.isOnSale && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">SALE</span>}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                <p className="text-orange-600 font-bold text-sm">₹{min}{min!==max?` - ${max}`:''}</p>
                <p className="text-xs text-gray-400">{p.sold||0} Sold</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
