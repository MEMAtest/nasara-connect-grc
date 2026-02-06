"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidanceContent, guidanceLibrary, searchGuidance } from "@/lib/guidance-content";

// Icon components
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function LightBulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

interface GuidanceLibraryProps {
  selectedGuidanceKey?: string | null;
  onSelectGuidance?: (key: string | null) => void;
}

export function GuidanceLibrary({ selectedGuidanceKey, onSelectGuidance }: GuidanceLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get all guidance entries or filtered results
  const guidanceEntries = useMemo(() => {
    if (searchQuery.trim()) {
      return searchGuidance(searchQuery);
    }
    return Object.values(guidanceLibrary);
  }, [searchQuery]);

  // Get selected guidance detail
  const selectedGuidance = selectedGuidanceKey ? guidanceLibrary[selectedGuidanceKey] : null;

  // If a guidance is selected, show the detail view
  if (selectedGuidance) {
    return (
      <GuidanceDetail
        guidance={selectedGuidance}
        onBack={() => onSelectGuidance?.(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-teal-600" />
            Guidance Library
          </CardTitle>
          <CardDescription>
            Tips, explainers, and best practices for meeting FCA requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-teal-50 p-3 text-center">
              <LightBulbIcon className="mx-auto h-6 w-6 text-teal-600" />
              <p className="mt-2 text-sm font-medium text-teal-800">Practical Tips</p>
              <p className="text-xs text-teal-600">How to get it right</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <AlertTriangleIcon className="mx-auto h-6 w-6 text-amber-600" />
              <p className="mt-2 text-sm font-medium text-amber-800">Common Mistakes</p>
              <p className="text-xs text-amber-600">What to avoid</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <ShieldIcon className="mx-auto h-6 w-6 text-blue-600" />
              <p className="mt-2 text-sm font-medium text-blue-800">FCA Expectations</p>
              <p className="text-xs text-blue-600">What they want to see</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search guidance topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Guidance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {guidanceEntries.map((guidance) => (
          <GuidanceCard
            key={guidance.key}
            guidance={guidance}
            onClick={() => onSelectGuidance?.(guidance.key)}
          />
        ))}
      </div>

      {/* Empty State */}
      {guidanceEntries.length === 0 && (
        <Card className="border border-slate-200">
          <CardContent className="py-12 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">No guidance topics match your search</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Guidance Card Component
interface GuidanceCardProps {
  guidance: GuidanceContent;
  onClick: () => void;
}

function GuidanceCard({ guidance, onClick }: GuidanceCardProps) {
  return (
    <Card
      className="cursor-pointer border border-slate-200 transition-all hover:border-teal-200 hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View guidance: ${guidance.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
            <BookOpenIcon className="h-5 w-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900">{guidance.title}</h3>
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {guidance.plainEnglish.substring(0, 120)}...
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <LightBulbIcon className="mr-1 h-3 w-3" />
                {guidance.tips.length} tips
              </Badge>
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                <AlertTriangleIcon className="mr-1 h-3 w-3" />
                {guidance.commonMistakes.length} pitfalls
              </Badge>
              {guidance.timeToComplete && (
                <Badge variant="outline" className="text-xs">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  {guidance.timeToComplete}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Guidance Detail Component
interface GuidanceDetailProps {
  guidance: GuidanceContent;
  onBack: () => void;
}

function GuidanceDetail({ guidance, onBack }: GuidanceDetailProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Library
      </Button>

      {/* Title Card */}
      <Card className="border border-slate-200">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100">
              <BookOpenIcon className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{guidance.title}</CardTitle>
              {guidance.timeToComplete && (
                <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                  <ClockIcon className="h-4 w-4" />
                  Typical preparation time: {guidance.timeToComplete}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plain English Explainer */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpenIcon className="h-5 w-5 text-teal-600" />
            What This Means
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{guidance.plainEnglish}</p>
        </CardContent>
      </Card>

      {/* FCA Expectation */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <ShieldIcon className="h-5 w-5 text-blue-600" />
            FCA Expectation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 leading-relaxed">{guidance.fcaExpectation}</p>
        </CardContent>
      </Card>

      {/* What Good Looks Like */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            What Good Looks Like
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guidance.whatGoodLooksLike.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Practical Tips */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <LightBulbIcon className="h-5 w-5 text-teal-600" />
            Practical Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {guidance.tips.map((tip, index) => (
            <div key={index} className="rounded-lg bg-teal-50 p-4">
              <h4 className="font-medium text-teal-800">{tip.title}</h4>
              <p className="mt-1 text-sm text-teal-700">{tip.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Common Mistakes */}
      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-amber-800">
            <AlertTriangleIcon className="h-5 w-5 text-amber-600" />
            Common Mistakes to Avoid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guidance.commonMistakes.map((mistake, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <span className="text-amber-800">{mistake}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
