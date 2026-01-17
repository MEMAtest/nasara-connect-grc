import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FileText,
  GaugeCircle,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Shield,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";

export type ModuleAccent = "teal" | "sky" | "indigo" | "rose" | "amber";

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: ModuleAccent;
  route: string;
  progress?: number;
  alerts?: number;
  isLocked?: boolean;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: number | null;
  icon: LucideIcon;
  color: "green" | "orange" | "blue" | "purple";
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "warning" | "danger" | "info";
  icon: LucideIcon;
}

export interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  owner: string;
  priority: "high" | "medium" | "low";
  progress: number;
}

export const dashboardModules: DashboardModule[] = [
  {
    id: "authPack",
    title: "Authorisation Pack Workspace",
    description: "Track the FCA business plan spine, evidence annexes, and review gates in one workspace",
    icon: FileCheck2,
    color: "teal",
    route: "/authorization-pack",
    progress: 75,
    alerts: 2,
    isLocked: false,
  },
  {
    id: "riskAssessment",
    title: "Risk Assessment Tool",
    description: "Identify, evaluate, and mitigate business risks effectively",
    icon: ShieldAlert,
    color: "sky",
    route: "/risk-assessment",
    alerts: 3,
    isLocked: false,
  },
  {
    id: "smcr",
    title: "SM&CR Management",
    description: "Senior Managers & Certification Regime compliance and oversight",
    icon: Shield,
    color: "indigo",
    route: "/smcr",
    progress: 85,
    alerts: 2,
    isLocked: false,
  },
  {
    id: "policies",
    title: "Policy Management",
    description: "Create, approve, and monitor FCA-mandatory policies",
    icon: FileText,
    color: "indigo",
    route: "/policies",
    progress: 72,
    alerts: 5,
    isLocked: false,
  },
  {
    id: "complianceFramework",
    title: "Compliance Framework",
    description: "Build the compliance framework and drive monitoring workflows",
    icon: ClipboardList,
    color: "indigo",
    route: "/compliance-framework/builder",
    progress: 60,
    alerts: 0,
    isLocked: false,
  },
  {
    id: "training",
    title: "Training Library",
    description: "Access compliance training modules and track progress",
    icon: BookOpenCheck,
    color: "amber",
    route: "/training",
    progress: 45,
    alerts: 1,
    isLocked: false,
  },
  {
    id: "regulatoryNews",
    title: "Regulatory News",
    description: "Stay updated with latest regulatory changes",
    icon: Newspaper,
    color: "rose",
    route: "/regulatory-news",
    alerts: 5,
    isLocked: false,
  },
  {
    id: "payments",
    title: "Pay Suppliers",
    description: "Manage B2B payments with currency conversion and compliance monitoring",
    icon: CreditCard,
    color: "sky",
    route: "/payments",
    alerts: 0,
    isLocked: false,
  },
  {
    id: "aiChat",
    title: "AI Assistant",
    description: "Get instant regulatory guidance and support",
    icon: MessageCircle,
    color: "teal",
    route: "/ai-chat",
    alerts: 0,
    isLocked: true,
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    title: "Compliance Score",
    value: "92%",
    change: 3,
    icon: TrendingUp,
    color: "green",
  },
  {
    title: "Open Risks",
    value: "12",
    change: -2,
    icon: AlertTriangle,
    color: "orange",
  },
  {
    title: "Training Progress",
    value: "78%",
    change: 5,
    icon: GraduationCap,
    color: "blue",
  },
  {
    title: "Days to Deadline",
    value: "14",
    change: null,
    icon: Calendar,
    color: "purple",
  },
];

export const activityFeed: ActivityEvent[] = [
  {
    id: "activity-1",
    title: "Risk mitigation plan approved",
    description: "Board signed off on the new liquidity risk mitigation strategy",
    timestamp: "2 hours ago",
    status: "success",
    icon: CheckCircle2,
  },
  {
    id: "activity-2",
    title: "New FCA bulletin",
    description: "Consumer Duty implementation updates released",
    timestamp: "4 hours ago",
    status: "info",
    icon: LayoutDashboard,
  },
  {
    id: "activity-3",
    title: "High priority incident",
    description: "Potential AML control gap identified in onboarding flow",
    timestamp: "Yesterday",
    status: "danger",
    icon: AlertTriangle,
  },
  {
    id: "activity-4",
    title: "Training completion",
    description: "Financial promotions module completed by 24 team members",
    timestamp: "2 days ago",
    status: "success",
    icon: GraduationCap,
  },
  {
    id: "activity-5",
    title: "New policy draft",
    description: "Drafted new complaints handling policy awaiting review",
    timestamp: "3 days ago",
    status: "warning",
    icon: GaugeCircle,
  },
];

export const upcomingTasks: UpcomingTask[] = [
  {
    id: "task-1",
    title: "Submit capital adequacy report",
    dueDate: "Due in 3 days",
    owner: "Regina Miles",
    priority: "high",
    progress: 45,
  },
  {
    id: "task-2",
    title: "Finalize risk appetite statement",
    dueDate: "Due in 6 days",
    owner: "Ayo Bamidele",
    priority: "medium",
    progress: 20,
  },
  {
    id: "task-3",
    title: "Complete Consumer Duty training",
    dueDate: "Due in 9 days",
    owner: "Team Operations",
    priority: "low",
    progress: 68,
  },
  {
    id: "task-4",
    title: "Audit third-party vendor controls",
    dueDate: "Due in 14 days",
    owner: "Sasha Patel",
    priority: "medium",
    progress: 32,
  },
];

export const keyPeople = [
  {
    name: "Regina Miles",
    role: "Chief Compliance Officer",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Ayo Bamidele",
    role: "Head of Risk",
    avatar: "https://i.pravatar.cc/150?img=40",
  },
  {
    name: "Sasha Patel",
    role: "Compliance Analyst",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Oliver Chen",
    role: "Operations Lead",
    avatar: "https://i.pravatar.cc/150?img=7",
  },
];

export const heroHighlights = [
  {
    id: "highlight-1",
    label: "Supervision",
    value: "Tier 1",
  },
  {
    id: "highlight-2",
    label: "Risk posture",
    value: "Low",
  },
  {
    id: "highlight-3",
    label: "Next milestone",
    value: "FCA Filing - 14 days",
  },
];

export const quickActions = [
  {
    id: "qa-1",
    label: "Launch new assessment",
    icon: GaugeCircle,
  },
  {
    id: "qa-2",
    label: "Invite team member",
    icon: Users,
  },
  {
    id: "qa-3",
    label: "Upload policy",
    icon: ClipboardList,
  },
];
