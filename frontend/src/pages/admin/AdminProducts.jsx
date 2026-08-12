import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNav from '../../components/AdminNav'
import { useAuth } from '../../context/AuthContext'
import { productsApi } from '../../api/client'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'

export default function AdminProducts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [show, setShow] = useState(false)

  const load = () => productsApi.list().then(d => setProducts(d.products||[])).catch(console.error)

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/admin'); return }
    load()
  }, [user, navigate])

  const empty = { name:'', description:'', image:'', category:'iOS', badge:'iOS', sold:0, durations:[{ label:'1 day', price:100, keys:[] }] }

  const onImage = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setEditing(ed => ({ ...ed, image: r.result }))
    r.readAsDataURL(f)
  }

  const save = async () => {
    if (!editing.name) return alert('Name required')
    try {
      if (editing._id) await productsApi.update(editing._id, editing)
      else await productsApi.create(editing)
      setShow(false); setEditing(null); load()
    } catch (e) { alert(e.message) }
  }

  const del = async (id) => {
    if (!confirm('Delete?')) return
    await productsApi.remove(id); load()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <button onClick={()=>{setEditing({...empty});setShow(true)}} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1"><Plus size={16}/> Add</button>
        </div>
        <div className="space-y-2">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl p-3 border flex items-center gap-3">
              {p.image ? <img src={p.image} className="w-12 h-12 rounded-lg object-cover"/> : <div className="w-12 h-12 bg-gray-100 rounded-lg"/>}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{p.durations?.length} durations • {p.durations?.reduce((s,d)=>s+(d.keys?.length||0),0)} keys</p>
              </div>
              <button onClick={()=>{setEditing(JSON.parse(JSON.stringify(p)));setShow(true)}} className="p-2 text-blue-500"><Edit size={16}/></button>
              <button onClick={()=>del(p._id)} className="p-2 text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>

      {show && editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl my-6 shadow-xl">
            <div className="flex justify-between p-4 border-b">
              <h2 className="font-bold">{editing._id?'Edit':'Add'} Product</h2>
              <button onClick={()=>setShow(false)}><X size={20}/></button>
            </div>
            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <input placeholder="Name" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm"/>
              <input placeholder="Description" value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm"/>
              <input placeholder="Category / Badge" value={editing.badge} onChange={e=>setEditing({...editing,badge:e.target.value,category:e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm"/>
              <div>
                <label className="text-xs text-gray-500">Image (from gallery)</label>
                <input type="file" accept="image/*" onChange={onImage} className="w-full text-sm mt-1"/>
                {editing.image && <img src={editing.image} className="mt-2 h-24 rounded object-cover"/>}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-sm">Validities & Keys</h3>
                  <button onClick={()=>setEditing({...editing,durations:[...editing.durations,{label:'7 days',price:500,keys:[]}]})} className="text-orange-600 text-sm">+ Add</button>
                </div>
                {editing.durations.map((d,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-1">
                    <div className="flex gap-2">
                      <input value={d.label} onChange={e=>{const ds=[...editing.durations];ds[i]={...d,label:e.target.value};setEditing({...editing,durations:ds})}} className="flex-1 px-2 py-1.5 rounded border text-sm" placeholder="7 days"/>
                      <input type="number" value={d.price} onChange={e=>{const ds=[...editing.durations];ds[i]={...d,price:Number(e.target.value)};setEditing({...editing,durations:ds})}} className="w-24 px-2 py-1.5 rounded border text-sm" placeholder="Price"/>
                      <button onClick={()=>setEditing({...editing,durations:editing.durations.filter((_,j)=>j!==i)})} className="text-red-400"><Trash2 size={14}/></button>
                    </div>
                    <textarea value={(d.keys||[]).join('\n')} onChange={e=>{const keys=e.target.value.split('\n').map(k=>k.trim()).filter(Boolean);const ds=[...editing.durations];ds[i]={...d,keys};setEditing({...editing,durations:ds})}}
                      rows={2} className="w-full px-2 py-1.5 rounded border text-sm font-mono" placeholder="KEY1&#10;KEY2"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button onClick={save} className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"><Save size={16}/> Save</button>
              <button onClick={()=>setShow(false)} className="px-4 py-2.5 border rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
