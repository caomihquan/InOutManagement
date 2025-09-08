import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UsersList from './pages/users/UsersList'
import AreasList from './pages/areas/AreasList'
import AccessLogs from './pages/access-logs/AccessLogs'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<UsersList />} />
        <Route path="areas" element={<AreasList />} />
        <Route path="access-logs" element={<AccessLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
