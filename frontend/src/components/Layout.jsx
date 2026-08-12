import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Package, User, LogOut, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <Link to="/" className="font-extrabold text-xl tracking-tight flex items-center gap-2">
            <span className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center text-sm">S</span>
            Sajan Store
          </Link>

          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                {user.isReseller && (
                  <span className="bg-yellow-400 text-yellow-900 text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide">
                    RESELLER
                  </span>
                )}
                <Link to="/my-orders" className="hover:bg-white/15 px-3 py-1.5 rounded-full transition">
                  {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-white/20 rounded-full transition active:scale-90"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-white/20 hover:bg-white/30 active:scale-95 px-4 py-1.5 rounded-full font-semibold transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-orange-100 flex justify-around py-2 sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/my-orders', icon: Package, label: 'Orders' },
          { to: '/reseller', icon: Crown, label: 'Reseller' },
          { to: user ? '/my-orders' : '/login', icon: User, label: 'Account' },
        ].map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={label}
              to={to}
              className={`nav-item flex flex-col items-center text-[11px] gap-0.5 relative px-3 py-1 ${
                active ? 'text-orange-500 font-semibold' : 'text-gray-400'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 w-8 h-1 bg-orange-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
