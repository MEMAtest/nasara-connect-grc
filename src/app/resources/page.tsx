'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, BookOpen, FileText, Newspaper, Download, ExternalLink, Clock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Navigation } from '@/components/landing/Navigation'

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
  }
]

// Blog posts with Substack-style layout
const blogPosts = [
  {
    id: 1,
    title: 'FCA Enforcement Trends Q4 2024: What Firms Need to Know',
    excerpt: 'A deep dive into the FCA\'s latest enforcement actions and what they mean for your firm\'s compliance strategy going into 2025.',
    category: 'Regulatory Analysis',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Head of Compliance Research',
    date: 'Dec 4, 2024',
    readTime: '8 min read',
    featured: true,
    image: '/blog/enforcement-trends.jpg'
  },
  {
    id: 2,
    title: 'Consumer Duty: 6 Months On - A Practical Assessment',
    excerpt: 'Six months after full implementation, we examine what\'s working, what\'s not, and how firms are adapting their approaches.',
    category: 'Consumer Duty',
    author: 'James Chen',
    authorRole: 'Senior Compliance Consultant',
    date: 'Dec 2, 2024',
    readTime: '12 min read',
    featured: true,
    image: '/blog/consumer-duty.jpg'
  },
  {
    id: 3,
    title: 'Crypto Regulation Update: FCA\'s New Framework Explained',
    excerpt: 'Breaking down the latest regulatory developments for cryptoasset businesses and what they mean for compliance.',
    category: 'Crypto & Digital Assets',
    author: 'Alex Thompson',
    authorRole: 'Fintech Specialist',
    date: 'Nov 28, 2024',
    readTime: '5 min read',
    featured: false,
    image: '/blog/crypto-regulation.jpg'
  },
  {
    id: 4,
    title: 'AI in Compliance: What\'s Next for RegTech?',
    excerpt: 'Exploring how artificial intelligence is transforming compliance operations and what the future holds for regulatory technology.',
    category: 'Technology',
    author: 'Dr. Sarah Mitchell',
    authorRole: 'Head of Compliance Research',
    date: 'Nov 25, 2024',
    readTime: '10 min read',
    featured: false,
    image: '/blog/ai-compliance.jpg'
  },
  {
    id: 5,
    title: 'SM&CR Best Practices: Lessons from FCA Enforcement',
    excerpt: 'Key takeaways from recent FCA enforcement actions and how to strengthen your SM&CR framework.',
    category: 'SM&CR',
    author: 'James Chen',
    authorRole: 'Senior Compliance Consultant',
    date: 'Nov 20, 2024',
    readTime: '7 min read',
    featured: false,
    image: '/blog/smcr-best-practices.jpg'
  },
  {
    id: 6,
    title: 'Operational Resilience: Meeting the March 2025 Deadline',
    excerpt: 'A comprehensive guide to ensuring your firm meets the FCA\'s operational resilience requirements ahead of the deadline.',
    category: 'Operational Resilience',
    author: 'Emily Roberts',
    authorRole: 'Risk & Resilience Lead',
    date: 'Nov 15, 2024',
    readTime: '15 min read',
    featured: false,
    image: '/blog/operational-resilience.jpg'
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
      <Navigation variant="solid" />

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

      {/* Resource Categories - Compact */}
      <section className="py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {resourceCategories.map((category, i) => (
              <motion.div
                key={category.id}
                id={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                    <p className="text-slate-400 text-sm">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {category.items.map((item, j) => (
                    <Card
                      key={j}
                      className="p-4 bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                    >
                      <Badge variant="outline" className="border-slate-700 text-slate-400 mb-2 text-xs">
                        {item.type}
                      </Badge>
                      <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog & Insights - Substack Style */}
      <section className="py-20 px-4" id="blog">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Blog & Insights</h2>
                <p className="text-slate-400">Latest regulatory updates and compliance insights</p>
              </div>
            </div>
          </div>

          {/* Featured Posts - Large Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {blogPosts.filter(p => p.featured).map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
                  {/* Image Placeholder */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-slate-800 to-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-slate-600" />
                    </div>
                    <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-0">
                      {post.category}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 mb-4 line-clamp-2 text-base leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{post.author}</p>
                          <p className="text-slate-500 text-xs">{post.authorRole}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>

          {/* Regular Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.filter(p => !p.featured).map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all overflow-hidden">
                  {/* Image Placeholder */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
                    <Badge className="absolute top-3 left-3 bg-slate-800/80 text-slate-300 border-0 text-xs">
                      {post.category}
                    </Badge>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>
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
