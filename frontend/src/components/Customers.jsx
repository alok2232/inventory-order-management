import { useState, useEffect } from 'react'
import { customersApi } from '../api'
import { Modal, Field, Alert, EmptyRow } from './shared'

const EMPTY_FORM = { full_name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)

  const flash = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const fetchCustomers = async () => {
    try {
      const res = await customersApi.getAll()
      setCustomers(res.data)
    } catch {
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    try {
      await customersApi.create({ ...form, full_name: form.full_name.trim() })
      setModalOpen(false)
      fetchCustomers()
      flash('Customer added successfully')
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create customer')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return
    try {
      await customersApi.delete(id)
      flash('Customer deleted')
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete customer')
    }
  }

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
        <button onClick={openModal} className="btn-primary">+ Add Customer</button>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Full Name', 'Email', 'Phone', 'Actions'].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <EmptyRow cols={4} message="No customers yet. Add your first customer." />
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{c.full_name}</td>
                  <td className="px-6 py-3 text-gray-500">{c.email}</td>
                  <td className="px-6 py-3 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title="Add Customer" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert type="error" message={formError} />
            <Field label="Full Name" required>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input"
                placeholder="e.g. Jane Smith"
                required
              />
            </Field>
            <Field label="Email Address" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="jane@example.com"
                required
              />
            </Field>
            <Field label="Phone Number" required>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="+1 555 000 0000"
                required
              />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Add Customer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
