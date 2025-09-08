import React from 'react'

export default function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-lg rounded shadow p-4 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600">✕</button>
        {children}
      </div>
    </div>
  )
}
