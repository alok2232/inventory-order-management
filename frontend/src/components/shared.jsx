export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center px-6 py-4 border-b shrink-0">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

export function Alert({ type, message }) {
  if (!message) return null
  const styles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
  }
  return (
    <div className={`p-3 rounded-lg text-sm mb-4 ${styles[type]}`}>{message}</div>
  )
}

export function EmptyRow({ cols, message }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-10 text-center text-gray-400 text-sm">
        {message}
      </td>
    </tr>
  )
}
