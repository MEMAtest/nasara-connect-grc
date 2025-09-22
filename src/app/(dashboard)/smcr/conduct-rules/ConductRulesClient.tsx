"use client";

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Target, Plus, Search, AlertTriangle, Eye } from 'lucide-react'

export function ConductRulesClient() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Conduct Rules & Breaches</h1>
          <p className="text-gray-600 mt-1">Monitor conduct rules compliance and manage breaches</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Breach
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Breaches</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Quarter</p>
                <p className="text-2xl font-bold text-amber-600">3</p>
              </div>
              <Target className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">6</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conduct rules and breaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conduct Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Individual Conduct Rules</CardTitle>
            <CardDescription>Rules applicable to all SM&CR personnel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Individual Conduct Rule 1</span>
                  <Badge variant="outline">Rule 1</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must act with integrity
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Individual Conduct Rule 2</span>
                  <Badge variant="outline">Rule 2</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must act with due care, skill and diligence
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Individual Conduct Rule 3</span>
                  <Badge variant="outline">Rule 3</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must be open and cooperative with the FCA, PRA and other regulators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senior Manager Conduct Rules</CardTitle>
            <CardDescription>Additional rules for Senior Managers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Senior Manager Conduct Rule 1</span>
                  <Badge variant="outline">SC1</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must take reasonable steps to ensure the business is controlled effectively
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Senior Manager Conduct Rule 2</span>
                  <Badge variant="outline">SC2</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must take reasonable steps to ensure the business complies with relevant requirements
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Senior Manager Conduct Rule 3</span>
                  <Badge variant="outline">SC3</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  You must take reasonable steps to ensure any delegation is to an appropriate person
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Breaches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Breaches</CardTitle>
          <CardDescription>Latest conduct rule breach reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent breaches</p>
            <p className="text-sm">Breach reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}