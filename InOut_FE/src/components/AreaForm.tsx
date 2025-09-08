import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { areaSchema, type AreaFormType } from '../schemas'
import api from '../api/axios'

type Props = { initial?: Partial<AreaFormType> & { id?: string }, onSuccess?: () => void }

export default function AreaForm({ initial = {}, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(areaSchema),
    defaultValues: { name: initial.name || '', type: (initial as any).type || 'Room', parentId: (initial as any).parentId || null }
  })

  const onSubmit = async (values: AreaFormType) => {
    try {
      if ((initial as any).id) await api.put(`/api/areas/${(initial as any).id}`, values)
      else await api.post('/api/areas', values)
      onSuccess?.()
    } catch {
      alert('Lỗi khi lưu khu vực')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Tên</label>
        <input {...register('name')} className="w-full border p-2 rounded" />
        {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
      </div>

      <div>
        <label className="block text-sm">Loại</label>
        <select {...register('type')} className="w-full border p-2 rounded">
          <option value="Building">Building</option>
          <option value="Floor">Floor</option>
          <option value="Room">Room</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded">
          Lưu
        </button>
      </div>
    </form>
  )
}
