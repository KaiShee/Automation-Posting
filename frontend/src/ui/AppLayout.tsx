import { Outlet, Link } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 bg-neutral-900/60 backdrop-blur">
        <div className="container-narrow flex items-center justify-between h-14">
          <Link to="/" className="font-semibold tracking-tight">
            QR→Social Share
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/share" className="hover:text-white">Share</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </footer>
    </div>
  )
}



