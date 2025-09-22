"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Play,
  Target,
  Clock,
  Award,
  TrendingUp,
  Users,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  Star,
  Trophy,
  Gamepad2,
  MessageSquare,
  Crown,
  Shield
} from "lucide-react";
import { featuredModules, learningPathways, getAllTrainingModules, getModulesByCategory } from "./content";
import { GamificationHub } from "./components/GamificationHub";
import { SocialLearning } from "./components/SocialLearning";
import { ProgressTracker } from "./components/ProgressTracker";

export function TrainingLibraryClient() {
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allModules = getAllTrainingModules();
  const pathways = learningPathways;

  // Mock data for micro-learning components
  const microLessons = [
    {
      id: 'ml-1',
      title: 'Quick KYC Review',
      duration: 3,
      components: {
        hook: { duration: 0.5 },
        content: { duration: 1.5 },
        practice: { duration: 0.5 },
        summary: { duration: 0.5 }
      }
    },
    {
      id: 'ml-2',
      title: 'Sanctions Screening Basics',
      duration: 4,
      components: {
        hook: { duration: 0.5 },
        content: { duration: 2 },
        practice: { duration: 1 },
        summary: { duration: 0.5 }
      }
    }
  ];

  const microChallenges = [
    {
      id: 'mc-1',
      title: 'Spot the Red Flag',
      difficulty: 'easy',
      timeLimit: 60,
      points: 50,
      regulatoryArea: 'AML'
    },
    {
      id: 'mc-2',
      title: 'PEP Identification',
      difficulty: 'medium',
      timeLimit: 90,
      points: 75,
      regulatoryArea: 'KYC'
    }
  ];

  const simulations = [
    {
      id: 'sim-1',
      title: 'Customer Onboarding Simulation',
      description: 'Practice complete customer onboarding with documentation review',
      difficulty: 'intermediate',
      estimatedDuration: 15,
      scoring: { maxScore: 100, passingScore: 80 },
      features: {
        documentTypes: ['Passport', 'Utility Bill', 'Bank Statement']
      }
    }
  ];

  // Mock user progress data
  const userProgress = {
    completedPathways: 2,
    totalPathways: 6,
    completedLessons: 24,
    totalLessons: 45,
    currentStreak: 7,
    totalPoints: 2450,
    badges: 8,
    weeklyGoal: 80,
    weeklyProgress: 65
  };

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
            {userProgress.weeklyProgress}% Weekly Goal
          </Badge>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Play className="mr-2 h-4 w-4" />
            Continue Learning
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
                  {userProgress.completedPathways}/{userProgress.totalPathways}
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
                <p className="text-2xl font-semibold text-slate-900">{userProgress.currentStreak}</p>
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
                <p className="text-2xl font-semibold text-slate-900">{userProgress.totalPoints}</p>
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
                <p className="text-2xl font-semibold text-slate-900">{userProgress.badges}</p>
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
              {userProgress.weeklyProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={userProgress.weeklyProgress} className="h-3" />
          <div className="flex justify-between text-sm text-slate-500 mt-2">
            <span>{userProgress.weeklyProgress} minutes this week</span>
            <span>Goal: {userProgress.weeklyGoal} minutes</span>
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
              </div>
            </CardContent>
          </Card>

          {/* Featured Training Content */}
          <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Star className="h-5 w-5" />
                Featured Training Content
              </CardTitle>
              <CardDescription>Beautifully designed, interactive training modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredModules.slice(0, 3).map((module) => {
                  const getIconComponent = (iconName: string) => {
                    switch (iconName) {
                      case 'alert-circle': return AlertCircle;
                      case 'users': return Users;
                      case 'shield': return Shield;
                      case 'crown': return Crown;
                      case 'file-text': return BookOpen;
                      case 'award': return Award;
                      default: return Target;
                    }
                  };

                  const IconComponent = getIconComponent(module.icon);
                  const colorClasses = {
                    red: 'bg-red-100 text-red-600',
                    blue: 'bg-blue-100 text-blue-600',
                    orange: 'bg-orange-100 text-orange-600',
                    purple: 'bg-purple-100 text-purple-600',
                    green: 'bg-green-100 text-green-600',
                    indigo: 'bg-indigo-100 text-indigo-600'
                  }[module.color] || 'bg-gray-100 text-gray-600';

                  return (
                    <div key={module.id} className="p-4 bg-white rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{module.title}</h4>
                          <p className="text-sm text-slate-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{module.duration} min</span>
                          <span className="capitalize">{module.difficulty}</span>
                          <span>+{module.points} points</span>
                        </div>
                        <Button size="sm" asChild>
                          <a href={`/training-library/lesson/${module.id}`}>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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
                            {personas[roleId]?.name || roleId}
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
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        Start Pathway
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
                          <div className="text-blue-600">{lesson.components.hook.duration}min</div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded">
                          <div className="font-medium text-emerald-700">Content</div>
                          <div className="text-emerald-600">{lesson.components.content.duration}min</div>
                        </div>
                        <div className="bg-amber-50 p-2 rounded">
                          <div className="font-medium text-amber-700">Practice</div>
                          <div className="text-amber-600">{lesson.components.practice.duration}min</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="font-medium text-purple-700">Summary</div>
                          <div className="text-purple-600">{lesson.components.summary.duration}min</div>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Play className="mr-2 h-4 w-4" />
                      Start Lesson
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

                      {simulation.features.documentTypes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Practice Materials:</h4>
                          <div className="flex flex-wrap gap-2">
                            {simulation.features.documentTypes.map((type: string, index: number) => (
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
                      <Button className="bg-teal-600 hover:bg-teal-700">
                        <Play className="mr-2 h-4 w-4" />
                        Launch Simulation
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
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                        Take Challenge
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
    </div>
  );
}