"use client";

import Link from "next/link";
import { motion, type Variants, type TargetAndTransition } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Activity,
  Zap,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AuthorizationIllustration,
  ComplianceIllustration,
  RiskIllustration,
  PolicyIllustration,
  SMCRIllustration,
  TrainingIllustration,
  PEPIllustration,
  ThirdPartyIllustration,
  ComplaintsIllustration,
  IncidentsIllustration,
  ConflictsIllustration,
  GiftsIllustration,
  GRCHeroIllustration,
} from "@/components/grc-hub/GRCIllustrations";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardHover: TargetAndTransition = {
  y: -8,
  transition: { duration: 0.3, ease: "easeOut" },
};

interface CoreModule {
  title: string;
  description: string;
  href: string;
  illustration: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  badge?: { text: string; color: string };
}

const coreModules: CoreModule[] = [
  {
    title: "Authorization Pack",
    description: "Manage FCA authorization applications, evidence gathering, and regulatory submission tracking",
    href: "/authorization-pack",
    illustration: AuthorizationIllustration,
    color: "bg-indigo-600",
    glowColor: "rgba(99, 102, 241, 0.3)",
    badge: { text: "Active", color: "bg-indigo-500" },
  },
  {
    title: "Compliance Framework",
    description: "Build the framework, tighten mapping, and drive CMP monitoring workflows",
    href: "/compliance-framework/builder",
    illustration: ComplianceIllustration,
    color: "bg-teal-600",
    glowColor: "rgba(20, 184, 166, 0.3)",
    badge: { text: "Healthy", color: "bg-emerald-500" },
  },
  {
    title: "Risk Assessment",
    description: "Identify, assess, and mitigate business risks with comprehensive risk matrices and heat maps",
    href: "/risk-assessment",
    illustration: RiskIllustration,
    color: "bg-orange-500",
    glowColor: "rgba(249, 115, 22, 0.3)",
    badge: { text: "Review", color: "bg-orange-500" },
  },
];

interface CompactTool {
  title: string;
  description: string;
  href: string;
  illustration: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
}

const complianceTools: CompactTool[] = [
  {
    title: "Policy Register",
    description: "Manage policies, attestations, and compliance documentation",
    href: "/policies",
    illustration: PolicyIllustration,
    color: "bg-emerald-600",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  {
    title: "SMCR Management",
    description: "Senior Managers & Certification Regime compliance tracking",
    href: "/smcr",
    illustration: SMCRIllustration,
    color: "bg-violet-600",
    glowColor: "rgba(139, 92, 246, 0.3)",
  },
  {
    title: "Training Library",
    description: "Compliance training courses, certifications, and progress tracking",
    href: "/training-library",
    illustration: TrainingIllustration,
    color: "bg-blue-600",
    glowColor: "rgba(59, 130, 246, 0.3)",
  },
];

interface RegisterItem {
  title: string;
  description: string;
  href: string;
  illustration: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
}

const registers: RegisterItem[] = [
  {
    title: "PEP Register",
    description: "Track Politically Exposed Persons and their associates",
    href: "/registers/pep",
    illustration: PEPIllustration,
    color: "bg-rose-600",
    glowColor: "rgba(244, 63, 94, 0.3)",
  },
  {
    title: "Third-Party Register",
    description: "Manage vendors and outsourcing arrangements",
    href: "/registers/third-party",
    illustration: ThirdPartyIllustration,
    color: "bg-cyan-600",
    glowColor: "rgba(6, 182, 212, 0.3)",
  },
  {
    title: "Complaints Register",
    description: "Track and resolve customer complaints",
    href: "/registers/complaints",
    illustration: ComplaintsIllustration,
    color: "bg-amber-500",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
  {
    title: "Incident Register",
    description: "Log operational incidents and near-misses",
    href: "/registers/incidents",
    illustration: IncidentsIllustration,
    color: "bg-red-600",
    glowColor: "rgba(239, 68, 68, 0.3)",
  },
  {
    title: "Conflicts of Interest",
    description: "Manage COI declarations and mitigations",
    href: "/registers/conflicts",
    illustration: ConflictsIllustration,
    color: "bg-violet-600",
    glowColor: "rgba(139, 92, 246, 0.3)",
  },
  {
    title: "Gifts & Hospitality",
    description: "Track gifts and hospitality given and received",
    href: "/registers/gifts-hospitality",
    illustration: GiftsIllustration,
    color: "bg-pink-600",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
];

function CoreModuleCard({ module }: { module: CoreModule }) {
  const Illustration = module.illustration;

  return (
    <Link href={module.href} className="block group">
      <motion.div
        whileHover={cardHover}
        className="relative h-full overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-xl"
        style={{
          boxShadow: `0 20px 50px -12px ${module.glowColor}`,
        }}
      >
        {/* Solid accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1", module.color)} />

        {/* Subtle background shape */}
        <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20", module.color)} />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <Illustration className="w-20 h-20" />
            </div>
            {module.badge && (
              <Badge className={cn("text-white text-xs font-semibold", module.badge.color)}>
                {module.badge.text}
              </Badge>
            )}
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
            {module.title}
          </h3>
          <p className="text-sm text-slate-500 mb-6 line-clamp-2">
            {module.description}
          </p>

          {/* Action link */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700">
              Open module
            </span>
            <div className={cn("p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity", module.color)}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function CompactToolCard({ tool }: { tool: CompactTool }) {
  const Illustration = tool.illustration;

  return (
    <Link href={tool.href} className="block group">
      <motion.div
        whileHover={cardHover}
        className="relative h-full overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-xl"
        style={{
          boxShadow: `0 20px 50px -12px ${tool.glowColor}`,
        }}
      >
        {/* Solid accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1", tool.color)} />

        {/* Subtle background shape */}
        <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-20", tool.color)} />

        <div className="relative p-6">
          {/* Illustration */}
          <div className="mb-5">
            <Illustration className="w-16 h-16" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
            {tool.title}
          </h3>
          <p className="text-sm text-slate-500 mb-5 line-clamp-2">
            {tool.description}
          </p>

          {/* Action link */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700">
              View
            </span>
            <div className={cn("p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity", tool.color)}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function RegisterCard({ register }: { register: RegisterItem }) {
  const Illustration = register.illustration;

  return (
    <Link href={register.href} className="block group">
      <motion.div
        whileHover={cardHover}
        className="relative h-full overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-xl"
        style={{
          boxShadow: `0 20px 50px -12px ${register.glowColor}`,
        }}
      >
        {/* Solid accent bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1.5", register.color)} />

        {/* Subtle background shape */}
        <div className={cn("absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-20", register.color)} />

        <div className="relative p-6">
          {/* Illustration */}
          <div className="mb-5">
            <Illustration className="w-14 h-14" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
            {register.title}
          </h3>
          <p className="text-sm text-slate-500 mb-5 line-clamp-2">
            {register.description}
          </p>

          {/* Action link */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700">
              Open register
            </span>
            <div className={cn("p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity", register.color)}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function GRCHubClient() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 lg:p-10">
          {/* Subtle background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-teal-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="hero-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hero-grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left content */}
              <div className="flex items-start gap-6">
                <div className="relative hidden sm:block">
                  <GRCHeroIllustration className="w-28 h-28 lg:w-36 lg:h-36" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-teal-600/20 text-teal-300 border border-teal-500/30 backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Command Center
                    </Badge>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                    GRC Control Hub
                  </h1>
                  <p className="text-slate-400 max-w-lg text-sm lg:text-base">
                    Your unified command center for Governance, Risk, and Compliance.
                    Monitor, manage, and maintain regulatory excellence.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button className="bg-teal-500 hover:bg-teal-400 text-white border-0 shadow-lg shadow-teal-500/30">
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Actions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Core Modules */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Core Modules</h2>
            <p className="text-slate-500">Essential tools for regulatory compliance</p>
          </div>
          <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
            <Activity className="w-3 h-3 mr-1" />
            Live Status
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreModules.map((module) => (
            <CoreModuleCard key={module.href} module={module} />
          ))}
        </div>
      </motion.section>

      {/* Compliance & Training Tools */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Compliance & Training</h2>
            <p className="text-slate-500">Policy management, SMCR, and staff development</p>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All Active
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {complianceTools.map((tool) => (
            <CompactToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </motion.section>

      {/* Registers Grid */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Regulatory Registers</h2>
            <p className="text-slate-500">Track and manage compliance records</p>
          </div>
          <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
            <FolderOpen className="w-3 h-3 mr-1" />
            Registers
          </Badge>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {registers.map((register) => (
            <RegisterCard key={register.href} register={register} />
          ))}
        </div>
      </motion.section>

      {/* Bottom CTA */}
      <motion.section variants={itemVariants}>
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 lg:p-10">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl" />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="cta-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.3" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#cta-grid)" />
            </svg>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/40">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Need guidance?</h3>
                <p className="text-slate-400">Our AI assistant can help navigate compliance requirements</p>
              </div>
            </div>

            <Link href="/ai-chat">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl font-semibold">
                Launch AI Assistant
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
