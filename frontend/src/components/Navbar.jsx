import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/products', label: 'Products' },
  { path: '/customers', label: 'Customers' },
  { path: '/orders', label: 'Orders' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-56 bg-indigo-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-indigo-700">
        <p className="text-lg font-bold tracking-tight">Inventory</p>
        <p className="text-indigo-400 text-xs mt-0.5">Management System</p>
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === path
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
