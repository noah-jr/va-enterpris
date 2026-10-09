import { Outlet } from 'react-router'
import { TopHeader } from './TopHeader'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-zinc-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* 1. Top Auxiliary Bar */}
      <TopHeader />

      {/* 2. Main Navigation Bar */}
      <Navbar />

      {/* 3. Main Router Outlet */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* 4. Institutional Footer */}
      <Footer />
    </div>
  )
}
