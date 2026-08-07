import DashboardSidebar from '@/components/DashboardSidebar'
import DashboardMobileNav from '@/components/DashboardMobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink flex">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <DashboardMobileNav />
        {children}
      </div>
    </div>
  )
}