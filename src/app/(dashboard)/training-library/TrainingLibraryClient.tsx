"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Play,
  Target,
  Clock,
  Award,
  TrendingUp,
  Users,
  UserPlus,
  Brain,
  Search,
  Zap,
  CheckCircle2,
  AlertCircle,
  Star,
  Trophy,
  LayoutGrid,
  List,
  RotateCcw,
  Gamepad2,
  MessageSquare,
  Crown,
  Loader2
} from "lucide-react";
import { featuredModules, learningPathways, getAllTrainingModules } from "./content";
import { GamificationHub } from "./components/GamificationHub";
import { SocialLearning } from "./components/SocialLearning";
import { ProgressTracker } from "./components/ProgressTracker";
import { dailyMicroChallenges, sampleMicroLessons, trainingSimulations } from "./lib/trainingContent";
import { PlayfulModuleCard } from "@/components/training/PlayfulModuleCard";

interface UserProgress {
  completed_pathways: number;
  total_pathways: number;
  completed_lessons: number;
  total_lessons: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  weekly_goal: number;
  weekly_progress: number;
  badges_count: number;
}

interface ModuleProgress {
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percentage: number;
  score?: number | null;
  updated_at?: string | null;
}

interface CertificateDownload {
  module_id: string;
  download_count: number;
  downloaded_at: string;
  score?: number | null;
}

interface TrainingAssignment {
  id: string;
  module_id: string;
  assigned_to: string;
  assigned_by: string;
  due_date?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at?: string | null;
}

const defaultProgress: UserProgress = {
  completed_pathways: 0,
  total_pathways: 6,
  completed_lessons: 0,
  total_lessons: 45,
  current_streak: 0,
  longest_streak: 0,
  total_points: 0,
  weekly_goal: 80,
  weekly_progress: 0,
  badges_count: 0,
};

export function TrainingLibraryClient() {
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultProgress);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [certificateDownloads, setCertificateDownloads] = useState<Record<string, CertificateDownload>>({});
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [assignmentViewerEmail, setAssignmentViewerEmail] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignmentModule, setAssignmentModule] = useState<{ id: string; title: string } | null>(null);
  const [assignee, setAssignee] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const pathways = learningPathways;
  const allModules = getAllTrainingModules();
  const moduleMatchesQuery = useCallback((module: { id?: string; title?: string; description?: string; category?: string; difficulty?: string; targetPersonas?: string[] }) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      module.id,
      module.title,
      module.description,
      module.category,
      module.difficulty,
      ...(module.targetPersonas || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }, [searchQuery]);

  const filteredModules = useMemo(() => {
    return allModules.filter((module) => {
      const personaMatch = selectedPersona === "all"
        ? true
        : Array.isArray(module.targetPersonas) && module.targetPersonas.includes(selectedPersona);
      return personaMatch && moduleMatchesQuery(module);
    });
  }, [allModules, selectedPersona, moduleMatchesQuery]);

  const filteredFeaturedModules = useMemo(() => {
    if (!searchQuery.trim()) return featuredModules.slice(0, 3);
    return featuredModules.filter((module) => moduleMatchesQuery(module)).slice(0, 3);
  }, [searchQuery, moduleMatchesQuery]);

  const visibleModuleIds = useMemo(() => filteredModules.map((module) => module.id), [filteredModules]);
  const weeklyGoal = Math.max(userProgress.weekly_goal, 0);
  const weeklyProgress = Math.max(userProgress.weekly_progress, 0);
  const weeklyPercent = weeklyGoal > 0 ? Math.round((weeklyProgress / weeklyGoal) * 100) : 0;
  const weeklyPercentDisplay = Math.min(weeklyPercent, 100);
  const weeklyProgressValue = weeklyGoal > 0 ? Math.min((weeklyProgress / weeklyGoal) * 100, 100) : 0;

  // Fetch user progress from API
  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await fetch("/api/training/progress");
        if (response.ok) {
          const data = await response.json();
          setUserProgress({
            completed_pathways: data.completed_pathways || 0,
            total_pathways: data.total_pathways || 6,
            completed_lessons: data.completed_lessons || 0,
            total_lessons: data.total_lessons || 45,
            current_streak: data.current_streak || 0,
            longest_streak: data.longest_streak || 0,
            total_points: data.total_points || 0,
            weekly_goal: data.weekly_goal || 80,
            weekly_progress: data.weekly_progress || 0,
            badges_count: data.badges_count || 0,
          });
        }
      } catch (error) {
        console.error("Failed to load training progress:", error);
      }
    }
    loadProgress();
  }, []);

  useEffect(() => {
    async function loadModuleProgress() {
      try {
        const response = await fetch("/api/training/modules");
        if (!response.ok) return;
        const data = await response.json();
        const progressMap: Record<string, ModuleProgress> = {};
        (data.modules || []).forEach((module: ModuleProgress) => {
          if (module?.module_id) {
            progressMap[module.module_id] = module;
          }
        });
        setModuleProgress(progressMap);
      } catch (error) {
        console.error("Failed to load module progress:", error);
      }
    }

    loadModuleProgress();
  }, []);

  useEffect(() => {
    async function loadCertificateDownloads() {
      try {
        const response = await fetch("/api/training/certificates");
        if (!response.ok) return;
        const data = await response.json();
        const downloadMap: Record<string, CertificateDownload> = {};
        (data.certificates || []).forEach((cert: CertificateDownload) => {
          if (cert?.module_id) {
            downloadMap[cert.module_id] = cert;
          }
        });
        setCertificateDownloads(downloadMap);
      } catch (error) {
        console.error("Failed to load certificate downloads:", error);
      }
    }

    loadCertificateDownloads();
  }, []);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const response = await fetch("/api/training/assignments?scope=all");
        if (!response.ok) return;
        const data = await response.json();
        setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
        setAssignmentViewerEmail(typeof data.viewerEmail === "string" ? data.viewerEmail : null);
      } catch (error) {
        console.error("Failed to load training assignments:", error);
      }
    }

    loadAssignments();
  }, []);

  const { continueModuleId, continueLabel } = useMemo(() => {
    const inProgress = Object.values(moduleProgress)
      .filter((module) => module.status === "in_progress")
      .sort((a, b) => {
        const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
        const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
        return bTime - aTime;
      });
    if (inProgress.length) {
      return { continueModuleId: inProgress[0].module_id, continueLabel: "Resume Learning" };
    }
    return { continueModuleId: "aml-fundamentals", continueLabel: "Continue Learning" };
  }, [moduleProgress]);

  const moduleTitleById = useMemo(() => {
    const entries = allModules.map((module) => [module.id, module.title] as const);
    return Object.fromEntries(entries);
  }, [allModules]);

  const assignmentCounts = useMemo(() => {
    return assignments.reduce<Record<string, number>>((acc, assignment) => {
      if (!assignment.module_id) return acc;
      acc[assignment.module_id] = (acc[assignment.module_id] || 0) + 1;
      return acc;
    }, {});
  }, [assignments]);

  const assignmentsAssignedBy = useMemo(() => {
    if (!assignmentViewerEmail) return assignments;
    return assignments.filter((assignment) => assignment.assigned_by === assignmentViewerEmail);
  }, [assignments, assignmentViewerEmail]);

  const assignmentsAssignedTo = useMemo(() => {
    if (!assignmentViewerEmail) return [];
    return assignments.filter((assignment) => assignment.assigned_to === assignmentViewerEmail);
  }, [assignments, assignmentViewerEmail]);

  const assignmentContextByModule = useMemo(() => {
    const context: Record<string, { assignedToYou: boolean; assignees: string[] }> = {};
    assignments.forEach((assignment) => {
      if (!assignment.module_id) return;
      const entry = context[assignment.module_id] || { assignedToYou: false, assignees: [] };
      if (assignmentViewerEmail && assignment.assigned_to === assignmentViewerEmail) {
        entry.assignedToYou = true;
      }
      if (assignmentViewerEmail && assignment.assigned_by === assignmentViewerEmail && assignment.assigned_to) {
        if (!entry.assignees.includes(assignment.assigned_to)) {
          entry.assignees.push(assignment.assigned_to);
        }
      }
      context[assignment.module_id] = entry;
    });
    return context;
  }, [assignments, assignmentViewerEmail]);

  const getAssignmentNote = (moduleId: string) => {
    const context = assignmentContextByModule[moduleId];
    if (!context) return undefined;
    const assigneeCount = context.assignees.length;
    if (context.assignedToYou && assigneeCount) {
      const extra = assigneeCount > 1 ? ` +${assigneeCount - 1}` : "";
      return `Assigned to you · Assigned to ${context.assignees[0]}${extra}`;
    }
    if (context.assignedToYou) return "Assigned to you";
    if (assigneeCount) {
      const extra = assigneeCount > 1 ? ` +${assigneeCount - 1}` : "";
      return `Assigned to ${context.assignees[0]}${extra}`;
    }
    return undefined;
  };

  const toggleModuleSelection = (moduleId: string) => {
    setResetError(null);
    setSelectedModuleIds((prev) => (
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    ));
  };

  const allVisibleSelected = visibleModuleIds.length > 0 && visibleModuleIds.every((id) => selectedModuleIds.includes(id));

  const toggleAllVisibleModules = () => {
    if (!visibleModuleIds.length) return;
    setResetError(null);
    setSelectedModuleIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleModuleIds.includes(id));
      }
      const merged = new Set([...prev, ...visibleModuleIds]);
      return Array.from(merged);
    });
  };

  const handleResetSelected = async () => {
    if (!selectedModuleIds.length) return;
    setIsResetting(true);
    setResetError(null);
    const resetIds = [...selectedModuleIds];
    try {
      await Promise.all(resetIds.map(async (moduleId) => {
        const response = await fetch("/api/training/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            status: "not_started",
            progressPercentage: 0,
            score: null,
            maxScore: null,
            timeSpent: 0,
            attempts: 0,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to reset modules.");
        }
      }));

      const nextProgressMap: Record<string, ModuleProgress> = { ...moduleProgress };
      const nowIso = new Date().toISOString();
      resetIds.forEach((moduleId) => {
        nextProgressMap[moduleId] = {
          module_id: moduleId,
          status: "not_started",
          progress_percentage: 0,
          score: null,
          updated_at: nowIso,
        };
      });

      const completedEntries = Object.values(nextProgressMap).filter((entry) => entry.status === "completed");
      const completedLessons = completedEntries.length;
      const totalPoints = completedEntries.reduce((sum, entry) => sum + (typeof entry.score === "number" ? entry.score : 10), 0);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyProgress = completedEntries.reduce((sum, entry) => {
        const updatedAt = entry.updated_at ? Date.parse(entry.updated_at) : 0;
        if (!updatedAt || updatedAt < weekAgo) return sum;
        return sum + (typeof entry.score === "number" ? entry.score : 10);
      }, 0);

      setModuleProgress(nextProgressMap);
      setUserProgress((prev) => ({
        ...prev,
        completed_lessons: completedLessons,
        total_points: totalPoints,
        weekly_progress: weeklyProgress,
      }));
      await fetch("/api/training/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedLessons,
          totalPoints,
          weeklyProgress,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update training progress.");
        }
        return response;
      });
      setSelectedModuleIds([]);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Failed to reset modules.");
    } finally {
      setIsResetting(false);
    }
  };

  const microLessons = sampleMicroLessons;

  const microChallenges = dailyMicroChallenges;
  const simulations = trainingSimulations;


  const personas = {
    'compliance-officer': { name: 'Compliance Officer' },
    'senior-manager': { name: 'Senior Manager' },
    'mlro': { name: 'MLRO' },
    'relationship-manager': { name: 'Relationship Manager' },
    'operations-staff': { name: 'Operations Staff' },
    'customer-service': { name: 'Customer Service' },
    'kyc-specialist': { name: 'KYC Specialist' },
    'certified-person': { name: 'Certified Person' },
    'hr-professional': { name: 'HR Professional' }
  };

  const getPersonaColor = (personaId: string) => {
    const colors: Record<string, string> = {
      'compliance-officer': "bg-blue-50 text-blue-600 border-blue-200",
      'senior-manager': "bg-purple-50 text-purple-600 border-purple-200",
      'mlro': "bg-red-50 text-red-600 border-red-200",
      'relationship-manager': "bg-green-50 text-green-600 border-green-200",
      'operations-staff': "bg-amber-50 text-amber-600 border-amber-200",
      'customer-service': "bg-teal-50 text-teal-600 border-teal-200",
      'kyc-specialist': "bg-slate-50 text-slate-600 border-slate-200",
      'certified-person': "bg-indigo-50 text-indigo-600 border-indigo-200",
      'hr-professional': "bg-pink-50 text-pink-600 border-pink-200"
    };
    return colors[personaId] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mandatory': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'elective': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'specialization': return <Star className="h-4 w-4 text-amber-500" />;
      default: return <Target className="h-4 w-4 text-slate-500" />;
    }
  };

  const formatModuleCategory = (category?: string) => {
    const labels: Record<string, string> = {
      "financial-crime-prevention": "Financial Crime",
      "regulatory-compliance": "Regulatory",
      "customer-protection": "Customer Protection",
      "operational-risk": "Operational Risk",
    };
    if (!category) return "General";
    return labels[category] || category.replace(/-/g, " ");
  };

  const formatAssignmentDueDate = (dueDate?: string | null) => {
    if (!dueDate) return "No due date";
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) return "No due date";
    return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const openAssignDialog = (moduleId: string) => {
    const trainingMod = allModules.find((item) => item.id === moduleId) || featuredModules.find((item) => item.id === moduleId);
    setAssignmentModule({ id: moduleId, title: trainingMod?.title || "Training Module" });
    setAssignee("");
    setAssignmentDueDate("");
    setAssignmentNotes("");
    setAssignError(null);
    setIsAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!assignmentModule) return;
    if (!assignee.trim()) {
      setAssignError("Assignee is required.");
      return;
    }
    setIsAssigning(true);
    setAssignError(null);
    try {
      const response = await fetch("/api/training/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: assignmentModule.id,
          assignedTo: assignee.trim(),
          dueDate: assignmentDueDate || null,
          notes: assignmentNotes.trim() || null,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to assign training.");
      }
      const assignment = (await response.json()) as TrainingAssignment;
      setAssignments((prev) => [assignment, ...prev]);
      setIsAssignDialogOpen(false);
    } catch (error) {
      setAssignError(error instanceof Error ? error.message : "Failed to assign training.");
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredPathways = Object.values(pathways).filter(pathway => {
    const categoryMatch = selectedCategory === "all" || pathway.category === selectedCategory;
    const personaMatch = selectedPersona === "all" || pathway.targetRoles.includes(selectedPersona);
    return categoryMatch && personaMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">Training Library</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Interactive Learning & Competency Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Outcomes-focused, role-based learning that proves competency through practice.
            Built for rapid regulatory updates with micro-learning architecture.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50">
            <TrendingUp className="mr-1 h-3 w-3" />
            {weeklyProgress} pts this week
          </Badge>
          <Button className="bg-teal-600 hover:bg-teal-700" asChild>
            <a href={`/training-library/lesson/${continueModuleId}`}>
              <Play className="mr-2 h-4 w-4" />
              {continueLabel}
            </a>
          </Button>
        </div>
      </header>

      {/* Learning Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border border-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pathways Complete</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {userProgress.completed_pathways}/{userProgress.total_pathways}
                </p>
                <p className="text-xs text-slate-500 mt-1">Learning paths</p>
              </div>
              <div className="p-3 rounded-xl bg-teal-50">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Streak</p>
                <p className="text-2xl font-semibold text-slate-900">{userProgress.current_streak}</p>
                <p className="text-xs text-slate-500 mt-1">Days in a row</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Points Earned</p>
                <p className="text-2xl font-semibold text-slate-900">{userProgress.total_points}</p>
                <p className="text-xs text-slate-500 mt-1">Total points</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Badges Earned</p>
                <p className="text-2xl font-semibold text-slate-900">{userProgress.badges_count}</p>
                <p className="text-xs text-slate-500 mt-1">Achievements</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="border border-slate-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Weekly Learning Goal</CardTitle>
              <CardDescription>Track your weekly learning progress</CardDescription>
            </div>
            <Badge className="bg-teal-600 hover:bg-teal-700">
              {weeklyPercentDisplay}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={weeklyProgressValue} className="h-3" />
          <div className="flex justify-between text-sm text-slate-500 mt-2">
            <span>{weeklyProgress} points this week</span>
            <span>Goal: {weeklyGoal} points</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="pathways" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pathways">Learning Pathways</TabsTrigger>
          <TabsTrigger value="microlearning">Micro-Learning</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
          <TabsTrigger value="gamification">
            <Crown className="mr-1 h-3 w-3" />
            Gamification
          </TabsTrigger>
          <TabsTrigger value="social">
            <MessageSquare className="mr-1 h-3 w-3" />
            Social Learning
          </TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="pathways" className="space-y-6">
          {/* Filters */}
          <Card className="border border-slate-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Filter by Role:</span>
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="text-sm border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="all">All Roles</option>
                    {Object.entries(personas).map(([id, persona]) => (
                      <option key={id} value={id}>{persona.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-sm border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="all">All Categories</option>
                    <option value="mandatory">Mandatory</option>
                    <option value="elective">Elective</option>
                    <option value="specialization">Specialization</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Search:</span>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search modules"
                      className="h-9 w-56 pl-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card className="border border-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Training Assignments</CardTitle>
                  <CardDescription>Track who is assigned each module and what’s assigned to you.</CardDescription>
                </div>
                <Badge variant="outline" className="text-slate-600 border-slate-200">
                  {assignments.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Assigned by me</p>
                  {assignmentsAssignedBy.length ? (
                    assignmentsAssignedBy.slice(0, 5).map((assignment) => (
                      <div key={assignment.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="min-w-0">
                          <a
                            href={`/training-library/lesson/${assignment.module_id}`}
                            className="block truncate text-sm font-medium text-slate-800 hover:underline"
                          >
                            {moduleTitleById[assignment.module_id] || assignment.module_id}
                          </a>
                          <p className="text-xs text-slate-500">
                            Assigned to {assignment.assigned_to} · {formatAssignmentDueDate(assignment.due_date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {assignment.status || "assigned"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No assignments created yet.</p>
                  )}
                  {assignmentsAssignedBy.length > 5 ? (
                    <p className="text-xs text-slate-500">Showing 5 of {assignmentsAssignedBy.length} assignments.</p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Assigned to me</p>
                  {assignmentsAssignedTo.length ? (
                    assignmentsAssignedTo.slice(0, 5).map((assignment) => (
                      <div key={assignment.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="min-w-0">
                          <a
                            href={`/training-library/lesson/${assignment.module_id}`}
                            className="block truncate text-sm font-medium text-slate-800 hover:underline"
                          >
                            {moduleTitleById[assignment.module_id] || assignment.module_id}
                          </a>
                          <p className="text-xs text-slate-500">
                            Assigned by {assignment.assigned_by} · {formatAssignmentDueDate(assignment.due_date)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {assignment.status || "assigned"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No assignments due for you yet.</p>
                  )}
                  {assignmentsAssignedTo.length > 5 ? (
                    <p className="text-xs text-slate-500">Showing 5 of {assignmentsAssignedTo.length} assignments.</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Training Content */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Featured Training</h2>
                <p className="text-sm text-slate-500">Start with our most popular modules</p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredFeaturedModules.map((module) => (
                <PlayfulModuleCard
                  key={module.id}
                  id={module.id}
                  title={module.title}
                  description={module.description}
                  category={(module as { category?: string }).category || ""}
                  duration={module.duration}
                  difficulty={(module.difficulty as "beginner" | "intermediate" | "advanced") || "beginner"}
                  progress={moduleProgress[module.id]}
                  certificate={certificateDownloads[module.id]}
                  assignmentCount={assignmentCounts[module.id]}
                  assignmentNote={getAssignmentNote(module.id)}
                  onAssign={openAssignDialog}
                />
              ))}
            </div>
          </div>

          {/* Module Library */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">All Modules</h2>
                <p className="text-sm text-slate-500">{filteredModules.length} training modules available</p>
              </div>
              <div className="flex items-center gap-2">
                {viewMode === "table" ? (
                  <Badge variant="outline" className="text-slate-600 border-slate-200">
                    {selectedModuleIds.length} selected
                  </Badge>
                ) : null}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "cards" ? "default" : "ghost"}
                    className="h-8"
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="mr-1 h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "table" ? "default" : "ghost"}
                    className="h-8"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="mr-1 h-4 w-4" />
                    Table
                  </Button>
                </div>
                {viewMode === "table" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleResetSelected}
                    disabled={!selectedModuleIds.length || isResetting}
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Restarting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restart Selected
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
            {filteredModules.length ? (
              viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredModules.map((module) => (
                    <PlayfulModuleCard
                      key={module.id}
                      id={module.id}
                      title={module.title}
                      description={module.description}
                      category={module.category || ""}
                      duration={module.duration ?? 0}
                      difficulty={(module.difficulty as "beginner" | "intermediate" | "advanced") || "beginner"}
                      progress={moduleProgress[module.id]}
                      certificate={certificateDownloads[module.id]}
                      assignmentCount={assignmentCounts[module.id]}
                      assignmentNote={getAssignmentNote(module.id)}
                      onAssign={openAssignDialog}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleAllVisibleModules}
                              className="h-4 w-4"
                            />
                          </th>
                          <th className="px-3 py-3 text-left">Module</th>
                          <th className="px-3 py-3 text-left">Category</th>
                          <th className="px-3 py-3 text-left">Duration</th>
                          <th className="px-3 py-3 text-left">Difficulty</th>
                          <th className="px-3 py-3 text-left">Progress</th>
                          <th className="px-3 py-3 text-left">Assignments</th>
                          <th className="px-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredModules.map((module) => {
                          const progress = moduleProgress[module.id];
                          const progressPercent = progress?.progress_percentage ?? 0;
                          const status = progress?.status ?? "not_started";
                          const statusLabel = status.replace("_", " ");
                          const actionLabel = status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Start";
                          const assignedLabel = getAssignmentNote(module.id) || (assignmentCounts[module.id] ? `${assignmentCounts[module.id]} assigned` : "—");

                          return (
                            <tr key={module.id} className="border-t border-slate-100">
                              <td className="px-3 py-4 align-top">
                                <input
                                  type="checkbox"
                                  checked={selectedModuleIds.includes(module.id)}
                                  onChange={() => toggleModuleSelection(module.id)}
                                  className="h-4 w-4"
                                />
                              </td>
                              <td className="px-3 py-4">
                                <div className="font-medium text-slate-900">{module.title}</div>
                                <div className="text-xs text-slate-500 line-clamp-1">{module.description}</div>
                              </td>
                              <td className="px-3 py-4 text-slate-600">
                                {formatModuleCategory(module.category)}
                              </td>
                              <td className="px-3 py-4 text-slate-600">{module.duration} min</td>
                              <td className="px-3 py-4">
                                <Badge variant="secondary" className="text-xs">
                                  {module.difficulty || "Beginner"}
                                </Badge>
                              </td>
                              <td className="px-3 py-4">
                                <div className="text-xs capitalize text-slate-500">{statusLabel}</div>
                                <Progress value={progressPercent} className="mt-2 h-1.5" />
                              </td>
                              <td className="px-3 py-4 text-xs text-slate-500">{assignedLabel}</td>
                              <td className="px-3 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openAssignDialog(module.id)}>
                                    Assign
                                  </Button>
                                  <Button size="sm" asChild className="bg-teal-600 hover:bg-teal-700">
                                    <a href={`/training-library/lesson/${module.id}`}>{actionLabel}</a>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {resetError ? (
                    <div className="border-t border-slate-100 px-4 py-3 text-sm text-rose-600">
                      {resetError}
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <Card className="border border-slate-100">
                <CardContent className="p-6 text-sm text-slate-500">
                  No modules match &quot;{searchQuery.trim() || "your filters"}&quot;.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Learning Pathways Grid */}
          <div className="grid gap-6">
            {filteredPathways.map((pathway) => (
              <Card key={pathway.id} className="border border-slate-100 hover:border-slate-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getCategoryIcon(pathway.category)}
                        <h3 className="font-semibold text-slate-900 text-lg">{pathway.title}</h3>
                        <Badge className={
                          pathway.category === 'mandatory' ? 'bg-red-500' :
                          pathway.category === 'elective' ? 'bg-blue-500' : 'bg-amber-500'
                        }>
                          {pathway.category}
                        </Badge>
                      </div>

                      <p className="text-slate-600 mb-4">{pathway.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {pathway.estimatedDuration} minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <BookOpen className="h-4 w-4" />
                          {pathway.modules.length} modules
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Users className="h-4 w-4" />
                          {pathway.targetRoles.length} target roles
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Learning Outcomes:</h4>
                        <ul className="space-y-1">
                          {pathway.outcomes.map((outcome, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-700">Target Roles:</span>
                        {pathway.targetRoles.map((roleId) => (
                          <Badge
                            key={roleId}
                            variant="outline"
                            className={getPersonaColor(roleId)}
                          >
                            {(personas as Record<string, { name: string }>)[roleId]?.name || roleId}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">Progress</div>
                        <div className="text-2xl font-bold text-teal-600">0%</div>
                        <div className="text-xs text-slate-500">Not started</div>
                      </div>
                      <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                        <a href={`/training-library/lesson/${pathway.modules[0]}`}>
                          Start Pathway
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="microlearning" className="space-y-6">
          <div className="grid gap-4">
            {microLessons.map((lesson) => (
              <Card key={lesson.id} className="border border-slate-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lesson.duration} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          Micro-learning
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="font-medium text-blue-700">Hook</div>
                          <div className="text-blue-600">{lesson.components?.hook?.duration ?? 0}min</div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded">
                          <div className="font-medium text-emerald-700">Content</div>
                          <div className="text-emerald-600">{lesson.components?.content?.duration ?? 0}min</div>
                        </div>
                        <div className="bg-amber-50 p-2 rounded">
                          <div className="font-medium text-amber-700">Practice</div>
                          <div className="text-amber-600">{lesson.components?.practice?.duration ?? 0}min</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="font-medium text-purple-700">Summary</div>
                          <div className="text-purple-600">{lesson.components?.summary?.duration ?? 0}min</div>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                      <a href={`/training-library/lesson/${lesson.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Lesson
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-6">
          <div className="grid gap-6">
            {simulations.map((simulation) => (
              <Card key={simulation.id} className="border border-slate-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Gamepad2 className="h-5 w-5 text-teal-600" />
                        <h3 className="font-semibold text-slate-900 text-lg">{simulation.title}</h3>
                        <Badge className={
                          simulation.difficulty === 'beginner' ? 'bg-green-500' :
                          simulation.difficulty === 'intermediate' ? 'bg-amber-500' : 'bg-red-500'
                        }>
                          {simulation.difficulty}
                        </Badge>
                      </div>

                      <p className="text-slate-600 mb-4">{simulation.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {simulation.estimatedDuration} minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Target className="h-4 w-4" />
                          Pass: {simulation.scoring.passingScore}/{simulation.scoring.maxScore}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Brain className="h-4 w-4" />
                          Interactive Practice
                        </div>
                      </div>

                      {Array.isArray((simulation.features as Record<string, unknown>).documentTypes) && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Practice Materials:</h4>
                          <div className="flex flex-wrap gap-2">
                            {((simulation.features as Record<string, unknown>).documentTypes as string[]).map((type: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">Best Score</div>
                        <div className="text-2xl font-bold text-teal-600">-</div>
                        <div className="text-xs text-slate-500">Not attempted</div>
                      </div>
                      <Button className="bg-teal-600 hover:bg-teal-700" asChild>
                        <a href={`/training-library/lesson/${simulation.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Launch Simulation
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <Card className="border border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Daily Risk Spotter
              </CardTitle>
              <CardDescription>
                2-minute daily challenges to keep your compliance skills sharp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {microChallenges.map((challenge) => (
                  <div key={challenge.id} className="border border-slate-100 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">{challenge.title}</h4>
                          <Badge className={
                            challenge.difficulty === 'easy' ? 'bg-green-500' :
                            challenge.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                          }>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>⏱️ {challenge.timeLimit}s</span>
                          <span>🎯 {challenge.points} points</span>
                          <span>📋 {challenge.regulatoryArea}</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700" asChild>
                        <a href={`/training-library/lesson/${challenge.id}`}>
                          Take Challenge
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-6">
          <GamificationHub />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialLearning />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressTracker />
        </TabsContent>
      </Tabs>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              {assignmentModule?.title ? `Assign “${assignmentModule.title}” to a learner.` : "Assign this training module."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="training-assignee">Assignee</Label>
              <Input
                id="training-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Name or email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="training-due-date">Due date</Label>
              <Input
                id="training-due-date"
                type="date"
                value={assignmentDueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="training-notes">Notes</Label>
              <Textarea
                id="training-notes"
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Optional context or priority"
                rows={3}
              />
            </div>
            {assignError ? <p className="text-sm text-rose-600">{assignError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!assignee.trim() || isAssigning}>
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
