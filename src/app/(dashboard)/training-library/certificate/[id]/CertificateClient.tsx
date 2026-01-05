"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ArrowLeft } from "lucide-react";

interface CertificateClientProps {
  moduleTitle: string;
  moduleId: string;
  learnerName: string;
}

export function CertificateClient({ moduleTitle, moduleId, learnerName }: CertificateClientProps) {
  const searchParams = useSearchParams();
  const score = useMemo(() => {
    const raw = searchParams?.get("score");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? Math.round(parsed) : 0;
  }, [searchParams]);

  const issuedOn = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }, []);

  const certificateId = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `NC-${moduleId.toUpperCase()}-${date}`;
  }, [moduleId]);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Button variant="outline" asChild>
            <a href="/training-library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Training Library
            </a>
          </Button>
          <Button
            onClick={() => {
              fetch("/api/training/certificates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ moduleId, score }),
              }).catch(() => {
              }).finally(() => {
                window.print();
              });
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-10 print:shadow-none print:border-slate-100">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Nasara Connect</p>
              <h1 className="text-3xl font-semibold text-slate-900 mt-2">Certificate of Completion</h1>
              <p className="text-sm text-slate-500 mt-2">
                This certificate confirms successful completion of a compliance training module.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Award className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Awarded to</p>
              <p className="text-2xl font-semibold text-slate-900 mt-2">{learnerName}</p>
              <p className="text-sm text-slate-500 mt-2">For completing the module</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">{moduleTitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Issued on</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">{issuedOn}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Score</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{score}%</p>
                  <Badge className={score >= 80 ? "bg-emerald-600" : "bg-amber-500"}>
                    {score >= 80 ? "Pass" : "Review"}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Certificate ID</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">{certificateId}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              This certificate is valid for internal compliance evidence and training records.
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">Nasara Connect</div>
              <div className="text-xs text-slate-500">Learning & Compliance Team</div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body { background: white; }
          }
        `}</style>
      </div>
    </div>
  );
}
