"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package, Wrench, Building2, Calendar, Settings } from "lucide-react"

const navigationItems = [
  { href: "/", label: "Dashboard", icon: TrendingUp },
  { href: "/equipment", label: "Equipment", icon: Package },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/reports", label: "Reports", icon: TrendingUp },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ME-AIR</h1>
              <Badge variant="secondary" className="text-xs">
                Equipment Maintenance System
              </Badge>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
