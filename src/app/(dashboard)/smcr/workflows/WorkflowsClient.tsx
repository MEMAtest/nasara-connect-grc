"use client";

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Plus, Search } from 'lucide-react'

export function WorkflowsClient() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600 mt-1">Automate SM&CR processes and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMF Onboarding
            </CardTitle>
            <CardDescription>Complete onboarding process for Senior Management Function appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Estimated Duration:</span>
                <Badge variant="outline">90 days</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Steps:</span>
                <span>8 steps</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Use Template
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              CF Certification
            </CardTitle>
            <CardDescription>Annual certification process for Certification Functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Estimated Duration:</span>
                <Badge variant="outline">30 days</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Steps:</span>
                <span>6 steps</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Use Template
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              F&P Assessment
            </CardTitle>
            <CardDescription>Fitness and Propriety assessment workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Estimated Duration:</span>
                <Badge variant="outline">21 days</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Steps:</span>
                <span>5 steps</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              Use Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Active Workflows</CardTitle>
          <CardDescription>Currently running workflow instances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active workflows</p>
            <p className="text-sm">Workflows you create will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}