import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Settings, Tag, LogOut } from 'lucide-react'

export default function AdminNav() {
  const loc = useLocation()
  const nav = useNavigate()
  const links = [
    { to:'/admin/dashboard', icon:LayoutDashboard, label:'Dash' },
    { to:'/admin/orders', icon:ShoppingBag, label:'Orders' },
    { to:'/admin/products', icon:Package, label:'Products' },
    { to:'/admin/sale', icon:Tag, label:'Sale' },
    { to:'/admin/settings', icon:Settings, label:'Settings' },
  ]
  return (
    <div className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
        <span className="font-bold text-orange-600 text-sm">Sajan Admin</span>
        <div className="flex gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${loc.pathname===l.to?'bg-orange-100 text-orange-700':'text-gray-600'}`}>
              <l.icon size={14}/> {l.label}
            </Link>
          ))}
          <button onClick={()=>{localStorage.removeItem('sajan_token');nav('/admin')}} className="p-1 text-red-500"><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  )
}
