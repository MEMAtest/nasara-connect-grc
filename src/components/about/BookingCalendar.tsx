'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Video, MessageSquare, CheckCircle2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TimeSlot {
  time: string
  available: boolean
}

interface ConsultationType {
  id: string
  name: string
  duration: string
  icon: any
  description: string
  gradient: string
}

export default function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isBooked, setIsBooked] = useState(false)

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const consultationTypes: ConsultationType[] = [
    {
      id: 'intro',
      name: '30-Min Introduction',
      duration: '30 minutes',
      icon: MessageSquare,
      description: 'Quick intro to MEMA Connect and your needs',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'demo',
      name: 'Product Demo',
      duration: '60 minutes',
      icon: Video,
      description: 'Deep dive into platform features and use cases',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'consultation',
      name: 'Compliance Consultation',
      duration: '90 minutes',
      icon: Clock,
      description: 'Strategic discussion with compliance experts',
      gradient: 'from-purple-500 to-pink-600'
    }
  ]

  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '12:00 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:00 PM', available: false },
    { time: '05:00 PM', available: true },
  ]

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Only weekdays are available and must be in the future
    const dayOfWeek = date.getDay()
    return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6
  }

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const handleDateClick = (date: Date | null) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date)
      setSelectedTime(null)
      setIsBooked(false)
    }
  }

  const handleBooking = () => {
    if (selectedDate && selectedTime && selectedType) {
      setIsBooked(true)
    }
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <Card className="p-8 bg-slate-900/80 border-2 border-slate-800 backdrop-blur-xl overflow-hidden relative">
      {/* Gradient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Calendar */}
          <div className="lg:col-span-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToPreviousMonth}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goToNextMonth}
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  const available = isDateAvailable(date)
                  const selected = isDateSelected(date)
                  const isToday = date && date.toDateString() === new Date().toDateString()

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={!available}
                      whileHover={available ? { scale: 1.05 } : {}}
                      whileTap={available ? { scale: 0.95 } : {}}
                      className={`
                        aspect-square rounded-lg p-2 text-sm font-medium transition-all
                        ${!date ? 'invisible' : ''}
                        ${!available ? 'text-slate-700 cursor-not-allowed' : ''}
                        ${available && !selected ? 'text-slate-300 bg-slate-800/50 hover:bg-slate-700 border border-slate-700' : ''}
                        ${selected ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400' : ''}
                        ${isToday && !selected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900' : ''}
                      `}
                    >
                      {date?.getDate()}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-800/50 border border-slate-700" />
                <span className="text-slate-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-800 border border-slate-800" />
                <span className="text-slate-400">Unavailable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-600" />
                <span className="text-slate-400">Selected</span>
              </div>
            </div>
          </div>

          {/* Right: Time & Type Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consultation Type */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Select Consultation Type</h4>
              <div className="space-y-3">
                {consultationTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${selectedType === type.id
                        ? `bg-gradient-to-br ${type.gradient} border-transparent shadow-lg`
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedType === type.id ? 'bg-white/20' : 'bg-slate-700'}`}>
                        <type.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-white">{type.name}</h5>
                          {selectedType === type.id && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                        <p className="text-xs text-slate-300 mb-1">{type.duration}</p>
                        <p className="text-xs text-slate-400">{type.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Select Time Slot
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                        className={`
                          p-3 rounded-lg text-sm font-medium transition-all
                          ${!slot.available ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed line-through' : ''}
                          ${slot.available && selectedTime !== slot.time ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : ''}
                          ${selectedTime === slot.time ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-2 border-emerald-400' : ''}
                        `}
                      >
                        {slot.time}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Booking Button */}
            <AnimatePresence mode="wait">
              {selectedDate && selectedTime && selectedType && !isBooked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Button
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg shadow-blue-500/50 text-lg py-6"
                  >
                    <Calendar className="mr-2 w-5 h-5" />
                    Confirm Booking
                  </Button>
                </motion.div>
              )}

              {isBooked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Booking Confirmed!</h4>
                      <p className="text-sm text-slate-300 mb-3">
                        Your consultation is scheduled for {selectedDate?.toLocaleDateString()} at {selectedTime}.
                      </p>
                      <p className="text-xs text-slate-400">
                        You'll receive a confirmation email with calendar invite and meeting link shortly.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  )
}
