import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'

type Form = { userName: string; password: string }

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<Form>()

  const onSubmit = async (data: Form) => {
    try {
      await login(data.userName, data.password)
      navigate('/')
    } catch (e) {
      alert('Login failed')
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 shadow rounded w-96">
        <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
        <div className="mb-3">
          <label className="block text-sm">Tài khoản</label>
          <input {...register('userName', { required: true })} className="w-full border p-2 rounded" />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Mật khẩu</label>
          <input {...register('password', { required: true })} type="password" className="w-full border p-2 rounded" />
        </div>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
          {formState.isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
