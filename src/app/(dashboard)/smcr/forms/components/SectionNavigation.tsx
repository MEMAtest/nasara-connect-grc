"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Building,
  Briefcase,
  Shield,
  AlertTriangle,
  Globe,
  Scale,
  BadgeAlert,
  Banknote,
  GraduationCap,
  Clock,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SectionItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const sections: SectionItem[] = [
  { id: "1", label: "Firm Details", icon: Building },
  { id: "2", label: "Personal Details", icon: User },
  { id: "3", label: "Contact", icon: Globe },
  { id: "4", label: "Function", icon: Briefcase },
  { id: "5", label: "Employment", icon: Clock },
  { id: "6", label: "Directorships", icon: Building },
  { id: "7", label: "Criminal", icon: BadgeAlert },
  { id: "8", label: "Civil", icon: Scale },
  { id: "9", label: "Regulatory", icon: Shield },
  { id: "10", label: "Employment Issues", icon: AlertTriangle },
  { id: "11", label: "Financial", icon: Banknote },
  { id: "12", label: "Responsibilities", icon: FileCheck },
  { id: "13", label: "Competency", icon: GraduationCap },
  { id: "14", label: "Declarations", icon: CheckCircle2 },
];

interface SectionNavigationProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  return (
    <nav aria-label="Form sections" className="flex flex-wrap gap-1" role="navigation">
      {sections.map((section) => (
        <Button
          key={section.id}
          variant={activeSection === section.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSectionChange(section.id)}
          className="text-xs gap-1"
          aria-current={activeSection === section.id ? "true" : undefined}
          aria-label={`Section ${section.id}: ${section.label}`}
        >
          <section.icon className="h-3 w-3" aria-hidden="true" />
          <span className="hidden sm:inline">{section.label}</span>
          <span className="sm:hidden">{section.id}</span>
        </Button>
      ))}
    </nav>
  );
}

export { sections };
