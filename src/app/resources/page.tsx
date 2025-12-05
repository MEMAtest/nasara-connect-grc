'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, BookOpen, FileText, Video, Newspaper, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

const resourceCategories = [
  {
    id: 'docs',
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides to get the most out of Nasara Connect',
    gradient: 'from-blue-500 to-cyan-600',
    items: [
      { title: 'Getting Started Guide', type: 'Guide', time: '10 min read' },
      { title: 'Platform Overview', type: 'Documentation', time: '15 min read' },
      { title: 'API Reference', type: 'Technical', time: 'Reference' },
      { title: 'Integration Guide', type: 'Technical', time: '20 min read' }
    ]
  },
  {
    id: 'guides',
    icon: FileText,
    title: 'Guides & Tutorials',
    description: 'Step-by-step guides for common compliance tasks',
    gradient: 'from-emerald-500 to-teal-600',
    items: [
      { title: 'Building Your Authorization Pack', type: 'Tutorial', time: '25 min read' },
      { title: 'Setting Up SM&CR Compliance', type: 'Guide', time: '20 min read' },
      { title: 'Creating Your First Policy', type: 'Tutorial', time: '15 min read' },
      { title: 'Risk Assessment Best Practices', type: 'Guide', time: '18 min read' }
    ]
  },
  {
    id: 'webinars',
    icon: Video,
    title: 'Webinars',
    description: 'Live and recorded sessions from compliance experts',
    gradient: 'from-violet-500 to-purple-600',
    items: [
      { title: 'Consumer Duty Implementation', type: 'Webinar', time: '45 min' },
      { title: 'FCA Priorities 2024', type: 'Webinar', time: '60 min' },
      { title: 'Operational Resilience Deep Dive', type: 'Webinar', time: '50 min' },
      { title: 'SM&CR Masterclass', type: 'Webinar', time: '55 min' }
    ]
  },
  {
    id: 'blog',
    icon: Newspaper,
    title: 'Blog & Insights',
    description: 'Latest regulatory updates and compliance insights',
    gradient: 'from-amber-500 to-orange-600',
    items: [
      { title: 'FCA Enforcement Trends Q4 2024', type: 'Article', time: '8 min read' },
      { title: 'Consumer Duty: 6 Months On', type: 'Analysis', time: '12 min read' },
      { title: 'Crypto Regulation Update', type: 'News', time: '5 min read' },
      { title: 'AI in Compliance: What\'s Next?', type: 'Opinion', time: '10 min read' }
    ]
  }
]

const featuredResources = [
  {
    title: 'FCA Authorization Checklist',
    description: 'Complete checklist for your FCA authorization application',
    type: 'Downloadable',
    icon: Download,
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Consumer Duty Toolkit',
    description: 'Templates and frameworks for Consumer Duty compliance',
    type: 'Toolkit',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    title: 'SM&CR Responsibilities Map',
    description: 'Interactive tool to map senior manager responsibilities',
    type: 'Interactive',
    icon: ExternalLink,
    gradient: 'from-violet-500 to-purple-600'
  }
]

export default function ResourcesPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/nasara-logo.png"
                alt="Nasara Connect Logo"
                width={320}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="outline" className="border-emerald-500/50 text-emerald-400">
                  View Pricing
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                  Request Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Resources
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-white">Learn, Grow, </span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                Stay Compliant
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Guides, tutorials, webinars, and insights to help you master FCA compliance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredResources.map((resource, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`p-6 bg-gradient-to-br ${resource.gradient} border-0 cursor-pointer hover:scale-105 transition-transform`}>
                  <resource.icon className="w-8 h-8 text-white mb-4" />
                  <Badge className="bg-white/20 text-white border-0 mb-3">{resource.type}</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                  <p className="text-white/80">{resource.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {resourceCategories.map((category, i) => (
            <motion.div
              key={category.id}
              id={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  <p className="text-slate-400">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.items.map((item, j) => (
                  <Card
                    key={j}
                    className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                  >
                    <Badge variant="outline" className="border-slate-700 text-slate-400 mb-3">
                      {item.type}
                    </Badge>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500">{item.time}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Stay ahead of regulatory changes
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Get weekly compliance insights delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
