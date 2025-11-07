'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, FileCheck, Users, Building, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'pending'
  progress: number
  items: {
    name: string
    completed: boolean
  }[]
}

const mockAuthSteps: AuthStep[] = [
  {
    id: 'step-1',
    title: 'Threshold Conditions',
    description: 'Legal entity, location, and regulatory scope',
    status: 'completed',
    progress: 100,
    items: [
      { name: 'Legal entity formation', completed: true },
      { name: 'Business plan documentation', completed: true },
      { name: 'Capital adequacy requirements', completed: true },
      { name: 'Location and premises', completed: true }
    ]
  },
  {
    id: 'step-2',
    title: 'Governance & People',
    description: 'Senior management, organizational structure',
    status: 'in-progress',
    progress: 75,
    items: [
      { name: 'Board composition', completed: true },
      { name: 'Senior management CVs', completed: true },
      { name: 'Fitness & propriety assessments', completed: true },
      { name: 'Governance framework', completed: false }
    ]
  },
  {
    id: 'step-3',
    title: 'Risk & Compliance',
    description: 'Risk frameworks, AML/CTF policies',
    status: 'in-progress',
    progress: 60,
    items: [
      { name: 'Risk management framework', completed: true },
      { name: 'AML/CTF policies', completed: true },
      { name: 'Compliance monitoring plan', completed: false },
      { name: 'Outsourcing arrangements', completed: false }
    ]
  },
  {
    id: 'step-4',
    title: 'Systems & Controls',
    description: 'Technology, operations, and security',
    status: 'pending',
    progress: 30,
    items: [
      { name: 'IT infrastructure documentation', completed: true },
      { name: 'Data protection & cybersecurity', completed: false },
      { name: 'Business continuity plan', completed: false },
      { name: 'Financial crime controls', completed: false }
    ]
  },
  {
    id: 'step-5',
    title: 'Financial Resources',
    description: 'Capital, projections, and stress testing',
    status: 'pending',
    progress: 15,
    items: [
      { name: 'Financial projections', completed: false },
      { name: 'Capital adequacy assessment', completed: false },
      { name: 'Stress testing scenarios', completed: false },
      { name: 'Recovery & resolution', completed: false }
    ]
  }
]

export default function AuthPackDemo() {
  const [selectedStep, setSelectedStep] = useState<AuthStep>(mockAuthSteps[1])

  const getStatusIcon = (status: AuthStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case 'in-progress': return <Clock className="w-6 h-6 text-amber-600" />
      case 'pending': return <Circle className="w-6 h-6 text-slate-400" />
    }
  }

  const overallProgress = Math.round(mockAuthSteps.reduce((sum, step) => sum + step.progress, 0) / mockAuthSteps.length)
  const completedSteps = mockAuthSteps.filter(s => s.status === 'completed').length
  const totalItems = mockAuthSteps.reduce((sum, step) => sum + step.items.length, 0)
  const completedItems = mockAuthSteps.reduce((sum, step) => sum + step.items.filter(i => i.completed).length, 0)

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">FCA Authorization Journey</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Track your progress through the authorization pack
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-600 mb-1">{overallProgress}%</div>
            <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              On Track
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
            <span className="font-medium">{completedItems} of {totalItems} items complete</span>
          </div>
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: FileCheck, label: 'Steps Complete', value: `${completedSteps}/5`, color: 'text-green-600' },
            { icon: Clock, label: 'In Progress', value: '2', color: 'text-amber-600' },
            { icon: Users, label: 'Team Members', value: '8', color: 'text-blue-600' },
            { icon: TrendingUp, label: 'Days to Submit', value: '14', color: 'text-purple-600' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-4 rounded-lg bg-white dark:bg-slate-800"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Authorization Steps Timeline */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-2 shadow-xl">
        <h3 className="text-xl font-semibold mb-6">Authorization Steps</h3>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

          <div className="space-y-6">
            {mockAuthSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedStep(step)}
                className={`relative pl-16 cursor-pointer group ${
                  selectedStep.id === step.id ? '' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute left-3 top-1">
                  <div className="relative">
                    {getStatusIcon(step.status)}
                    {step.status === 'in-progress' && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-amber-400 rounded-full"
                      />
                    )}
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStep.id === step.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{step.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        step.status === 'completed'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                          : step.status === 'in-progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400'
                      }`}
                    >
                      {step.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.progress}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{step.progress}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Step Details */}
      {selectedStep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-white dark:bg-slate-900 border-2 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedStep.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{selectedStep.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 mb-1">{selectedStep.progress}%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedStep.items.filter(i => i.completed).length} of {selectedStep.items.length} complete
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold mb-3">Required Items</h4>
              {selectedStep.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.completed
                      ? 'bg-green-50 dark:bg-green-950/20'
                      : 'bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={`flex-1 ${item.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {item.name}
                  </span>
                  {!item.completed && (
                    <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700">
                      Start
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold mb-1">Regulatory Guidance</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    The FCA expects firms to demonstrate robust governance arrangements that are appropriate
                    for the nature, scale and complexity of the business. Documentation should clearly show
                    how senior management will oversee and control the firm.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Timeline Estimate */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold mb-2">Estimated Timeline</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Based on your current progress, you&apos;re on track to submit in 14 days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">14</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">days remaining</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
