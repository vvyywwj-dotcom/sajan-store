import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Package, User, LogOut, Crown } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-50 shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="font-bold text-xl">Sajan Store</Link>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                {user.isReseller && <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">RESELLER</span>}
                <Link to="/my-orders" className="hover:underline">{user.name}</Link>
                <button onClick={logout} className="p-1.5 hover:bg-white/20 rounded"><LogOut size={18}/></button>
              </>
            ) : (
              <Link to="/login" className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full font-medium">Login</Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6"><Outlet /></main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 sm:hidden z-50">
        <Link to="/" className="flex flex-col items-center text-xs text-orange-500 gap-0.5"><Home size={20}/>Home</Link>
        <Link to="/my-orders" className="flex flex-col items-center text-xs text-gray-400 gap-0.5"><Package size={20}/>Orders</Link>
        <Link to="/reseller" className="flex flex-col items-center text-xs text-gray-400 gap-0.5"><Crown size={20}/>Reseller</Link>
        <Link to={user ? '/my-orders' : '/login'} className="flex flex-col items-center text-xs text-gray-400 gap-0.5"><User size={20}/>Account</Link>
      </nav>
    </div>
  )
}
