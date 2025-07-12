"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, LogOut } from "lucide-react"
import { useUser } from "@/lib/user-context"

export function DashboardNav() {
  const { user, isLoading, logout } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  if (isLoading) return null

  const isAdmin = user?.role.toLowerCase() === "admin"

  const userNavItems = [
    {
      title: "Results",
      href: "/results",
      icon: FileText,
    },
  ]

  const adminNavItems = [
    {
      title: "placeholder",
      href: "/results",
      icon: FileText,
    },
  ]

  console.log("User role:", user?.role) // Debugging line

  const navItems =
    isAdmin ? adminNavItems : userNavItems

  const handleLogout = async () => {
    try {
      await logout() // handles API + clears user context
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
