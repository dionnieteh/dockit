"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, LogOut } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      title: "Results",
      href: "/dashboard/results",
      icon: FileText,
    }
  ]

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push('/login')
        // Optional: refresh the page to clear any client-side state
        router.refresh()
      } else {
        console.error('Logout failed')
        // Still redirect even if logout API fails (to clear client-side state)
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even on error
      router.push('/login')
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">MolecularDock</h2>
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
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}