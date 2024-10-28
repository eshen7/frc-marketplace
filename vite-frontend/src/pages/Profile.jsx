import React from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'

export default function UserProfile() {
  const [showPassword, setShowPassword] = React.useState(false)

  const user = {
    email: "john.doe@example.com",
    team: {
      number: 1234,
      name: "Robo Wizards"
    },
    mentorName: "Jane Smith",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    uuid: "550e8400-e29b-41d4-a716-446655440000",
    password: "••••••••••••"
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly />
            </div>
            <div>
              <Label htmlFor="team">Team</Label>
              <Input id="team" value={`${user.team.number} - ${user.team.name}`} readOnly />
            </div>
            <div>
              <Label htmlFor="mentor">Mentor Name</Label>
              <Input id="mentor" value={user.mentorName} readOnly />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={user.phoneNumber} readOnly />
            </div>
            <div>
              <Label htmlFor="address">Address/Region</Label>
              <Input id="address" value={user.address} readOnly />
            </div>
            <div>
              <Label htmlFor="uuid">UUID</Label>
              <Input id="uuid" value={user.uuid} readOnly />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  readOnly
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}