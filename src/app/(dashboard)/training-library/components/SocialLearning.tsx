"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  ThumbsUp,
  Share,
  BookOpen,
  Users,
  Eye,
  Clock,
  Star,
  Award,
  TrendingUp,
  MessageCircle,
  Heart,
  Bookmark,
  Send,
  Filter,
  Search,
  Plus,
  HelpCircle,
  Lightbulb,
  AlertCircle
} from "lucide-react";

interface Discussion {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
    persona: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  views: number;
  tags: string[];
  isLiked: boolean;
  isSaved: boolean;
  category: 'question' | 'insight' | 'discussion' | 'resource';
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  topic: string;
  nextSession: string;
  isJoined: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  avatar: string;
}

interface PeerActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
    persona: string;
  };
  action: 'completed' | 'started' | 'achieved' | 'shared';
  content: string;
  timestamp: string;
  points?: number;
}

export function SocialLearning() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const discussions: Discussion[] = [
    {
      id: '1',
      title: 'Best practices for PEP screening in digital onboarding',
      author: {
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        persona: 'Compliance Officer'
      },
      content: 'I\'ve been working on improving our digital onboarding process and wondering what others have found effective for PEP screening. Our current process feels clunky and I\'m concerned about customer experience vs compliance requirements.',
      timestamp: '2 hours ago',
      likes: 12,
      replies: 8,
      views: 45,
      tags: ['PEP', 'Digital Onboarding', 'Customer Experience'],
      isLiked: false,
      isSaved: true,
      category: 'question'
    },
    {
      id: '2',
      title: 'Consumer Duty implementation lessons learned',
      author: {
        name: 'Marcus Rodriguez',
        avatar: '👨‍💼',
        persona: 'Risk Analyst'
      },
      content: 'After 6 months of Consumer Duty implementation, here are the top 3 things I wish we knew from the start: 1) Start with data collection early, 2) Involve front-line staff in training design, 3) Create clear escalation procedures for edge cases.',
      timestamp: '4 hours ago',
      likes: 24,
      replies: 15,
      views: 89,
      tags: ['Consumer Duty', 'Implementation', 'Lessons Learned'],
      isLiked: true,
      isSaved: false,
      category: 'insight'
    },
    {
      id: '3',
      title: 'Operational resilience testing scenarios - share your examples',
      author: {
        name: 'Lisa Thompson',
        avatar: '👩‍💼',
        persona: 'Operations Manager'
      },
      content: 'Building our 2024 operational resilience testing program. Would love to see what testing scenarios others have used, especially around cyber incidents and third-party failures.',
      timestamp: '1 day ago',
      likes: 8,
      replies: 12,
      views: 67,
      tags: ['Operational Resilience', 'Testing', 'Scenarios'],
      isLiked: false,
      isSaved: false,
      category: 'resource'
    }
  ];

  const studyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'FCA Authorization Masters',
      description: 'Deep dive into authorization requirements and applications',
      members: 12,
      topic: 'FCA Authorization',
      nextSession: 'Tomorrow 2:00 PM',
      isJoined: true,
      difficulty: 'advanced',
      avatar: '📋'
    },
    {
      id: '2',
      name: 'Consumer Duty Practitioners',
      description: 'Real-world implementation stories and best practices',
      members: 18,
      topic: 'Consumer Duty',
      nextSession: 'Friday 10:00 AM',
      isJoined: false,
      difficulty: 'intermediate',
      avatar: '🛡️'
    },
    {
      id: '3',
      name: 'New to Compliance',
      description: 'Support group for those starting their compliance journey',
      members: 25,
      topic: 'Compliance Basics',
      nextSession: 'Next Monday 3:00 PM',
      isJoined: false,
      difficulty: 'beginner',
      avatar: '🌱'
    },
    {
      id: '4',
      name: 'Risk Assessment Experts',
      description: 'Advanced techniques and methodologies',
      members: 8,
      topic: 'Risk Management',
      nextSession: 'Next Wednesday 11:00 AM',
      isJoined: true,
      difficulty: 'advanced',
      avatar: '⚖️'
    }
  ];

  const peerActivity: PeerActivity[] = [
    {
      id: '1',
      user: {
        name: 'David Kim',
        avatar: '👨‍💼',
        persona: 'Customer Advisor'
      },
      action: 'completed',
      content: 'FCA Authorization Essentials pathway',
      timestamp: '30 minutes ago',
      points: 250
    },
    {
      id: '2',
      user: {
        name: 'Emma Wilson',
        avatar: '👩‍💼',
        persona: 'Compliance Officer'
      },
      action: 'achieved',
      content: 'Compliance Champion badge',
      timestamp: '1 hour ago',
      points: 500
    },
    {
      id: '3',
      user: {
        name: 'Alex Zhang',
        avatar: '👨‍💼',
        persona: 'Risk Analyst'
      },
      action: 'shared',
      content: 'insightful comment on Consumer Duty discussion',
      timestamp: '2 hours ago'
    },
    {
      id: '4',
      user: {
        name: 'Sophie Brown',
        avatar: '👩‍💼',
        persona: 'Operations Manager'
      },
      action: 'started',
      content: 'Operational Resilience Framework pathway',
      timestamp: '3 hours ago'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'question':
        return <HelpCircle className="h-4 w-4 text-blue-600" />;
      case 'insight':
        return <Lightbulb className="h-4 w-4 text-amber-600" />;
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-emerald-600" />;
      case 'resource':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'insight':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'discussion':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'resource':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'completed':
        return 'text-emerald-600';
      case 'achieved':
        return 'text-amber-600';
      case 'shared':
        return 'text-blue-600';
      case 'started':
        return 'text-purple-600';
      default:
        return 'text-slate-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <BookOpen className="h-4 w-4" />;
      case 'achieved':
        return <Award className="h-4 w-4" />;
      case 'shared':
        return <Share className="h-4 w-4" />;
      case 'started':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Social Learning</h2>
          <p className="text-slate-600 mt-1">Connect, collaborate, and learn with your peers</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Start Discussion
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
          <TabsTrigger value="activity">Peer Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6">
          {/* Discussion Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search discussions..." className="pl-10" />
                  </div>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedCategory === 'question' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('question')}
                >
                  <HelpCircle className="mr-1 h-3 w-3" />
                  Questions
                </Button>
                <Button
                  variant={selectedCategory === 'insight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('insight')}
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Insights
                </Button>
                <Button
                  variant={selectedCategory === 'resource' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('resource')}
                >
                  <BookOpen className="mr-1 h-3 w-3" />
                  Resources
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New Post */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts, ask a question, or start a discussion..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="cursor-pointer">
                        <HelpCircle className="mr-1 h-3 w-3" />
                        Question
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        <Lightbulb className="mr-1 h-3 w-3" />
                        Insight
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Resource
                      </Badge>
                    </div>
                    <Button disabled={!newPost.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discussion List */}
          <div className="space-y-4">
            {discussions
              .filter(d => selectedCategory === 'all' || d.category === selectedCategory)
              .map(discussion => (
                <Card key={discussion.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{discussion.author.avatar}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 mb-1">{discussion.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                <span className="font-medium">{discussion.author.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {discussion.author.persona}
                                </Badge>
                                <span>{discussion.timestamp}</span>
                              </div>
                            </div>
                            <Badge className={`${getCategoryColor(discussion.category)} text-xs`}>
                              {getCategoryIcon(discussion.category)}
                              <span className="ml-1 capitalize">{discussion.category}</span>
                            </Badge>
                          </div>

                          <p className="text-slate-700 leading-relaxed">{discussion.content}</p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {discussion.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {discussion.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {discussion.replies}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={discussion.isLiked ? 'text-red-600' : ''}
                            >
                              <Heart className={`mr-1 h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                              {discussion.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={discussion.isSaved ? 'text-amber-600' : ''}
                            >
                              <Bookmark className={`h-4 w-4 ${discussion.isSaved ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="study-groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {studyGroups.map(group => (
              <Card key={group.id} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{group.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{group.name}</h3>
                        <Badge className={getDifficultyColor(group.difficulty)}>
                          {group.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{group.description}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {group.members} members
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {group.nextSession}
                        </div>
                      </div>

                      <Badge variant="outline" className="mb-4">
                        {group.topic}
                      </Badge>

                      <div className="flex gap-2">
                        {group.isJoined ? (
                          <>
                            <Button size="sm" className="flex-1">
                              Join Next Session
                            </Button>
                            <Button variant="outline" size="sm">
                              Leave Group
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" className="flex-1">
                            Join Group
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>See what your colleagues have been learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peerActivity.map(activity => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{activity.user.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{activity.user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.user.persona}
                        </Badge>
                        <div className={`flex items-center gap-1 ${getActionColor(activity.action)}`}>
                          {getActionIcon(activity.action)}
                          <span className="text-sm font-medium capitalize">{activity.action}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{activity.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">{activity.timestamp}</span>
                        {activity.points && (
                          <Badge className="bg-emerald-600 text-white text-xs">
                            +{activity.points} points
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Community</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">247</p>
                <p className="text-sm text-slate-600">Active learners</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Discussions</h3>
                <p className="text-2xl font-bold text-emerald-600 mt-1">89</p>
                <p className="text-sm text-slate-600">Active threads</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-amber-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900">Knowledge Shared</h3>
                <p className="text-2xl font-bold text-amber-600 mt-1">1,247</p>
                <p className="text-sm text-slate-600">Helpful answers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}