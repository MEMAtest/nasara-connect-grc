'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Shield, FileText, Link as LinkIcon, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Control {
  id: string
  title: string
  description: string
  regulation: string
  status: 'implemented' | 'in-progress' | 'not-started'
  completeness: number
  evidence: number
}

interface Regulation {
  id: string
  name: string
  abbr: string
  controls: number
  completeness: number
  color: string
}

const mockRegulations: Regulation[] = [
  { id: 'fca', name: 'FCA Principles', abbr: 'FCA', controls: 24, completeness: 92, color: 'blue' },
  { id: 'aml', name: 'AML Regulations', abbr: 'AML', controls: 18, completeness: 87, color: 'purple' },
  { id: 'gdpr', name: 'Data Protection', abbr: 'GDPR', controls: 15, completeness: 95, color: 'green' },
  { id: 'mifid', name: 'MiFID II', abbr: 'MiFID', controls: 12, completeness: 78, color: 'orange' },
]

const mockControls: Control[] = [
  { id: 'C-001', title: 'Customer Due Diligence', description: 'Enhanced KYC procedures for high-risk customers', regulation: 'AML', status: 'implemented', completeness: 100, evidence: 8 },
  { id: 'C-002', title: 'Transaction Monitoring', description: 'Real-time monitoring of suspicious transactions', regulation: 'AML', status: 'implemented', completeness: 95, evidence: 12 },
  { id: 'C-003', title: 'Data Access Controls', description: 'Role-based access to customer data', regulation: 'GDPR', status: 'implemented', completeness: 100, evidence: 6 },
  { id: 'C-004', title: 'Best Execution Policy', description: 'Documentation of trade execution quality', regulation: 'MiFID', status: 'in-progress', completeness: 65, evidence: 3 },
  { id: 'C-005', title: 'Governance Framework', description: 'Board oversight and accountability structure', regulation: 'FCA', status: 'implemented', completeness: 90, evidence: 15 },
]

export default function ControlFrameworkDemo() {
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation>(mockRegulations[0])
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)

  const getStatusIcon = (status: Control['status']) => {
    switch (status) {
      case 'implemented': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in-progress': return <Circle className="w-5 h-5 text-amber-600" fill="currentColor" fillOpacity={0.3} />
      case 'not-started': return <Circle className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: Control['status']) => {
    switch (status) {
      case 'implemented': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
      case 'not-started': return 'bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
    }
  }

  const getRegulationColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-rose-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Regulation Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {mockRegulations.map((reg, i) => (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedRegulation(reg)}
            className="cursor-pointer"
          >
            <Card className={`p-4 hover:shadow-lg transition-all border-2 ${selectedRegulation.id === reg.id ? 'border-teal-500' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRegulationColor(reg.color)} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                {reg.abbr}
              </div>
              <h4 className="font-semibold mb-2">{reg.name}</h4>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>{reg.controls} controls</span>
                <span className="font-semibold text-teal-600">{reg.completeness}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reg.completeness}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full bg-gradient-to-r ${getRegulationColor(reg.color)}`}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Control Mapping View */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-2 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">{selectedRegulation.name} Controls</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mapped controls and implementation status
            </p>
          </div>
          <Badge className={`bg-gradient-to-r ${getRegulationColor(selectedRegulation.color)} text-white`}>
            {selectedRegulation.controls} Controls
          </Badge>
        </div>

        <div className="space-y-3">
          {mockControls
            .filter(c => c.regulation === selectedRegulation.abbr || selectedRegulation.id === 'fca')
            .slice(0, 4)
            .map((control, i) => (
            <motion.div
              key={control.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedControl(control)}
              className="p-4 rounded-lg border-2 hover:border-teal-500 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(control.status)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{control.id}</span>
                        <Badge variant="outline" className="text-xs">{control.regulation}</Badge>
                      </div>
                      <h4 className="font-semibold">{control.title}</h4>
                    </div>
                    <Badge className={getStatusColor(control.status)}>
                      {control.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {control.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${control.completeness}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
                        />
                      </div>
                      <span className="font-medium">{control.completeness}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <FileText className="w-4 h-4" />
                      <span>{control.evidence} evidence</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <LinkIcon className="w-4 h-4" />
                      <span>3 requirements</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-4">
          View All {selectedRegulation.controls} Controls
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </Card>

      {/* Control Detail Panel */}
      {selectedControl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{selectedControl.id}</span>
                  <Badge variant="outline">{selectedControl.regulation}</Badge>
                  <Badge className={getStatusColor(selectedControl.status)}>
                    {selectedControl.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedControl.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{selectedControl.description}</p>
              </div>
              {getStatusIcon(selectedControl.status)}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Implementation Progress</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{selectedControl.completeness}%</span>
                  <span className="text-slate-600 dark:text-slate-400">complete</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
                    style={{ width: `${selectedControl.completeness}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Evidence Documents</p>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-8 h-8 text-teal-600" />
                  <span className="text-3xl font-bold">{selectedControl.evidence}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Policies', 'Procedures', 'Test Results'].map(doc => (
                    <Badge key={doc} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-teal-600" />
                <h4 className="font-semibold">Regulatory Requirements Mapped</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Principle 3: Management and control',
                  'SYSC 4: Management and control systems',
                  'COBS 2: Conduct of business obligations'
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Controls</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-3xl font-bold">69</span>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Implemented</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-3xl font-bold text-green-600">62</span>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Overall Progress</span>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-500 to-teal-600" />
          </div>
          <span className="text-3xl font-bold text-teal-600">90%</span>
        </Card>
      </div>
    </div>
  )
}
