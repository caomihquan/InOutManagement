import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

async function fetchLogs() {
  const r = await api.get('/api/access-logs')
  return r.data
}

export default function AccessLogs() {
  const { data, isLoading } = useQuery({
      queryKey: ['access-logs'],
      queryFn: fetchLogs
  })
  return (
    <div>
      <h3 className="text-xl mb-4">Access Logs</h3>
      {isLoading ? <div>Loading...</div> : (
        <table className="w-full bg-white rounded shadow">
          <thead><tr><th className="p-2">Time</th><th className="p-2">User</th><th className="p-2">Device</th><th className="p-2">Result</th></tr></thead>
          <tbody>
            {data?.map((l: any) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{new Date(l.eventTime).toLocaleString()}</td>
                <td className="p-2">{l.userId}</td>
                <td className="p-2">{l.deviceId}</td>
                <td className="p-2">{l.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
