"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Atom, FileText, LogOut, UserRoundCog } from "lucide-react"
import { useUser } from "@/lib/user-context"
import { UserRole } from "@/lib/user-role"

export function DashboardNav() {
  const { user, isLoading, logout } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  if (isLoading || !user) return null

  const isAdmin = user?.role === UserRole.ADMIN

  const userNavItems = [
    {
      title: "Docking History",
      href: "/results",
      icon: FileText,
    },
  ]

  const adminNavItems = [
    {
      title: "Start Docking",
      href: "/docking",
      icon: Atom,
    },
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: UserRoundCog,
    }
  ]

  console.log("User role:", user?.role)

  const navItems =
    isAdmin ? adminNavItems : userNavItems

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">DockIt</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
