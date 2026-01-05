'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Building2,
  Mail,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface FormData {
  name: string
  company: string
  email: string
  interest: string
  message: string
}

const steps = [
  { id: 1, title: "What's your name?", field: 'name', icon: User, placeholder: 'John Smith' },
  { id: 2, title: "What company are you from?", field: 'company', icon: Building2, placeholder: 'Acme Financial' },
  { id: 3, title: "What's your email?", field: 'email', icon: Mail, placeholder: 'john@acmefinancial.com' },
  { id: 4, title: "What are you most interested in?", field: 'interest', icon: Sparkles, type: 'select' },
  { id: 5, title: "Anything else you'd like to tell us?", field: 'message', icon: MessageSquare, type: 'textarea', placeholder: 'Tell us about your compliance challenges or goals...' },
]

const interestOptions = [
  { value: 'demo', label: 'Request a Demo', description: 'See Nasara Connect in action' },
  { value: 'compliance', label: 'Compliance Solutions', description: 'FCA authorization & regulatory compliance' },
  { value: 'risk', label: 'Risk Management', description: 'Risk assessment & monitoring tools' },
  { value: 'automation', label: 'Process Automation', description: 'Workflow automation & reconciliation' },
  { value: 'partnership', label: 'Partnership Inquiry', description: 'Explore partnership opportunities' },
  { value: 'other', label: 'Other', description: 'Something else entirely' },
]

export default function RequestDemoPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    interest: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepData = steps.find(s => s.id === currentStep)
  const progress = (currentStep / steps.length) * 100

  const isCurrentStepValid = () => {
    const field = currentStepData?.field as keyof FormData
    if (currentStep === 5) return true // Message is optional
    return formData[field]?.trim().length > 0
  }

  const handleNext = () => {
    if (currentStep < steps.length && isCurrentStepValid()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && currentStepData?.type !== 'textarea') {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-3">Thank you, {formData.name}!</h1>
          <p className="text-slate-400 mb-8">
            We&apos;ve received your demo request and will reach out at {formData.email} within 24 hours.
          </p>

          <Link href="/">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              Back to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/nasara-logo.png"
            alt="Nasara Connect"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </header>

      {/* Progress Bar */}
      <div className="px-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  {currentStepData && <currentStepData.icon className="w-6 h-6 text-emerald-400" />}
                </div>
                <span className="text-sm text-slate-500">Question {currentStep}</span>
              </div>

              {/* Question */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                {currentStepData?.title}
              </h1>

              {/* Input */}
              {currentStepData?.type === 'select' ? (
                <div className="grid gap-3">
                  {interestOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, interest: option.value }))
                        setTimeout(() => handleNext(), 300)
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        formData.interest === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-slate-400">{option.description}</div>
                        </div>
                        {formData.interest === option.value && (
                          <Check className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : currentStepData?.type === 'textarea' ? (
                <Textarea
                  value={formData[currentStepData.field as keyof FormData]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [currentStepData.field]: e.target.value }))}
                  placeholder={currentStepData.placeholder}
                  className="min-h-[150px] bg-slate-800/50 border-slate-700 text-white text-lg placeholder:text-slate-500 focus:border-emerald-500 resize-none"
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <Input
                  type={currentStepData?.field === 'email' ? 'email' : 'text'}
                  value={formData[currentStepData?.field as keyof FormData] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [currentStepData?.field || '']: e.target.value }))}
                  placeholder={currentStepData?.placeholder}
                  className="h-14 bg-slate-800/50 border-slate-700 text-white text-lg placeholder:text-slate-500 focus:border-emerald-500"
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              )}

              {/* Hint */}
              {currentStepData?.type !== 'select' && (
                <p className="text-sm text-slate-500 mt-3">
                  Press Enter to continue or use the buttons below
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Request Demo
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Link */}
      <footer className="p-6 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
          ← Back to Nasara Connect
        </Link>
      </footer>
    </div>
  )
}
