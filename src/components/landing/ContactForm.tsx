'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, Mail, Building, User, Phone } from 'lucide-react'

export default function ContactForm() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setShowForm(false)
      setFormData({ name: '', email: '', company: '', phone: '' })
    }, 3000)
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              className="bg-white text-teal-700 hover:bg-teal-50 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              Request Demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowForm(true)}
              className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-teal-700 text-lg px-8 py-6 rounded-xl backdrop-blur-sm transition-all"
            >
              Contact Sales
            </Button>
          </motion.div>
        ) : submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-teal-100">
              We&apos;ll be in touch within 24 hours to schedule your personalized demo.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Get Your Personalized Demo
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  See how Nasara Connect can transform your governance, risk, and compliance workflow
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Work Email *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Company Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Financial"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 20 1234 5678"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-lg py-6"
                  >
                    Request Demo
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                    className="w-full text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    No credit card required
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    30-minute demo
                  </Badge>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
