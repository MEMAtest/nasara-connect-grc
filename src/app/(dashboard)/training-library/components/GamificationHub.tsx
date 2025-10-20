"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Zap,
  Target,
  Crown,
  Users,
  Calendar,
  CheckCircle2,
  Rocket,
  Shield,
  Brain,
  BookOpen
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedDate?: string;
  category: 'learning' | 'engagement' | 'social' | 'mastery';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface Leaderboard {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  badges: number;
  streak: number;
  persona: string;
}

interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  completedLessons: number;
  earnedBadges: number;
  rank: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function GamificationHub() {
  const [userStats] = useState<UserStats>({
    currentStreak: 7,
    longestStreak: 14,
    totalPoints: 2450,
    level: 8,
    pointsToNextLevel: 350,
    completedLessons: 32,
    earnedBadges: 12,
    rank: 3,
    weeklyGoal: 5,
    weeklyProgress: 3
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: 'first-lesson',
      title: 'Getting Started',
      description: 'Complete your first micro-lesson',
      icon: <BookOpen className="h-6 w-6" />,
      earned: true,
      earnedDate: '2024-01-15',
      category: 'learning',
      rarity: 'common',
      points: 50
    },
    {
      id: 'week-streak',
      title: 'Consistent Learner',
      description: 'Maintain a 7-day learning streak',
      icon: <Flame className="h-6 w-6" />,
      earned: true,
      earnedDate: '2024-01-22',
      category: 'engagement',
      rarity: 'rare',
      points: 200
    },
    {
      id: 'perfect-score',
      title: 'Perfectionist',
      description: 'Score 100% on 5 assessments',
      icon: <Star className="h-6 w-6" />,
      earned: true,
      earnedDate: '2024-01-20',
      category: 'mastery',
      rarity: 'epic',
      points: 500
    },
    {
      id: 'scenario-master',
      title: 'Scenario Master',
      description: 'Complete 10 branching scenarios perfectly',
      icon: <Brain className="h-6 w-6" />,
      earned: false,
      category: 'mastery',
      rarity: 'legendary',
      points: 1000
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete lessons before 9 AM for 5 days',
      icon: <Rocket className="h-6 w-6" />,
      earned: false,
      category: 'engagement',
      rarity: 'rare',
      points: 300
    },
    {
      id: 'compliance-champion',
      title: 'Compliance Champion',
      description: 'Master all FCA Authorization modules',
      icon: <Shield className="h-6 w-6" />,
      earned: true,
      earnedDate: '2024-01-18',
      category: 'learning',
      rarity: 'epic',
      points: 750
    }
  ]);

  const [leaderboard] = useState<Leaderboard[]>([
    {
      rank: 1,
      name: 'Sarah Chen',
      avatar: '👩‍💼',
      points: 3420,
      badges: 18,
      streak: 12,
      persona: 'Compliance Officer'
    },
    {
      rank: 2,
      name: 'Marcus Rodriguez',
      avatar: '👨‍💼',
      points: 2890,
      badges: 15,
      streak: 8,
      persona: 'Risk Analyst'
    },
    {
      rank: 3,
      name: 'You',
      avatar: '👤',
      points: 2450,
      badges: 12,
      streak: 7,
      persona: 'Operations Manager'
    },
    {
      rank: 4,
      name: 'Lisa Thompson',
      avatar: '👩‍💼',
      points: 2340,
      badges: 14,
      streak: 5,
      persona: 'Compliance Officer'
    },
    {
      rank: 5,
      name: 'David Kim',
      avatar: '👨‍💼',
      points: 2190,
      badges: 11,
      streak: 9,
      persona: 'Customer Advisor'
    }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return 'shadow-lg shadow-blue-200/50';
      case 'epic':
        return 'shadow-lg shadow-purple-200/50';
      case 'legendary':
        return 'shadow-xl shadow-amber-200/70';
      default:
        return '';
    }
  };

  const getLevelProgress = () => {
    const totalPointsForLevel = 500; // Points needed per level
    const currentLevelPoints = userStats.totalPoints % totalPointsForLevel;
    return (currentLevelPoints / totalPointsForLevel) * 100;
  };

  const getWeeklyProgress = () => {
    return (userStats.weeklyProgress / userStats.weeklyGoal) * 100;
  };

  return (
    <div className="space-y-8">
      {/* User Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Crown className="h-12 w-12 text-amber-600" />
                <Badge className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs px-1">
                  {userStats.level}
                </Badge>
              </div>
            </div>
            <h3 className="font-semibold text-amber-900">Level {userStats.level}</h3>
            <p className="text-sm text-amber-700 mb-3">{userStats.pointsToNextLevel} points to next level</p>
            <Progress value={getLevelProgress()} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6 text-center">
            <Flame className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-orange-900">{userStats.currentStreak} Day Streak</h3>
            <p className="text-sm text-orange-700">Longest: {userStats.longestStreak} days</p>
            <Badge className="mt-2 bg-orange-600 text-white">
              Keep it up! 🔥
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-900">{userStats.totalPoints.toLocaleString()}</h3>
            <p className="text-sm text-blue-700">Total Points</p>
            <Badge className="mt-2 bg-blue-600 text-white">
              Rank #{userStats.rank}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="font-semibold text-emerald-900">Weekly Goal</h3>
            <p className="text-sm text-emerald-700 mb-3">
              {userStats.weeklyProgress}/{userStats.weeklyGoal} lessons
            </p>
            <Progress value={getWeeklyProgress()} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-amber-600" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements
                    .filter(a => a.earned)
                    .sort((a, b) => new Date(b.earnedDate!).getTime() - new Date(a.earnedDate!).getTime())
                    .slice(0, 3)
                    .map(achievement => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-4 p-4 border rounded-lg ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)}`}
                      >
                        <div className="flex-shrink-0">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm opacity-80">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              +{achievement.points} pts
                            </Badge>
                            <span className="text-xs opacity-60">
                              {new Date(achievement.earnedDate!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Towards Next Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Next Achievements
                </CardTitle>
                <CardDescription>What you're working towards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements
                    .filter(a => !a.earned)
                    .slice(0, 3)
                    .map(achievement => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg opacity-75"
                      >
                        <div className="flex-shrink-0 grayscale">
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-700">{achievement.title}</h4>
                          <p className="text-sm text-slate-600">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              +{achievement.points} pts
                            </Badge>
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Achievements Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <CardDescription>
                {achievements.filter(a => a.earned).length}/{achievements.length} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`relative p-4 border rounded-lg text-center transition-all hover:scale-105 ${
                      achievement.earned
                        ? `${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)}`
                        : 'border-slate-200 bg-slate-50 opacity-50 grayscale'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      {achievement.icon}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs opacity-80 mb-2">{achievement.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.points}
                    </Badge>
                    {achievement.earned && (
                      <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                Weekly Leaderboard
              </CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      user.name === 'You'
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {user.rank <= 3 ? (
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.rank === 1
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                : user.rank === 2
                                ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                                : 'bg-gradient-to-r from-orange-400 to-orange-600'
                            }`}
                          >
                            {user.rank}
                          </div>
                          {user.rank === 1 && (
                            <Crown className="absolute -top-2 -right-1 h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {user.rank}
                        </div>
                      )}
                    </div>

                    <div className="text-2xl">{user.avatar}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{user.name}</h4>
                        {user.name === 'You' && (
                          <Badge className="bg-blue-600 text-white text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{user.persona}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-slate-900">{user.points.toLocaleString()}</div>
                          <div className="text-xs text-slate-600">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-amber-600">{user.badges}</div>
                          <div className="text-xs text-slate-600">Badges</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600 flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            {user.streak}
                          </div>
                          <div className="text-xs text-slate-600">Streak</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Zap className="h-5 w-5" />
                  Daily Challenge
                </CardTitle>
                <CardDescription>Complete today's challenge for bonus points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-purple-900 mb-2">
                      Spot the Compliance Issue
                    </h4>
                    <p className="text-sm text-purple-700 mb-4">
                      Review a social media post and identify potential regulatory concerns
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-600 text-white">+150 points</Badge>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Start Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Calendar className="h-5 w-5" />
                  Weekly Quest
                </CardTitle>
                <CardDescription>Complete this week's learning quest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">
                      Master Consumer Duty
                    </h4>
                    <p className="text-sm text-emerald-700 mb-4">
                      Complete all Consumer Duty modules this week
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-emerald-700">Progress</span>
                        <span className="text-sm font-medium">3/5 modules</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-600 text-white">+500 points</Badge>
                      <Button size="sm" variant="outline">
                        Continue Quest
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team Challenges
              </CardTitle>
              <CardDescription>Collaborate with your colleagues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Operations Team Challenge
                  </h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Complete 50 collective lessons as a team this month
                  </p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700">Team Progress</span>
                      <span className="text-sm font-medium">32/50 lessons</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                  <Badge className="bg-blue-600 text-white">+200 points each</Badge>
                </div>

                <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2">
                    Compliance Department Race
                  </h4>
                  <p className="text-sm text-amber-700 mb-4">
                    Compete with other departments for the highest completion rate
                  </p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-700">Department Rank</span>
                      <span className="text-sm font-medium">#2 of 5</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <Badge className="bg-amber-600 text-white">Trophy at stake!</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
