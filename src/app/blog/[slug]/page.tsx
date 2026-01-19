'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BLOG_POSTS } from "@/lib/seo/marketing-data";
import { BLOG_CONTENT, BlogChart, BlogImage } from "@/lib/seo/blog-content";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo } from "react";

const BLOG_LINKS: Record<
  string,
  {
    feature: { label: string; href: string };
    solution: { label: string; href: string };
    audience: { label: string; href: string };
  }
> = {
  "fca-authorisation-checklist": {
    feature: { label: "Authorization Pack", href: "/features/authorization-pack" },
    solution: { label: "FCA Authorisation", href: "/solutions/fca-authorisation" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
  "smcr-responsibilities-map": {
    feature: { label: "SM&CR Management", href: "/features/smcr-management" },
    solution: { label: "SM&CR", href: "/solutions/smcr" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
  "compliance-monitoring-plan": {
    feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
    solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
    audience: { label: "Investment Firms", href: "/audience/investment" },
  },
  "consumer-duty-evidence": {
    feature: { label: "Policy Management", href: "/features/policy-management" },
    solution: { label: "Consumer Duty", href: "/solutions/consumer-duty" },
    audience: { label: "Consumer Finance", href: "/audience/consumer" },
  },
  "safeguarding-reconciliation-controls": {
    feature: { label: "Safeguarding", href: "/features/safeguarding" },
    solution: { label: "Safeguarding", href: "/solutions/safeguarding" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
  "crypto-financial-promotions": {
    feature: { label: "Financial Promotions", href: "/features/financial-promotions" },
    solution: { label: "Financial Promotions", href: "/solutions/financial-promotions-compliance" },
    audience: { label: "Crypto & Digital Assets", href: "/audience/crypto" },
  },
};

const BLOG_METADATA: Record<string, { category: string; author: string; authorRole: string; date: string; readTime: string }> = {
  "fca-authorisation-checklist": {
    category: "FCA Authorisation",
    author: "Nasara Connect",
    authorRole: "Regulatory Advisory",
    date: "December 2024",
    readTime: "15 min read",
  },
  "smcr-responsibilities-map": {
    category: "SM&CR",
    author: "Nasara Connect",
    authorRole: "Regulatory Advisory",
    date: "December 2024",
    readTime: "14 min read",
  },
  "compliance-monitoring-plan": {
    category: "Compliance Monitoring",
    author: "Nasara Connect",
    authorRole: "Regulatory Advisory",
    date: "December 2024",
    readTime: "16 min read",
  },
  "consumer-duty-evidence": {
    category: "Consumer Duty",
    author: "Nasara Connect",
    authorRole: "Regulatory Advisory",
    date: "December 2024",
    readTime: "15 min read",
  },
  "safeguarding-reconciliation-controls": {
    category: "Safeguarding",
    author: "Nasara Connect",
    authorRole: "Payments Compliance",
    date: "November 2024",
    readTime: "14 min read",
  },
  "crypto-financial-promotions": {
    category: "Financial Promotions",
    author: "Nasara Connect",
    authorRole: "Digital Assets Compliance",
    date: "November 2024",
    readTime: "15 min read",
  },
};

// Blog Image Component with placeholder
function BlogImageComponent({ image }: { image: BlogImage }) {
  return (
    <figure className="my-10">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="w-16 h-16 rounded-full bg-slate-600/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">{image.alt}</p>
          </div>
        </div>
      </div>
      {image.caption && (
        <figcaption className="mt-3 text-center text-sm text-slate-400 italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Donut Chart for Blog
function BlogDonutChart({ chart }: { chart: BlogChart }) {
  const total = chart.data.reduce((sum, d) => sum + d.value, 0);
  const size = 200;
  const radius = size / 2 - 20;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  const chartId = `donut-chart-${chart.title.replace(/\s+/g, '-').toLowerCase()}`;

  const segments = useMemo(() => {
    let currentAngle = -90;
    return chart.data.map((item) => {
      const percentage = total > 0 ? item.value / total : 0;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        ...item,
        percentage,
        startAngle,
        endAngle: currentAngle,
        dashArray: `${percentage * circumference} ${circumference}`,
        dashOffset: -((startAngle + 90) / 360) * circumference,
      };
    });
  }, [chart.data, total, circumference]);

  return (
    <Card className="my-10 bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{chart.title}</CardTitle>
        {chart.description && (
          <p className="text-sm text-slate-400">{chart.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              className="-rotate-90"
              role="img"
              aria-labelledby={`${chartId}-title ${chartId}-desc`}
            >
              <title id={`${chartId}-title`}>{chart.title}</title>
              <desc id={`${chartId}-desc`}>{chart.description || `Donut chart showing ${chart.title}`}</desc>
              {segments.map((segment, i) => (
                <motion.circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={segment.dashOffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: segment.dashOffset }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  aria-label={`${segment.label}: ${segment.value}%`}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="text-xs text-slate-400">Total %</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 w-full" role="list" aria-label="Chart legend">
            {segments.map((segment) => (
              <div
                key={segment.label}
                role="listitem"
                className="flex items-center justify-between rounded-lg px-4 py-2.5 bg-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden="true"
                  />
                  <span className="text-slate-300 text-sm">{segment.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{segment.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bar Chart for Blog
function BlogBarChart({ chart }: { chart: BlogChart }) {
  const max = Math.max(...chart.data.map((d) => d.value), 1);

  return (
    <Card className="my-10 bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{chart.title}</CardTitle>
        {chart.description && (
          <p className="text-sm text-slate-400">{chart.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chart.data.map((item, i) => {
            const percentage = (item.value / max) * 100;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color || "#10b981" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Trend Chart for Blog
function BlogTrendChart({ chart }: { chart: BlogChart }) {
  const max = Math.max(...chart.data.map((d) => d.value), 1);
  const min = Math.min(...chart.data.map((d) => d.value), 0);
  const range = max - min || 1;
  const width = 400;
  const height = 160;
  const padding = 24;

  const points = chart.data.map((d, i) => {
    // Handle single data point case to avoid division by zero
    const xPosition = chart.data.length > 1
      ? i / (chart.data.length - 1)
      : 0.5;
    const x = padding + xPosition * (width - 2 * padding);
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
    return { x, y, value: d.value, label: d.label };
  });

  const pathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";
  const color = chart.data[0]?.color || "#10b981";
  const chartId = `trend-chart-${chart.title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Card className="my-10 bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{chart.title}</CardTitle>
        {chart.description && (
          <p className="text-sm text-slate-400">{chart.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby={`${chartId}-title ${chartId}-desc`}
        >
          <title id={`${chartId}-title`}>{chart.title}</title>
          <desc id={`${chartId}-desc`}>{chart.description || `Trend chart showing ${chart.title}`}</desc>

          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i / 3) * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + (i / 3) * (height - 2 * padding)}
              stroke="#334155"
              strokeWidth={1}
            />
          ))}

          {/* Area fill */}
          {points.length > 0 && (
            <motion.path
              d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`}
              fill={color}
              fillOpacity={0.15}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Line */}
          {pathD && (
            <motion.path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={5}
              fill="#1e293b"
              stroke={color}
              strokeWidth={3}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            />
          ))}
        </svg>

        <div className="mt-4 flex justify-between text-xs text-slate-400">
          {chart.data.map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Heatmap Chart for Blog (grid-based visualization)
function BlogHeatmapChart({ chart }: { chart: BlogChart }) {
  const max = Math.max(...chart.data.map((d) => d.value), 1);

  return (
    <Card className="my-10 bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">{chart.title}</CardTitle>
        {chart.description && (
          <p className="text-sm text-slate-400">{chart.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {chart.data.map((item, i) => {
            const intensity = item.value / max;
            return (
              <motion.div
                key={item.label}
                className="relative p-4 rounded-xl border border-slate-600 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: item.color || '#10b981' }}
                />
                <div className="relative z-10">
                  <p className="text-sm text-slate-300 mb-1">{item.label}</p>
                  <p className="text-2xl font-bold text-white">{item.value}%</p>
                </div>
                <div
                  className="absolute bottom-0 left-0 h-1 transition-all duration-500"
                  style={{
                    width: `${intensity * 100}%`,
                    backgroundColor: item.color || '#10b981'
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Chart Renderer
function ChartRenderer({ chart }: { chart: BlogChart }) {
  // Early return for empty data
  if (!chart.data || chart.data.length === 0) {
    return (
      <Card className="my-10 bg-slate-800/50 border-slate-700 p-8">
        <p className="text-slate-400 text-center">No chart data available</p>
      </Card>
    );
  }

  switch (chart.type) {
    case 'donut':
      return <BlogDonutChart chart={chart} />;
    case 'bar':
      return <BlogBarChart chart={chart} />;
    case 'trend':
      return <BlogTrendChart chart={chart} />;
    case 'heatmap':
      return <BlogHeatmapChart chart={chart} />;
    default:
      return <BlogBarChart chart={chart} />;
  }
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const post = BLOG_POSTS.find((item) => item.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <Link href="/resources#blog">
            <Button>Back to Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  const content = BLOG_CONTENT[slug];
  const meta = BLOG_METADATA[slug] ?? {
    category: "Compliance",
    author: "Nasara Connect",
    authorRole: "Regulatory Advisory",
    date: "2024",
    readTime: "15 min read",
  };
  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation variant="solid" />

      {/* Hero Section */}
      <section className="px-4 pb-8 pt-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              {meta.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              {post.seoDescription}
            </p>

            {/* Author and Meta */}
            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{meta.author}</p>
                  <p className="text-slate-400 text-sm">{meta.authorRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {meta.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {meta.readTime}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Image */}
      {content?.heroImage && (
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BlogImageComponent image={content.heroImage} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <article className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          {content ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Introduction */}
              <div className="prose-section mb-12">
                {content.introduction.map((para, i) => (
                  <p key={i} className="text-lg text-slate-300 leading-relaxed mb-6">
                    {para}
                  </p>
                ))}
              </div>

              {/* Main Sections */}
              {content.sections.map((section, i) => (
                <section key={i} className="mb-16">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    {section.heading}
                  </h2>
                  <div className="space-y-6">
                    {section.content.map((para, j) => (
                      <p key={j} className="text-lg text-slate-300 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Section Image */}
                  {section.image && (
                    <BlogImageComponent image={section.image} />
                  )}

                  {/* Section Chart */}
                  {section.chart && (
                    <ChartRenderer chart={section.chart} />
                  )}
                </section>
              ))}

              {/* Conclusion */}
              {content.conclusion && content.conclusion.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    Conclusion
                  </h2>
                  <div className="space-y-6">
                    {content.conclusion.map((para, i) => (
                      <p key={i} className="text-lg text-slate-300 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                This article outlines the key steps, evidence, and governance expectations firms should
                consider when preparing for FCA reviews. Use the checklist to align teams around ownership,
                timelines, and supporting documentation.
              </p>
              <p>
                Focus on creating a single source of truth for regulatory obligations. Map policies to
                outcomes, track evidence, and ensure board-level oversight is documented.
              </p>
              <p>
                Nasara Connect helps teams coordinate workflows, capture approvals, and surface compliance gaps
                before they become audit findings.
              </p>
            </div>
          )}
        </div>
      </article>

      {/* CTA Section */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Need support with your compliance framework?
            </h3>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl">
              Nasara Connect provides the tools and expertise to help regulated firms build, monitor, and evidence their compliance arrangements effectively.
            </p>
            <Link href="/request-demo">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg px-8">
                Request a Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Related Workflows */}
      {BLOG_LINKS[slug] && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-white mb-8">Related Platform Features</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { kind: "Feature", ...BLOG_LINKS[slug].feature },
                { kind: "Solution", ...BLOG_LINKS[slug].solution },
                { kind: "Audience", ...BLOG_LINKS[slug].audience },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="border-slate-700 bg-slate-800/50 p-6 hover:border-emerald-500/60 transition-all h-full">
                    <span className="text-xs uppercase tracking-wide text-emerald-400 font-medium">{item.kind}</span>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Explore our {item.kind.toLowerCase()} capabilities.
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white mb-8">Further Reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/blog/${item.slug}`}>
                <Card className="border-slate-700 bg-slate-800/50 p-6 hover:border-emerald-500/60 transition-all h-full">
                  <Badge className="mb-4 bg-slate-700 text-slate-300 border-0 text-xs">
                    {BLOG_METADATA[item.slug]?.category ?? "Compliance"}
                  </Badge>
                  <h3 className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 line-clamp-3">
                    {item.seoDescription}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
