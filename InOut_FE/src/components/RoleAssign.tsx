import { useEffect, useState } from 'react'
import api from '../api/axios'

type Props = { userId: string, currentRoles?: string[], onSaved?: () => void }

export default function RoleAssign({ userId, currentRoles = [], onSaved }: Props) {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [selected, setSelected] = useState<string[]>(currentRoles)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const r = await api.get('/api/roles')
      setRoles(r.data)
    })()
  }, [])

  const toggle = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name])
  }

  const save = async () => {
    setLoading(true)
    try {
      await api.put(`/api/users/${userId}/roles`, selected) // backend should accept array
      onSaved?.()
    } catch (e) {
      console.log(e);
      alert('Lưu role thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {roles.map(r => (
          <label key={r.id} className="flex items-center gap-2 p-2 border rounded">
            <input type="checkbox" checked={selected.includes(r.name)} onChange={() => toggle(r.name)} />
            <span className="ml-2">{r.name}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-3">
        <button onClick={save} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
      </div>
    </div>
  )
}
