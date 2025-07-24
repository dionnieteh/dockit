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
      title: "Start Docking",
      href: "/docking",
      icon: Atom,
    },
    {
      title: "Docking History",
      href: "/history",
      icon: FileText,
    },
  ]

  const adminNavItems = [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: UserRoundCog,
    },
    {
      title: "Start Docking",
      href: "/docking",
      icon: Atom,
    },
    {
      title: "Docking History",
      href: "/history",
      icon: FileText,
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
    <div className="flex h-full flex-col p-4 bg-[#183471]">
      <div className="py-2">
        <div className="m-4">
          <Link href="/" >
            <img
              src="/dockit-white.svg"
              alt="DockIt Logo"
              className="w-2/3"
            />
          </Link>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-4 py-2 text-sm text-white font-medium transition-colors hover:bg-primary hover:text-white",
                pathname === item.href ? " text-secondary bg-transparent" : "transparent",
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <Button variant="secondary" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
