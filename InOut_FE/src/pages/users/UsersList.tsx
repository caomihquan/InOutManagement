import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import Modal from '../../components/Modal'
import UserForm from '../../components/UserForm'
import RoleAssign from '../../components/RoleAssign'

type UserDto = { id: string; userName: string; email: string; isActive: boolean; roles?: string[] }

async function fetchUsers() {
  const r = await api.get('/api/users'); return r.data as UserDto[]
}

export default function UsersList() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery(
  {
      queryKey:['users'],
      queryFn:fetchUsers
  })
  const [showCreate, setShowCreate] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

//   const createUser = useMutation({
//     mutationFn: (payload: { userName: string; email: string; password: string }) => 
//       api.post('/api/users', payload),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['users'] })
//     }
//   })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-xl font-semibold">Người dùng</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="px-3 py-1 bg-green-600 text-white rounded">Tạo user</button>
        </div>
      </div>

      {isLoading ? <div>Loading...</div> : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="text-left">
                <th className="p-2">UserName</th>
                <th className="p-2 hidden sm:table-cell">Email</th>
                <th className="p-2">Active</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.userName}</td>
                  <td className="p-2 hidden sm:table-cell">{u.email}</td>
                  <td className="p-2">{u.isActive ? 'Yes' : 'No'}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedUser(u)} className="px-2 py-1 border rounded text-sm">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h4 className="font-bold mb-3">Tạo user</h4>
          <UserForm mode="create" onSuccess={() => { qc.invalidateQueries({ queryKey: ['users'] }); setShowCreate(false) }} />
        </Modal>
      )}

      {selectedUser && (
        <Modal onClose={() => setSelectedUser(null)}>
          <div className="space-y-4">
            <h4 className="font-bold">Chỉnh sửa: {selectedUser.userName}</h4>
            <UserForm mode="edit" initial={selectedUser} onSuccess={() => { qc.invalidateQueries({ queryKey: ['users'] }); setSelectedUser(null) }} />
            <div>
              <h5 className="font-medium">Phân quyền</h5>
              <RoleAssign userId={selectedUser.id} currentRoles={selectedUser.roles ?? []} onSaved={() => qc.invalidateQueries({ queryKey: ['users'] })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
