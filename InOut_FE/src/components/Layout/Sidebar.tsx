import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white shadow min-h-screen p-4">
      <h3 className="font-bold mb-4">InOut Admin</h3>
      <nav className="flex flex-col gap-2">
        <NavLink to="/users" className={({isActive}) => isActive ? 'font-semibold' : ''}>Users</NavLink>
        <NavLink to="/areas" className={({isActive}) => isActive ? 'font-semibold' : ''}>Areas</NavLink>
        <NavLink to="/access-logs" className={({isActive}) => isActive ? 'font-semibold' : ''}>Access Logs</NavLink>
      </nav>
    </aside>
  )
}
