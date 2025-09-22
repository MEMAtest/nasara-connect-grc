"use client";

import Image from "next/image";
import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Highlight {
  id: string;
  label: string;
  value: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface PersonCard {
  name: string;
  role: string;
  avatar: string;
}

interface WelcomeHeroProps {
  highlights: Highlight[];
  quickActions: QuickAction[];
  keyPeople: PersonCard[];
}

function WelcomeHeroComponent({ highlights, quickActions, keyPeople }: WelcomeHeroProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 text-white shadow-xl">
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="absolute -right-12 top-6 hidden h-48 w-48 rounded-full bg-teal-400/30 blur-3xl sm:block" aria-hidden="true" />
        <div className="absolute -left-16 bottom-0 hidden h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl lg:block" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium uppercase tracking-[0.35em] text-teal-100"
            >
              Welcome back, Regina
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="text-3xl font-semibold leading-tight text-white sm:text-4xl"
            >
              Your compliance posture is strong. Keep accelerating towards authorization.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-sm text-teal-100/80"
            >
              Monitor critical metrics, unlock modules, and collaborate with your team from one place.
            </motion.p>

            <div className="flex flex-wrap gap-3 pt-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Button
                      variant="secondary"
                      className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-white/25"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {action.label}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="grid grid-cols-2 gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur"
          >
            {highlights.map((highlight) => (
              <div key={highlight.id} className="rounded-xl bg-black/20 p-4 text-left shadow-inner">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100/80">{highlight.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{highlight.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/5 px-6 py-4 backdrop-blur sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">Team visibility</p>
          <div className="flex flex-1 items-center justify-end gap-3">
            {keyPeople.map((person, index) => (
              <motion.div
                key={person.name}
                className="flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
              >
                <Image
                  src={person.avatar}
                  alt={person.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border border-white/20 object-cover"
                />
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-xs font-semibold text-white">{person.name}</p>
                  <p className="text-[11px] text-teal-100/80">{person.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const WelcomeHero = memo(WelcomeHeroComponent);

WelcomeHero.displayName = "WelcomeHero";
