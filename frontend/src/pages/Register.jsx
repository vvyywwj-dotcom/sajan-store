import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', telegram:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      await register(form)
      navigate('/')
    } catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-bold text-center mb-4">Create Account</h1>
      <form onSubmit={submit} className="space-y-3">
        {['name','email','password','phone','telegram'].map(k => (
          <input key={k} type={k==='password'?'password':k==='email'?'email':'text'}
            placeholder={k.charAt(0).toUpperCase()+k.slice(1)} required={['name','email','password'].includes(k)}
            value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border text-sm" />
        ))}
        {err && <p className="text-red-500 text-sm">{err}</p>}
        <button disabled={loading} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl">
          {loading ? '...' : 'Register'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have account? <Link to="/login" className="text-orange-600 font-medium">Login</Link>
      </p>
    </div>
  )
}
