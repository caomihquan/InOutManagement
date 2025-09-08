import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

async function fetchAreas() {
  const r = await api.get('/api/areas')
  return r.data
}

export default function AreasList() {
  const { data, isLoading } = useQuery({
      queryKey: ['areas'],
      queryFn: fetchAreas
  })
  return (
    <div>
      <h3 className="text-xl mb-4">Areas (Building / Floor / Room)</h3>
      {isLoading ? <div>Loading...</div> : (
        <ul className="space-y-2">
          {data?.map((a: any) => (
            <li key={a.id} className="bg-white p-3 rounded shadow">{a.name} — {a.type}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
