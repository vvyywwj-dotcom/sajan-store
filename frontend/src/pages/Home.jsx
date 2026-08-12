import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi, settingsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [products, setProducts] = useState([])
  const [saleActive, setSaleActive] = useState(false)
  const [settings, setSettings] = useState({})
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([
      productsApi.list().then(d => {
        setProducts(d.products || [])
        setSaleActive(d.saleActive)
      }),
      settingsApi.public().then(setSettings)
    ])
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cats = ['All', ...new Set(products.map(p => p.category || p.badge).filter(Boolean))]
  const filtered = filter === 'All'
    ? products
    : products.filter(p => p.category === filter || p.badge === filter)

  const getPrice = (p) => {
    if (!p.durations?.length) return { min: 0, max: 0 }
    let prices = p.durations.map(d => d.price)
    if (saleActive && p.isOnSale && p.saleDiscountPercent) {
      prices = prices.map(pr => Math.round(pr * (1 - p.saleDiscountPercent / 100)))
    }
    if (user?.isReseller && settings.resellerDiscountPercent) {
      prices = prices.map(pr => Math.round(pr * (1 - settings.resellerDiscountPercent / 100)))
    }
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div>
      {/* Sale Banner */}
      <AnimatePresence>
        {saleActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 mb-5 text-center font-bold shadow-lg shadow-red-500/30"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-40" />
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative z-10 inline-block"
            >
              🔥 SALE IS LIVE — Limited time offers!
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 rounded-3xl p-6 text-white mb-7 shadow-xl shadow-orange-500/25"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />

        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight">Sajan Store</h2>
          <p className="text-sm opacity-90 mt-1">Premium Keys • Instant after Approval</p>

          {!user?.isReseller && (
            <Link
              to="/reseller"
              className="inline-flex items-center gap-1.5 mt-4 bg-white text-orange-600 text-sm font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg active:scale-95 transition"
            >
              Become Reseller
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                ₹{settings.resellerPrice || 999}
              </span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`filter-pill px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
              filter === c
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(p => {
              const { min, max } = getPrice(p)
              return (
                <motion.div key={p._id} variants={item} layout>
                  <Link
                    to={`/checkout/${p._id}`}
                    className="product-card group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                          No Image
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                        {saleActive && p.isOnSale && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                            SALE
                          </span>
                        )}
                        <span className="ml-auto bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md">
                          {p.badge || p.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate group-hover:text-orange-600 transition">
                        {p.name}
                      </h3>
                      <p className="text-orange-600 font-bold text-sm mt-0.5">
                        ₹{min}{min !== max ? ` - ${max}` : ''}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {p.sold || 0} Sold
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-400"
        >
          <p className="text-lg">No products found</p>
        </motion.div>
      )}
    </div>
  )
}
