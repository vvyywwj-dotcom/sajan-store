import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const u = await login(email, password)
      navigate(u.isAdmin ? '/admin/dashboard' : '/')
    } catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-bold text-center mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl border text-sm" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required
          className="w-full px-3 py-2.5 rounded-xl border text-sm" />
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl">
          {loading ? '...' : 'Login'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        New user? <Link to="/register" className="text-orange-600 font-medium">Register</Link>
      </p>
    </div>
  )
}
