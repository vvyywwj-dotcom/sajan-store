import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@sajanstore.com')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const u = await login(email, password)
      if (!u.isAdmin) { setErr('Not an admin account'); return }
      navigate('/admin/dashboard')
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-4">Admin Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm" placeholder="Email"/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm" placeholder="Password"/>
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl">Login</button>
        </form>
        <p className="text-xs text-center text-gray-400 mt-3">Default: admin@sajanstore.com / sajan123</p>
        <Link to="/" className="block text-center text-sm text-orange-500 mt-3">← Store</Link>
      </div>
    </div>
  )
}
