import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { deviceSchema, type DeviceFormType } from '../schemas'
import api from '../api/axios'

type Props = { initial?: Partial<DeviceFormType> & { id?: string }, onSuccess?: () => void }

export default function DeviceForm({ initial = {}, onSuccess }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: { name: initial.name || '', type: (initial as any).type || 'Door', areaId: (initial as any).areaId || '' }
  })

  const [areas, setAreas] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const r = await api.get('/api/areas')
      setAreas(r.data)
    })()
  }, [])

  const onSubmit = async (values: DeviceFormType) => {
    try {
      if ((initial as any).id) await api.put(`/api/devices/${(initial as any).id}`, values)
      else await api.post('/api/devices', values)
      onSuccess?.()
    } catch {
      alert('Lỗi khi lưu device')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm">Tên thiết bị</label>
        <input {...register('name')} className="w-full border p-2 rounded" />
        {errors.name && <div className="text-sm text-red-600">{errors.name.message}</div>}
      </div>

      <div>
        <label className="block text-sm">Loại</label>
        <select {...register('type')} className="w-full border p-2 rounded">
          <option value="Door">Door</option>
          <option value="Barrier">Barrier</option>
          <option value="RFIDReader">RFIDReader</option>
          <option value="Camera">Camera</option>
        </select>
      </div>

      <div>
        <label className="block text-sm">Area</label>
        <select {...register('areaId')} className="w-full border p-2 rounded">
          <option value="">-- Chọn khu vực --</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
        </select>
        {errors.areaId && <div className="text-sm text-red-600">{errors.areaId.message}</div>}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded">Lưu</button>
      </div>
    </form>
  )
}
