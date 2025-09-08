import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema, type UserFormType } from '../schemas'
import api from '../api/axios'

type Props = {
  initial?: Partial<UserFormType> & { id?: string }
  onSuccess?: () => void
  mode?: 'create' | 'edit'
}

export default function UserForm({ initial = {}, onSuccess, mode = 'create' }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormType>({
    resolver: zodResolver(userSchema),
    defaultValues: { userName: initial.userName || '', email: initial.email || '', password: '' }
  })

  const onSubmit = async (values: UserFormType) => {
    try {
      if (mode === 'create') {
        await api.post('/api/users', values)
      } else {
        await api.put(`/api/users/${(initial as any).id}`, values)
      }
      onSuccess?.()
    } catch (err) {
      console.error(err)
      alert('Lỗi khi lưu user')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Tài khoản</label>
        <input {...register('userName')} className="w-full border p-2 rounded" />
        {errors.userName && <div className="text-sm text-red-600">{errors.userName.message}</div>}
      </div>

      <div>
        <label className="block text-sm">Email</label>
        <input {...register('email')} className="w-full border p-2 rounded" />
        {errors.email && <div className="text-sm text-red-600">{errors.email.message}</div>}
      </div>

      <div>
        <label className="block text-sm">Mật khẩu {mode === 'edit' && <span className="text-xs text-gray-500">(Để trống nếu không đổi)</span>}</label>
        <input {...register('password')} type="password" className="w-full border p-2 rounded" />
        {errors.password && <div className="text-sm text-red-600">{errors.password.message}</div>}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  )
}
