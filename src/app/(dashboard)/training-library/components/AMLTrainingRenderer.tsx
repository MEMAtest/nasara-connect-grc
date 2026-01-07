"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Users,
  BarChart3,
  Shield,
  FileText,
  Star,
  Award,
  Trophy,
  XCircle,
  Eye,
  Scale,
  Building,
  Banknote,
  Network,
  UserCheck,
  Bell,
  Lock,
  AlertCircle
} from "lucide-react";
import { amlFundamentalsModule } from "../content/aml-fundamentals-complete";

type Stage = "hook" | "content" | "practice" | "summary";
const stageOrder: Stage[] = ["hook", "content", "practice", "summary"];

interface AMLTrainingRendererProps {
  onComplete?: (score: number, timeSpent: number) => void;
  onProgress?: (progress: number) => void;
  deepLink?: { stage?: string; section?: string };
  onDeepLinkChange?: (deepLink: { stage?: string; section?: string }) => void;
}

export function AMLTrainingRenderer({ onComplete, onProgress, deepLink, onDeepLinkChange }: AMLTrainingRendererProps) {
  const initialStage = stageOrder.includes((deepLink?.stage as Stage) ?? "hook")
    ? ((deepLink?.stage as Stage) ?? "hook")
    : "hook";
  const initialContentSection = (() => {
    if (initialStage !== "content") return 0;
    const parsed = Number(deepLink?.section);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(parsed, 3));
  })();

  const [currentStage, setCurrentStage] = useState<Stage>(initialStage);
  const [currentContentSection, setCurrentContentSection] = useState(initialContentSection);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const getStageProgress = () => {
    const currentIndex = stageOrder.indexOf(currentStage);
    let baseProgress = (currentIndex / stageOrder.length) * 100;

    if (currentStage === 'content') {
      const sectionProgress = (currentContentSection / 4) * 25;
      baseProgress += sectionProgress;
    }

    return Math.min(baseProgress, 100);
  };

  useEffect(() => {
    const stageIndex = stageOrder.indexOf(currentStage);
    let progressValue = (stageIndex / stageOrder.length) * 100;

    if (currentStage === 'content') {
      const sectionProgress = (currentContentSection / 4) * 25;
      progressValue += sectionProgress;
    }

    onProgress?.(Math.round(Math.min(progressValue, 100)));
  }, [currentStage, currentContentSection, onProgress]);

  useEffect(() => {
    if (!deepLink?.stage) return;
    if (!stageOrder.includes(deepLink.stage as Stage)) return;
    if (deepLink.stage === currentStage) return;
    setCurrentStage(deepLink.stage as Stage);
    setCurrentContentSection(0);
  }, [currentStage, deepLink?.stage]);

  useEffect(() => {
    if (currentStage !== "content") return;
    const section = deepLink?.section;
    if (!section) return;
    const parsed = Number(section);
    if (!Number.isFinite(parsed)) return;
    const nextIndex = Math.max(0, Math.min(parsed, 3));
    if (nextIndex === currentContentSection) return;
    setCurrentContentSection(nextIndex);
  }, [currentContentSection, currentStage, deepLink?.section]);

  const calculatePracticeScore = () => {
    const totalQuestions = 2;
    const correctCount = Number(selectedAnswers.corp === "corp_b") + Number(selectedAnswers.change === "change_c");
    return Math.round((correctCount / totalQuestions) * 100);
  };

  const syncDeepLink = (stage: Stage, section?: number) => {
    if (!onDeepLinkChange) return;
    if (stage !== "content") {
      onDeepLinkChange({ stage });
      return;
    }
    const targetSection = typeof section === "number" ? section : currentContentSection;
    onDeepLinkChange({ stage, section: String(targetSection) });
  };

  const nextStage = () => {
    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStageValue = stageOrder[currentIndex + 1];
      setCurrentStage(nextStageValue);
      setCurrentContentSection(0);
      syncDeepLink(nextStageValue, nextStageValue === "content" ? 0 : undefined);
    } else {
      onComplete?.(calculatePracticeScore(), amlFundamentalsModule.duration || 0);
    }
  };

  const nextContentSection = () => {
    if (currentContentSection < 3) {
      const nextIndex = currentContentSection + 1;
      setCurrentContentSection(nextIndex);
      syncDeepLink("content", nextIndex);
    } else {
      nextStage();
    }
  };

  const renderHookStage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6">
          <AlertTriangle className="h-4 w-4" />
          Hook - The Reality of Financial Crime (2 minutes)
        </div>
      </div>

      <Card className="border border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              The £100 Billion Crime Hidden in Plain Sight
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Every year, up to £100 billion from drug trafficking, human slavery, and terrorist attacks is laundered through the UK. This isn't just a number; it's the lifeblood of organised crime.
            </p>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">£100bn</div>
              <div className="text-sm text-red-700">Laundered through UK annually</div>
            </div>
            <div className="text-center p-4 bg-amber-100 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">£264m</div>
              <div className="text-sm text-amber-700">NatWest fine in 2021</div>
            </div>
            <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">£365m</div>
              <div className="text-sm text-red-700">Suspicious deposits missed</div>
            </div>
            <div className="text-center p-4 bg-emerald-100 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">You</div>
              <div className="text-sm text-emerald-700">Are the first line of defence</div>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Building className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-World Impact: The NatWest Case</h3>
                <p className="text-slate-700 mb-4">
                  In December 2021, the FCA fined NatWest Bank over £264 million for failing to comply with money laundering regulations. The bank's systems failed to properly monitor suspicious activity in a customer's account, which saw around £365 million deposited, including £264 million in cash.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-red-600 text-white">Largest UK AML fine</Badge>
                  <Badge variant="outline">Reputational damage</Badge>
                  <Badge variant="outline">Criminal conviction</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-2">💭 Your Role Matters:</h3>
            <p className="text-emerald-800 mb-3">
              Criminals need to make this 'dirty' money look clean, and they will try to use firms just like ours to do it. We are the gatekeepers and the first line of defence.
            </p>
            <p className="text-emerald-800 font-medium">
              What you do every day, the details you notice, and the questions you ask—it all matters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContentStage = () => {
    const sections = [
      {
        title: "Understanding Money Laundering: The Criminal Process",
        content: (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">What is Money Laundering?</h4>
              <p className="text-slate-700 mb-4">
                Money Laundering is the process of taking criminal proceeds ("dirty money") and making them appear legitimate ("clean money"). It's a vital step for criminals, allowing them to use the profits of their crimes without drawing attention to the illegal source.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Terrorist Financing</strong> is closely related but different - it involves providing funds for terrorist activities, even if the source of the money is legitimate.
                </p>
              </div>
            </div>

            {/* Three Stages Visualization */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-slate-900 text-center">The Three Stages of Money Laundering</h4>

              {[
                {
                  number: 1,
                  title: "Placement",
                  description: "Introducing illegal funds into the financial system",
                  details: "This is the first and riskiest step for criminals. They introduce their illegal funds into the financial system through cash deposits, buying foreign currency, or mixing cash with legitimate business proceeds.",
                  examples: [
                    "Large cash deposits just under reporting thresholds",
                    "Buying foreign currency with cash",
                    "Mixing illegal cash with legitimate business revenue"
                  ],
                  icon: <Banknote className="h-8 w-8" />,
                  color: "red"
                },
                {
                  number: 2,
                  title: "Layering",
                  description: "Creating complex webs to obscure money's origin",
                  details: "The goal is to make the audit trail as confusing as possible. Criminals create complex webs of transactions, often across multiple jurisdictions, through various banks and shell companies.",
                  examples: [
                    "Moving funds between multiple banks",
                    "Creating shell companies for transactions",
                    "Buying and selling high-value assets",
                    "Complex cross-border transfers"
                  ],
                  icon: <Network className="h-8 w-8" />,
                  color: "amber"
                },
                {
                  number: 3,
                  title: "Integration",
                  description: "Returning 'clean' money from seemingly legitimate sources",
                  details: "The laundered money is returned to the criminal from what appear to be legitimate sources. The money is now 'clean' and can be used freely without suspicion.",
                  examples: [
                    "Fake invoices for services never provided",
                    "Property sales at inflated prices",
                    "Dividend payments from shell companies",
                    "Salary payments from fake employment"
                  ],
                  icon: <Building className="h-8 w-8" />,
                  color: "green"
                }
              ].map((stage, index) => (
                <div key={index} className={`border-l-4 ${
                  stage.color === 'red' ? 'border-red-500 bg-red-50' :
                  stage.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                  'border-green-500 bg-green-50'
                } p-6 rounded-r-lg`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      stage.color === 'red' ? 'bg-red-100 text-red-600' :
                      stage.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          stage.color === 'red' ? 'bg-red-500' :
                          stage.color === 'amber' ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}>
                          {stage.number}
                        </div>
                        <h5 className="text-xl font-semibold text-slate-900">{stage.title}</h5>
                      </div>
                      <p className="text-slate-700 mb-4">{stage.details}</p>
                      <div>
                        <h6 className="font-medium text-slate-800 mb-2">Common Examples:</h6>
                        <ul className="space-y-1">
                          {stage.examples.map((example, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Statistics */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Global Money Laundering Impact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">&lt;1%</div>
                  <div className="text-sm text-blue-700">Of laundered money is successfully recovered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2-5%</div>
                  <div className="text-sm text-blue-700">Of global GDP is laundered annually</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">£100bn</div>
                  <div className="text-sm text-blue-700">Estimated amount through UK yearly</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "UK Regulatory Framework: The Legal Foundation",
        content: (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-6 w-6 text-red-600" />
                <h4 className="text-lg font-semibold text-red-900">Critical Understanding</h4>
              </div>
              <p className="text-red-800">
                Our firm's AML framework is built upon UK criminal law, not just regulatory rules. Personal liability includes imprisonment and unlimited fines for serious breaches.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  name: "Proceeds of Crime Act 2002 (POCA)",
                  description: "UK's primary anti-money laundering legislation",
                  keyPoints: [
                    "Establishes main money laundering offences",
                    "Covers concealing, arranging, and acquiring criminal property",
                    "Creates criminal liability for individuals and firms"
                  ],
                  penalties: "Up to 14 years imprisonment",
                  color: "red"
                },
                {
                  name: "Terrorism Act 2000",
                  description: "Primary legislation for terrorist financing offences",
                  keyPoints: [
                    "Defines terrorist financing offences",
                    "Creates reporting obligations",
                    "Establishes penalties for non-compliance"
                  ],
                  penalties: "Up to 14 years imprisonment",
                  color: "red"
                },
                {
                  name: "Money Laundering Regulations 2017 (MLRs)",
                  description: "Detailed practical rules for regulated firms",
                  keyPoints: [
                    "Risk-based approach requirements",
                    "Customer due diligence procedures",
                    "Record keeping obligations",
                    "Training and awareness requirements"
                  ],
                  penalties: "Unlimited fines + criminal prosecution",
                  color: "amber"
                },
                {
                  name: "FCA Handbook (SYSC 6 & FCG)",
                  description: "FCA's expectations for systems and controls",
                  keyPoints: [
                    "Senior management accountability",
                    "Governance and oversight requirements",
                    "Systems and controls standards",
                    "Cultural expectations"
                  ],
                  penalties: "Regulatory action + unlimited fines",
                  color: "blue"
                }
              ].map((regulation, index) => (
                <Card key={index} className={`border-2 ${
                  regulation.color === 'red' ? 'border-red-200 bg-red-50' :
                  regulation.color === 'amber' ? 'border-amber-200 bg-amber-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        regulation.color === 'red' ? 'bg-red-100' :
                        regulation.color === 'amber' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <FileText className={`h-6 w-6 ${
                          regulation.color === 'red' ? 'text-red-600' :
                          regulation.color === 'amber' ? 'text-amber-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 mb-2">{regulation.name}</h5>
                        <p className="text-slate-700 mb-3">{regulation.description}</p>
                        <ul className="space-y-1 mb-4">
                          {regulation.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <div className="w-1 h-1 bg-slate-400 rounded-full mt-2 shrink-0"></div>
                              {point}
                            </li>
                          ))}
                        </ul>
                        <Badge className={`${
                          regulation.color === 'red' ? 'bg-red-600' :
                          regulation.color === 'amber' ? 'bg-amber-600' :
                          'bg-blue-600'
                        } text-white`}>
                          {regulation.penalties}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      },
      {
        title: "Our Defence: The Risk-Based Approach (RBA)",
        content: (
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
              <h4 className="text-lg font-semibold text-emerald-900 mb-3">Intelligent Resource Allocation</h4>
              <p className="text-emerald-800">
                We cannot treat every customer and transaction as if it carries the same level of risk. The law requires us to adopt a Risk-Based Approach (RBA) - identifying the biggest risks and focusing our resources where they matter most.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  number: 1,
                  title: "Business-Wide Risk Assessment",
                  description: "Formal assessment of our AML risks",
                  details: "Comprehensive assessment considering risks from customers, countries, products, services, and delivery methods. This is the foundation of our entire AML programme.",
                  keyActivities: [
                    "Annual risk assessment updates",
                    "Customer risk profiling",
                    "Geographic risk evaluation",
                    "Product and service risk analysis"
                  ],
                  icon: <BarChart3 className="h-6 w-6" />,
                  color: "purple"
                },
                {
                  number: 2,
                  title: "Customer Due Diligence (CDD)",
                  description: "Know Your Customer (KYC) procedures",
                  details: "We must identify customers and beneficial owners, verify their identity, and apply appropriate levels of diligence based on risk assessment.",
                  keyActivities: [
                    "Standard Due Diligence for normal risk",
                    "Simplified Due Diligence for low risk",
                    "Enhanced Due Diligence for high risk",
                    "Ongoing customer verification"
                  ],
                  icon: <UserCheck className="h-6 w-6" />,
                  color: "blue"
                },
                {
                  number: 3,
                  title: "Ongoing Monitoring",
                  description: "Continuous transaction and activity monitoring",
                  details: "We monitor customer transactions and activity throughout the relationship to ensure consistency with our knowledge and spot unusual patterns.",
                  keyActivities: [
                    "Transaction monitoring systems",
                    "Periodic customer reviews",
                    "Suspicious pattern detection",
                    "Activity trend analysis"
                  ],
                  icon: <Eye className="h-6 w-6" />,
                  color: "emerald"
                },
                {
                  number: 4,
                  title: "Reporting",
                  description: "Internal and external reporting obligations",
                  details: "Comprehensive reporting framework covering internal suspicious activity reporting to MLRO and external reporting to authorities when required.",
                  keyActivities: [
                    "Internal suspicious activity reports",
                    "SARs to National Crime Agency",
                    "Regulatory reporting",
                    "Board and committee reporting"
                  ],
                  icon: <Bell className="h-6 w-6" />,
                  color: "amber"
                }
              ].map((pillar, index) => (
                <Card key={index} className={`border-2 ${
                  pillar.color === 'purple' ? 'border-purple-200 bg-purple-50' :
                  pillar.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                  pillar.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
                  'border-amber-200 bg-amber-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        pillar.color === 'purple' ? 'bg-purple-500' :
                        pillar.color === 'blue' ? 'bg-blue-500' :
                        pillar.color === 'emerald' ? 'bg-emerald-500' :
                        'bg-amber-500'
                      }`}>
                        {pillar.number}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-semibold text-slate-900 mb-2">{pillar.title}</h5>
                        <p className="text-slate-600 text-sm">{pillar.description}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 mb-4">{pillar.details}</p>
                    <div>
                      <h6 className="font-medium text-slate-800 mb-2">Key Activities:</h6>
                      <ul className="space-y-1">
                        {pillar.keyActivities.map((activity, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <CheckCircle2 className={`h-3 w-3 mt-0.5 shrink-0 ${
                              pillar.color === 'purple' ? 'text-purple-500' :
                              pillar.color === 'blue' ? 'text-blue-500' :
                              pillar.color === 'emerald' ? 'text-emerald-500' :
                              'text-amber-500'
                            }`} />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      },
      {
        title: "Your Role and the MLRO: Critical Responsibilities",
        content: (
          <div className="space-y-6">
            <div className="grid gap-6">
              {/* Every Employee */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Every Employee</h4>
                      <p className="text-blue-800 mb-4">Fundamental duty to report suspicions</p>

                      <div className="space-y-3">
                        <div className="bg-white/50 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Your Responsibilities:</h5>
                          <ul className="space-y-2">
                            {[
                              "Be alert to suspicious activity in daily work",
                              "Report any suspicions immediately to MLRO",
                              "Maintain confidentiality (no tipping off)",
                              "Complete required AML training",
                              "Follow firm's AML policies and procedures"
                            ].map((responsibility, i) => (
                              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                {responsibility}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-100 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-1">KEY RULE:</h5>
                          <p className="text-blue-800 font-medium">If you suspect it, report it internally to the MLRO</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MLRO */}
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">
                        Money Laundering Reporting Officer (MLRO)
                      </h4>
                      <p className="text-red-800 mb-4">Senior function holder (SMF17) responsible for AML oversight</p>

                      <div className="space-y-3">
                        <div className="bg-white/50 rounded-lg p-4">
                          <h5 className="font-medium text-red-900 mb-2">MLRO Responsibilities:</h5>
                          <ul className="space-y-2">
                            {[
                              "Act as central point for all internal AML concerns",
                              "Investigate internal reports of suspicious activity",
                              "Decide whether to submit SARs to National Crime Agency",
                              "Oversee firm's AML systems and controls",
                              "Provide guidance and training to staff",
                              "Report to senior management and regulators"
                            ].map((responsibility, i) => (
                              <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                                {responsibility}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Critical Warning */}
            <Card className="border-2 border-red-300 bg-red-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Lock className="h-8 w-8 text-red-600 shrink-0" />
                  <div>
                    <h4 className="text-xl font-bold text-red-900 mb-3">CRITICAL RULE: Tipping Off</h4>
                    <p className="text-red-800 mb-4">
                      It is a criminal offence to 'tip off' a person that you have made a SAR or that there is an ongoing investigation. You must never tell a customer that they are the subject of a report.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-red-900 mb-2">❌ NEVER SAY:</h5>
                        <ul className="space-y-1">
                          {[
                            "We're investigating your account",
                            "There's a compliance issue",
                            "We need to check for money laundering",
                            "This looks suspicious"
                          ].map((example, i) => (
                            <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                              "{example}"
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-900 mb-2">✅ SAFE RESPONSE:</h5>
                        <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            "We are completing our standard internal checks and will process your request as soon as possible. Thank you for your patience."
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-red-200 rounded-lg">
                      <p className="text-red-900 font-semibold text-sm">
                        Penalties: Up to 2 years imprisonment and/or unlimited fine
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    ];

    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Core Content - Deep Learning ({currentContentSection + 1}/4)
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= currentContentSection ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">{sections[currentContentSection].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {sections[currentContentSection].content}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={nextContentSection} className="bg-blue-600 hover:bg-blue-700">
            {currentContentSection < 3 ? 'Next Section' : 'Continue to Practice'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderPracticeStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
          <Target className="h-4 w-4" />
          Practice - Apply Your Knowledge (3 minutes)
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        AML Red Flag Detection Practice
      </h2>

      {/* Scenario 1 */}
      <Card className="border border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-600" />
            Scenario 1: The Complex Corporate Client
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3">Situation:</h4>
            <p className="text-slate-700 mb-4">
              A new corporate client "Global Trading Solutions Ltd" wants to set up a payment account. They are based in a high-risk jurisdiction and the corporate structure is deliberately complex, involving shell companies. They want to immediately begin moving large, round-sum amounts to various other countries. The director is evasive when you ask for details on the source of their wealth.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-slate-800 mb-2">Client Details:</h5>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Based in known high-risk jurisdiction</li>
                  <li>• Multiple shell companies in structure</li>
                  <li>• Unclear beneficial ownership</li>
                  <li>• Requests immediate large transfers</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-slate-800 mb-2">Red Flags:</h5>
                <ul className="space-y-1 text-sm text-red-600">
                  <li>• High-risk jurisdiction</li>
                  <li>• Complex/opaque structure</li>
                  <li>• Evasive about wealth source</li>
                  <li>• Round sum amounts</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">What are the red flags here, and what should you do?</h4>
            <div className="space-y-3">
              {[
                { id: "corp_a", text: "Process the application normally - they haven't done anything illegal yet", correct: false },
                { id: "corp_b", text: "Apply Enhanced Due Diligence (EDD) and escalate concerns to MLRO before proceeding", correct: true },
                { id: "corp_c", text: "Reject the application immediately due to high risk", correct: false },
                { id: "corp_d", text: "Accept but monitor closely after onboarding", correct: false }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers.corp === option.id
                      ? option.correct
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="corp"
                    value={option.id}
                    checked={selectedAnswers.corp === option.id}
                    onChange={() => setSelectedAnswers(prev => ({ ...prev, corp: option.id }))}
                    className="mt-1"
                  />
                  <span className="text-slate-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedAnswers.corp && (
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">
                  {selectedAnswers.corp === 'corp_b' ? 'Excellent!' : 'Learning Opportunity'}
                </span>
              </div>
              <p className="text-sm text-emerald-800 mb-3">
                {selectedAnswers.corp === 'corp_b'
                  ? "You've correctly identified multiple red flags: high-risk jurisdiction, complex/opaque structure, immediate large transactions, round amounts, and evasiveness about source of wealth. This requires Enhanced Due Diligence (EDD) and immediate escalation to the MLRO before proceeding."
                  : "This scenario contains serious red flags requiring immediate action. The combination of high-risk jurisdiction, complex structure, large immediate transfers, and evasive behavior requires Enhanced Due Diligence and MLRO escalation before proceeding."
                }
              </p>
              <div>
                <h5 className="font-medium text-emerald-800 mb-2">Key Learning Points:</h5>
                <ul className="space-y-1">
                  {[
                    "High-risk jurisdictions require enhanced scrutiny",
                    "Complex corporate structures can hide beneficial ownership",
                    "Evasiveness about source of wealth is a major red flag",
                    "Never proceed with high-risk relationships without MLRO approval"
                  ].map((point, i) => (
                    <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario 2 */}
      <Card className="border border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Scenario 2: Sudden Account Activity Change
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h4 className="font-semibold text-slate-900 mb-3">Situation:</h4>
            <p className="text-slate-700 mb-4">
              Mrs. Sarah Johnson has been your customer for 3 years, maintaining a low account balance (£200-500) with minimal activity. Suddenly, she receives a series of large, unrelated payments from abroad (£15k, £22k, £18k). Almost as soon as the funds arrive, they are transferred out to a different individual.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-slate-800 mb-2">Account History:</h5>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• 3 years as customer</li>
                  <li>• Low balance (£200-500)</li>
                  <li>• Minimal activity</li>
                  <li>• Predictable patterns</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-slate-800 mb-2">New Pattern:</h5>
                <ul className="space-y-1 text-sm text-red-600">
                  <li>• Large international payments</li>
                  <li>• Multiple foreign countries</li>
                  <li>• Immediate transfers out</li>
                  <li>• Pass-through behavior</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Why is this activity suspicious, and what is your legal obligation?</h4>
            <div className="space-y-3">
              {[
                { id: "change_a", text: "Wait to see if the pattern continues before taking action", correct: false },
                { id: "change_b", text: "Contact the customer to ask about the change in activity", correct: false },
                { id: "change_c", text: "Report the suspicion immediately to the MLRO", correct: true },
                { id: "change_d", text: "Block the account until more information is obtained", correct: false }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers.change === option.id
                      ? option.correct
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="change"
                    value={option.id}
                    checked={selectedAnswers.change === option.id}
                    onChange={() => setSelectedAnswers(prev => ({ ...prev, change: option.id }))}
                    className="mt-1"
                  />
                  <span className="text-slate-700">{option.text}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedAnswers.change && (
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">
                  {selectedAnswers.change === 'change_c' ? 'Correct!' : 'Learning Opportunity'}
                </span>
              </div>
              <p className="text-sm text-emerald-800 mb-3">
                {selectedAnswers.change === 'change_c'
                  ? "This represents a significant and unexplained change from the customer's expected activity pattern. The account appears to be used as a simple pass-through for funds, which is a classic 'layering' technique in money laundering. Your legal obligation is to report this suspicion immediately to the MLRO."
                  : "This activity shows classic signs of money laundering 'layering' - using the account as a pass-through for funds. The dramatic change from expected activity creates a legal obligation to report your suspicion to the MLRO immediately."
                }
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-emerald-800 mb-2">Learning Points:</h5>
                  <ul className="space-y-1">
                    {[
                      "Dramatic changes from expected patterns are suspicious",
                      "Pass-through accounts are used in layering",
                      "Report suspicions immediately, don't investigate"
                    ].map((point, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-amber-800 mb-2">ML Stage Identified:</h5>
                  <div className="bg-amber-100 p-3 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">Layering</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Creating complex layers to obscure money's origin
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSummaryStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
          <Award className="h-4 w-4" />
          Summary - Reinforce Learning (1 minute)
        </div>
      </div>

      <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Training Complete!</h2>
          <p className="text-slate-600 mb-6">You've mastered the fundamentals of AML compliance and your critical role in fighting financial crime</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">15 min</div>
              <div className="text-sm text-slate-600">Time Invested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+200</div>
              <div className="text-sm text-slate-600">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-slate-600">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Essential Knowledge Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Shield className="h-6 w-6 text-blue-500" />,
                title: "You Are the First Line of Defence",
                description: "With £100bn laundered through the UK annually, your vigilance and reporting is critical to protecting the financial system from criminal abuse."
              },
              {
                icon: <Network className="h-6 w-6 text-amber-500" />,
                title: "Three Stages: Placement, Layering, Integration",
                description: "Understanding how criminals launder money helps you spot suspicious patterns and behaviors throughout the process."
              },
              {
                icon: <Target className="h-6 w-6 text-emerald-500" />,
                title: "Risk-Based Approach Focuses Resources",
                description: "Our four-pillar framework (Risk Assessment, CDD, Monitoring, Reporting) efficiently targets the highest risks."
              },
              {
                icon: <Bell className="h-6 w-6 text-red-500" />,
                title: "Report Suspicions to MLRO Immediately",
                description: "Your legal obligation is to report any suspicion - not to investigate or prove it. The threshold is suspicion, not certainty."
              },
              {
                icon: <Lock className="h-6 w-6 text-purple-500" />,
                title: "Never 'Tip Off' - It's a Criminal Offence",
                description: "Telling customers about investigations or reports can result in 2 years imprisonment. Use generic holding responses only."
              }
            ].map((takeaway, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                {takeaway.icon}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{takeaway.title}</h4>
                  <p className="text-sm text-slate-600">{takeaway.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            Critical Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-800 mb-4">
            <strong>Remember:</strong> AML obligations aren't just regulatory requirements - they're criminal law. Personal liability includes imprisonment and unlimited fines for serious breaches.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "POCA 2002 - Up to 14 years",
              "Terrorism Act 2000 - Up to 14 years",
              "Tipping Off - Up to 2 years"
            ].map((law, index) => (
              <div key={index} className="text-center p-3 bg-white rounded border border-red-200">
                <p className="text-sm font-medium text-red-800">{law}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Next Steps in Your AML Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Complete: 'Know Your Customer (KYC) & Customer Due Diligence' training",
              "Review: Your firm's AML Policy and procedures",
              "Practice: Using internal reporting systems and escalation procedures",
              "Bookmark: Key contacts including MLRO details and emergency procedures"
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700">{step}</span>
                <Button variant="outline" size="sm" className="ml-auto">
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'hook':
        return renderHookStage();
      case 'content':
        return renderContentStage();
      case 'practice':
        return renderPracticeStage();
      case 'summary':
        return renderSummaryStage();
      default:
        return renderHookStage();
    }
  };

  const stageLabels: Record<string, string> = {
    hook: "Introduction",
    content: "Content",
    practice: "Practice",
    summary: "Summary",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <a href="/training-library" className="hover:text-teal-600 transition-colors">
          Training Library
        </a>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[200px]">
          AML Fundamentals
        </span>
        <span>/</span>
        <span className="text-teal-600 font-medium">{stageLabels[currentStage]}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AML Fundamentals</h1>
          <p className="text-slate-600 mt-1">Your critical role in fighting financial crime</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            15 min
          </Badge>
          <Badge className="bg-green-600">Beginner</Badge>
        </div>
      </div>

      {/* Progress */}
      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Training Progress</h3>
            <span className="text-sm text-slate-600">{Math.round(getStageProgress())}% Complete</span>
          </div>
          <Progress value={getStageProgress()} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span className={currentStage === 'hook' ? 'font-medium text-slate-700' : ''}>Hook</span>
            <span className={currentStage === 'content' ? 'font-medium text-slate-700' : ''}>Content</span>
            <span className={currentStage === 'practice' ? 'font-medium text-slate-700' : ''}>Practice</span>
            <span className={currentStage === 'summary' ? 'font-medium text-slate-700' : ''}>Summary</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Content */}
      {renderCurrentStage()}

      {/* Navigation */}
      {currentStage !== 'summary' && currentStage !== 'content' && (
        <div className="flex justify-center">
          <Button
            onClick={nextStage}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
