'use client'

/**
 * Currency Tracker Widget
 * Real-time currency exchange rates tied to payment processing
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CurrencyRate {
  code: string
  name: string
  rate: number
  change: number
  symbol: string
}

export default function CurrencyTracker() {
  const [rates, setRates] = useState<CurrencyRate[]>([
    { code: 'GBP', name: 'British Pound', rate: 1.0, change: 0, symbol: '£' },
    { code: 'USD', name: 'US Dollar', rate: 1.27, change: 0.12, symbol: '$' },
    { code: 'EUR', name: 'Euro', rate: 1.17, change: -0.08, symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', rate: 189.45, change: 1.23, symbol: '¥' },
  ])

  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRates((prev) =>
        prev.map((rate) => ({
          ...rate,
          rate: rate.rate + (Math.random() - 0.5) * 0.02,
          change: (Math.random() - 0.5) * 0.3,
        }))
      )
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Currency Tracker</h3>
            <p className="text-sm text-slate-400">Live exchange rates</p>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          Updated {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Currency Cards */}
      <div className="space-y-3">
        {rates.map((currency) => (
          <motion.div
            key={currency.code}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border transition-all cursor-pointer ${
              selectedCurrency === currency.code
                ? 'bg-violet-500/10 border-violet-500/30'
                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
            }`}
            onClick={() => setSelectedCurrency(currency.code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 font-semibold">
                  {currency.symbol}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">{currency.code}</div>
                  <div className="text-xs text-slate-400">{currency.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-200">
                  {currency.rate.toFixed(4)}
                </div>
                <div
                  className={`text-sm font-medium flex items-center gap-1 ${
                    currency.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {currency.change >= 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {Math.abs(currency.change).toFixed(2)}%
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Conversion Calculator */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <input
            type="number"
            defaultValue="100"
            className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder="Amount in GBP"
          />
          <div className="text-slate-400">=</div>
          <div className="flex-1 px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-200 font-semibold">
            {(100 * (rates.find((r) => r.code === selectedCurrency)?.rate || 1)).toFixed(2)}{' '}
            {selectedCurrency}
          </div>
        </div>
      </div>
    </div>
  )
}
