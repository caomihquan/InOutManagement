import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-lg font-medium">Dashboard</div>
      <div className="flex items-center gap-4">
        <div>{user?.userName}</div>
        <button onClick={() => logout()} className="text-sm px-3 py-1 border rounded">Logout</button>
      </div>
    </header>
  )
}
