"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      firstName: formData.get("first-name"),
      lastName: formData.get("last-name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      institution: formData.get("institution"),
      purpose: formData.get("purpose"),
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        router.push("/docking")
      } else {
        router.push("/login")
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Error submitting form")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 overflow-visible">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" name="first-name" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" name="last-name" placeholder="Doe" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="researcher@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Position</Label>
              <div className="relative z-10">
                <Select onValueChange={(val) => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white">
                    <SelectItem value="researcher">Research Scientist</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                    <SelectItem value="student">Graduate Student</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="role" value={role} />
              </div>

              <input type="hidden" name="role" value={role} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">Institution/Organization</Label>
              <Input id="institution" name="institution" placeholder="University or Research Center" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Research Purpose</Label>
              <Textarea
                id="purpose"
                name="purpose"
                placeholder="Briefly describe your research goals related to dengue cure"
                className="min-h-[100px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
