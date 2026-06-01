import { useState, useEffect } from 'react'
import { productsApi } from '../api'
import { Modal, Field, Alert, EmptyRow } from './shared'

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [modal, setModal] = useState({ open: false, mode: 'create', product: null })
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)

  const flash = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getAll()
      setProducts(res.data)
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setModal({ open: true, mode: 'create', product: null })
  }

  const openEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
    })
    setFormError(null)
    setModal({ open: true, mode: 'edit', product })
  }

  const closeModal = () => setModal({ open: false, mode: 'create', product: null })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    const data = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    }
    try {
      if (modal.mode === 'create') {
        await productsApi.create(data)
        flash('Product created successfully')
      } else {
        await productsApi.update(modal.product.id, data)
        flash('Product updated successfully')
      }
      closeModal()
      fetchProducts()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Operation failed')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await productsApi.delete(id)
      flash('Product deleted')
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product')
    }
  }

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'SKU', 'Price', 'Stock', 'Actions'].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <EmptyRow cols={5} message="No products yet. Add your first product." />
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-6 py-3">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : p.quantity < 10
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <Modal
          title={modal.mode === 'create' ? 'Add Product' : 'Edit Product'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert type="error" message={formError} />
            <Field label="Product Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="e.g. Wireless Mouse"
                required
              />
            </Field>
            <Field label="SKU / Code" required>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="input"
                placeholder="e.g. WM-001"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price ($)" required>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field label="Quantity in Stock" required>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="input"
                  placeholder="0"
                  required
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">
                {modal.mode === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
