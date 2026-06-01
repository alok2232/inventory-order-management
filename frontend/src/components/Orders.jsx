import { useState, useEffect } from 'react'
import { ordersApi, customersApi, productsApi } from '../api'
import { Modal, Field, Alert, EmptyRow } from './shared'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: '1' }] })
  const [formError, setFormError] = useState(null)

  const flash = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const fetchOrders = async () => {
    try {
      const res = await ordersApi.getAll()
      setOrders(res.data)
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const openCreate = async () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: '1' }] })
    setFormError(null)
    const [cRes, pRes] = await Promise.all([customersApi.getAll(), productsApi.getAll()])
    setCustomers(cRes.data)
    setProducts(pRes.data)
    setCreateOpen(true)
  }

  const updateItem = (idx, field, value) => {
    const updated = [...form.items]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, items: updated })
  }

  const addItem = () =>
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: '1' }] })

  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const estimatedTotal = () =>
    form.items.reduce((sum, item) => {
      const p = products.find((p) => String(p.id) === String(item.product_id))
      if (!p || !item.quantity) return sum
      return sum + p.price * Number(item.quantity)
    }, 0)

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.customer_id) {
      setFormError('Please select a customer')
      return
    }
    const validItems = form.items.filter((i) => i.product_id && Number(i.quantity) > 0)
    if (!validItems.length) {
      setFormError('Add at least one product with a valid quantity')
      return
    }
    try {
      await ordersApi.create({
        customer_id: parseInt(form.customer_id),
        items: validItems.map((i) => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity),
        })),
      })
      setCreateOpen(false)
      fetchOrders()
      flash('Order created successfully')
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create order')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return
    try {
      await ordersApi.delete(id)
      flash('Order cancelled and stock restored')
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order')
    }
  }

  if (loading) return <p className="p-4 text-gray-400">Loading...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button onClick={openCreate} className="btn-primary">+ Create Order</button>
      </div>

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <EmptyRow cols={6} message="No orders yet." />
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-gray-500 text-xs">#{o.id}</td>
                  <td className="px-6 py-3 font-medium">{o.customer.full_name}</td>
                  <td className="px-6 py-3 text-gray-500">{o.items.length}</td>
                  <td className="px-6 py-3 font-semibold">${o.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDetailOrder(o)}
                        className="px-3 py-1 text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 text-xs font-medium transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="px-3 py-1 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {createOpen && (
        <Modal title="Create Order" onClose={() => setCreateOpen(false)} wide>
          <form onSubmit={handleCreate} className="space-y-4">
            <Alert type="error" message={formError} />

            <Field label="Customer" required>
              <select
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} — {c.email}
                  </option>
                ))}
              </select>
            </Field>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                      className="input flex-1"
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} (Stock: {p.quantity}) — ${p.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="input w-20"
                      placeholder="Qty"
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-gray-400 hover:text-red-500 text-xl leading-none px-1"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Add another product
              </button>
            </div>

            <div className="bg-indigo-50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Estimated Total</span>
              <span className="text-lg font-bold text-indigo-700">
                ${estimatedTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Create Order</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <Modal title={`Order #${detailOrder.id}`} onClose={() => setDetailOrder(null)} wide>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-0.5">Customer</p>
                <p className="font-semibold">{detailOrder.customer.full_name}</p>
                <p className="text-gray-500">{detailOrder.customer.email}</p>
                <p className="text-gray-500">{detailOrder.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Order Date</p>
                <p className="font-semibold">
                  {new Date(detailOrder.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Product', 'Unit Price', 'Qty', 'Subtotal'].map((h) => (
                      <th key={h} className="text-left px-4 py-2 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{item.product.name}</td>
                      <td className="px-4 py-2">${item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2 font-medium">
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-semibold text-gray-700">Total Amount</span>
              <span className="text-xl font-bold text-indigo-700">
                ${detailOrder.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
