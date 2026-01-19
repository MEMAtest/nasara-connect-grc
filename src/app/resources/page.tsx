'use client'

import { motion } from 'framer-motion'
import { Sparkles, BookOpen, FileText, Newspaper, Download, ExternalLink, Clock, User, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Navigation } from '@/components/landing/Navigation'
import { Footer } from '@/components/landing/Footer'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { BLOG_POSTS, RESOURCE_GUIDES, RESOURCE_TEMPLATES, TOOLS } from '@/lib/seo/marketing-data'

const resourceCategories = [
  {
    id: 'guides',
    icon: BookOpen,
    title: 'Guides',
    description: 'Step-by-step FCA compliance playbooks and checklists.',
    gradient: 'from-emerald-500 to-teal-600',
    items: RESOURCE_GUIDES.map((guide) => ({
      title: guide.title,
      type: 'Guide',
      href: `/resources/guides/${guide.slug}`,
    })),
  },
  {
    id: 'templates',
    icon: FileText,
    title: 'Templates & packs',
    description: 'Downloadable letter packs, MI templates, and policy packs.',
    gradient: 'from-blue-500 to-cyan-600',
    items: RESOURCE_TEMPLATES.map((template) => ({
      title: template.title,
      type: 'Template',
      href: `/resources/templates/${template.slug}`,
    })),
  },
  {
    id: 'tools',
    icon: ExternalLink,
    title: 'Tools',
    description: 'Interactive builders for SM&CR and compliance workflows.',
    gradient: 'from-violet-500 to-purple-600',
    items: TOOLS.map((tool) => ({
      title: tool.title,
      type: 'Tool',
      href: `/tools/${tool.slug}`,
    })),
  },
]

const blogMetadata: Record<string, { category: string; author: string; authorRole: string; date: string; readTime: string; featured: boolean }> = {
  'fca-authorisation-checklist': {
    category: 'FCA Authorisation',
    author: 'Nasara Connect',
    authorRole: 'Compliance Research',
    date: 'Dec 12, 2024',
    readTime: '8 min read',
    featured: true,
  },
  'smcr-responsibilities-map': {
    category: 'SM&CR',
    author: 'Nasara Connect',
    authorRole: 'Regulatory Advisory',
    date: 'Dec 9, 2024',
    readTime: '7 min read',
    featured: true,
  },
  'compliance-monitoring-plan': {
    category: 'Monitoring',
    author: 'Nasara Connect',
    authorRole: 'Compliance Research',
    date: 'Dec 6, 2024',
    readTime: '9 min read',
    featured: false,
  },
  'consumer-duty-evidence': {
    category: 'Consumer Duty',
    author: 'Nasara Connect',
    authorRole: 'Compliance Research',
    date: 'Dec 3, 2024',
    readTime: '8 min read',
    featured: false,
  },
  'safeguarding-reconciliation-controls': {
    category: 'Safeguarding',
    author: 'Nasara Connect',
    authorRole: 'Payments Compliance',
    date: 'Nov 28, 2024',
    readTime: '6 min read',
    featured: false,
  },
  'crypto-financial-promotions': {
    category: 'Financial Promotions',
    author: 'Nasara Connect',
    authorRole: 'Digital Assets',
    date: 'Nov 25, 2024',
    readTime: '6 min read',
    featured: false,
  },
}

const blogPosts = BLOG_POSTS.map((post) => {
  const meta = blogMetadata[post.slug] ?? {
    category: 'Compliance',
    author: 'Nasara Connect',
    authorRole: 'Compliance Research',
    date: 'Updated monthly',
    readTime: '8 min read',
    featured: false,
  }

  return {
    ...post,
    ...meta,
    featured: meta.featured ?? false,
  }
})

const featuredResources = [
  {
    title: RESOURCE_GUIDES[0]?.title ?? 'FCA Authorisation Checklist',
    description: 'Checklist for FCA authorisation applications and governance evidence.',
    type: 'Guide',
    icon: Download,
    gradient: 'from-emerald-500 to-teal-600',
    href: RESOURCE_GUIDES[0] ? `/resources/guides/${RESOURCE_GUIDES[0].slug}` : '/resources/guides',
  },
  {
    title: RESOURCE_TEMPLATES[0]?.title ?? 'Complaints Response Pack',
    description: 'Letter templates aligned to DISP and PSR timelines.',
    type: 'Template',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-600',
    href: RESOURCE_TEMPLATES[0] ? `/resources/templates/${RESOURCE_TEMPLATES[0].slug}` : '/resources/templates',
  },
  {
    title: TOOLS[0]?.title ?? 'SM&CR Responsibilities Map Tool',
    description: 'Interactive builder for responsibilities mapping.',
    type: 'Tool',
    icon: ExternalLink,
    gradient: 'from-violet-500 to-purple-600',
    href: TOOLS[0] ? `/tools/${TOOLS[0].slug}` : '/resources',
  },
]

export default function ResourcesPage() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Resources', path: '/resources' }
        ]}
      />
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
              Guides, templates, tools, and insights to help you master FCA compliance.
            </p>
            <Link
              href="/grc-platform"
              className="mt-6 inline-flex items-center justify-center text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Explore the governance, risk &amp; compliance platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
                <Link href={resource.href} className="block">
                  <Card className={`p-6 bg-gradient-to-br ${resource.gradient} border-0 cursor-pointer hover:scale-105 transition-transform`}>
                    <resource.icon className="w-8 h-8 text-white mb-4" />
                    <Badge className="bg-white/20 text-white border-0 mb-3">{resource.type}</Badge>
                    <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                    <p className="text-white/80">{resource.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories - Compact */}
      <section className="py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                    <Link key={j} href={item.href} className="block">
                      <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-slate-700 cursor-pointer transition-all group">
                        <Badge variant="outline" className="border-slate-700 text-slate-400 mb-2 text-xs">
                          {item.type}
                        </Badge>
                        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>
                      </Card>
                    </Link>
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
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
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
                        {post.seoDescription}
                      </p>

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{post.author ?? 'Nasara Connect'}</p>
                            <p className="text-slate-500 text-xs">{post.authorRole ?? 'Compliance Research'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date ?? 'Updated monthly'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime ?? '8 min read'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Regular Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.filter(p => !p.featured).map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
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
                        {post.seoDescription}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{post.author ?? 'Nasara Connect'}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime ?? '8 min read'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
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

      <Footer />
    </div>
  )
}
