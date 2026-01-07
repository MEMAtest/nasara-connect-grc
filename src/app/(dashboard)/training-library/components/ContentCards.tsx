"use client";

import { CheckCircle2, AlertTriangle, Info, Zap, BookOpen, Scale, Users, Shield } from "lucide-react";

// Card type definitions
export interface KeyPointCardProps {
  type: 'keypoint';
  icon: string;
  title: string;
  points: string[];
}

export interface AlertCardProps {
  type: 'alert';
  alertType: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
}

export interface ChecklistCardProps {
  type: 'checklist';
  title: string;
  items: string[];
}

export interface InfoGridCardProps {
  type: 'infogrid';
  title?: string;
  items: Array<{
    icon: string;
    label: string;
    description: string;
  }>;
}

export interface StatCardProps {
  type: 'stat';
  icon?: string;
  value: string;
  label: string;
  description?: string;
  color?: 'red' | 'amber' | 'emerald' | 'blue';
}

export interface ProcessStepCardProps {
  type: 'process';
  steps: Array<{
    number: number;
    title: string;
    description: string;
  }>;
}

export type ContentCard =
  | KeyPointCardProps
  | AlertCardProps
  | ChecklistCardProps
  | InfoGridCardProps
  | StatCardProps
  | ProcessStepCardProps;

// Key Point Card - for main concepts with bullet points
export function KeyPointCard({ icon, title, points }: Omit<KeyPointCardProps, 'type'>) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
          <ul className="mt-2 space-y-1.5">
            {points.map((point, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Alert Card - for penalties, warnings, critical info
export function AlertCard({ alertType, title, message }: Omit<AlertCardProps, 'type'>) {
  const styles = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtext: 'text-amber-700',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      subtext: 'text-red-700',
      icon: <Zap className="h-5 w-5 text-red-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      subtext: 'text-blue-700',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  const style = styles[alertType];

  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div>
          <h4 className={`font-semibold text-sm ${style.text}`}>{title}</h4>
          <p className={`text-sm mt-1 ${style.subtext}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

// Checklist Card - for requirements and action items
export function ChecklistCard({ title, items }: Omit<ChecklistCardProps, 'type'>) {
  return (
    <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
      <h4 className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-emerald-800 flex items-center gap-2">
            <div className="h-4 w-4 rounded border-2 border-emerald-400 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Info Grid Card - for definitions and key terms
export function InfoGridCard({ title, items }: Omit<InfoGridCardProps, 'type'>) {
  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-semibold text-slate-900 text-sm">{title}</h4>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center hover:bg-slate-100 transition-colors"
          >
            <span className="text-2xl block mb-1">{item.icon}</span>
            <p className="font-semibold text-slate-900 text-xs">{item.label}</p>
            <p className="text-slate-600 text-xs mt-0.5">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card - for key statistics and figures
export function StatCard({ icon, value, label, description, color = 'blue' }: Omit<StatCardProps, 'type'>) {
  const colors = {
    red: 'bg-red-50 border-red-200 text-red-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      {icon && <span className="text-3xl block mb-2">{icon}</span>}
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-90">{label}</p>
      {description && <p className="text-xs opacity-70 mt-1">{description}</p>}
    </div>
  );
}

// Process Step Card - for step-by-step procedures
export function ProcessStepCard({ steps }: Omit<ProcessStepCardProps, 'type'>) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
              {step.number}
            </div>
            <div className="min-w-0 pt-1">
              <h5 className="font-semibold text-slate-900 text-sm">{step.title}</h5>
              <p className="text-sm text-slate-600 mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main renderer function that renders any card type
export function renderContentCard(card: ContentCard, index: number) {
  switch (card.type) {
    case 'keypoint':
      return <KeyPointCard key={index} icon={card.icon} title={card.title} points={card.points} />;
    case 'alert':
      return <AlertCard key={index} alertType={card.alertType} title={card.title} message={card.message} />;
    case 'checklist':
      return <ChecklistCard key={index} title={card.title} items={card.items} />;
    case 'infogrid':
      return <InfoGridCard key={index} title={card.title} items={card.items} />;
    case 'stat':
      return <StatCard key={index} icon={card.icon} value={card.value} label={card.label} description={card.description} color={card.color} />;
    case 'process':
      return <ProcessStepCard key={index} steps={card.steps} />;
    default:
      return null;
  }
}

// Grid container for cards
export function ContentCardGrid({ cards }: { cards: ContentCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, index) => renderContentCard(card, index))}
    </div>
  );
}
