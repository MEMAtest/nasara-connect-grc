"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ScreeningList {
  code: string;
  name: string;
  description: string;
  type: string;
  isPremium: boolean;
}

interface BatchScreeningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScreeningComplete: (results: BatchScreeningResult) => void;
}

interface ScreeningMatch {
  recordId: string;
  recordName: string;
  matchScore: number;
  matchedEntry: {
    id: string;
    name: string;
    listName: string;
    listType: string;
    countries: string[];
    reason?: string;
  };
  status: string;
}

interface BatchScreeningResult {
  summary: {
    total: number;
    clear: number;
    potentialMatches: number;
    confirmedMatches: number;
    totalMatches: number;
  };
  results: Array<{
    recordId: string;
    recordName: string;
    status: string;
    matches: ScreeningMatch[];
  }>;
}

const AVAILABLE_LISTS: ScreeningList[] = [
  { code: "ofac", name: "OFAC SDN List", description: "US sanctions", type: "sanctions", isPremium: false },
  { code: "eu", name: "EU Consolidated Sanctions", description: "European Union", type: "sanctions", isPremium: false },
  { code: "uk", name: "UK HMT Sanctions", description: "UK Treasury", type: "sanctions", isPremium: false },
  { code: "un", name: "UN Security Council", description: "United Nations", type: "sanctions", isPremium: false },
  { code: "pep", name: "PEP Lists", description: "Politically Exposed Persons", type: "pep", isPremium: true },
];

export function BatchScreeningModal({
  open,
  onOpenChange,
  onScreeningComplete,
}: BatchScreeningModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<Array<{ name: string; type: string; dob?: string; country?: string }>>([]);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set(["ofac", "eu", "uk", "un"]));
  const [threshold, setThreshold] = useState(0.7);
  const [isScreening, setIsScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "configure" | "results">("upload");
  const [results, setResults] = useState<BatchScreeningResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Parse a CSV line handling quoted fields with commas
   */
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          // Check for escaped quote (double quote)
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i += 2;
            continue;
          }
          // End of quoted field
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          // Start of quoted field
          inQuotes = true;
        } else if (char === ',') {
          // End of field
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      i++;
    }

    // Add the last field
    result.push(current.trim());
    return result;
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
    setError(null);

    try {
      const text = await file.text();
      // Handle different line endings (CRLF, CR, LF)
      const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(line => line.trim());

      if (lines.length < 2) {
        setError("CSV file must have a header row and at least one data row");
        return;
      }

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
      const nameIndex = headers.findIndex(h => h === "name" || h === "full name" || h === "fullname");
      const typeIndex = headers.findIndex(h => h === "type" || h === "entity type" || h === "entitytype");
      const dobIndex = headers.findIndex(h => h === "dob" || h === "date of birth" || h === "dateofbirth" || h === "birth date");
      const countryIndex = headers.findIndex(h => h === "country" || h === "nationality" || h === "jurisdiction");

      if (nameIndex === -1) {
        setError("CSV must have a 'name' column");
        return;
      }

      const records = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return {
          name: values[nameIndex] || "",
          type: typeIndex >= 0 ? (values[typeIndex]?.toLowerCase() === "company" ? "company" : "individual") : "individual",
          dob: dobIndex >= 0 ? values[dobIndex] : undefined,
          country: countryIndex >= 0 ? values[countryIndex] : undefined,
        };
      }).filter(r => r.name.length > 0);

      if (records.length === 0) {
        setError("No valid records found in CSV file");
        return;
      }

      setParsedRecords(records);
      setStep("configure");
    } catch (err) {
      setError("Failed to parse CSV file. Please ensure it is a valid CSV format.");
    }
  };

  const handleListToggle = (code: string) => {
    setSelectedLists(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleStartScreening = async () => {
    setIsScreening(true);
    setError(null);

    try {
      const response = await fetch("/api/screening/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: parsedRecords.map((r, i) => ({
            id: `batch-${i}`,
            name: r.name,
            type: r.type,
            dob: r.dob,
            country: r.country,
          })),
          options: {
            threshold,
            lists: Array.from(selectedLists),
            includeAliases: true,
            checkDob: true,
            checkCountry: true,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Screening failed");
      }

      const data = await response.json();
      setResults(data);
      setStep("results");
      onScreeningComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setIsScreening(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setParsedRecords([]);
    setSelectedLists(new Set(["ofac", "eu", "uk", "un"]));
    setThreshold(0.7);
    setIsScreening(false);
    setError(null);
    setStep("upload");
    setResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetModal(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-teal-600" />
            Batch Screening
          </DialogTitle>
          <DialogDescription>
            Screen multiple names against sanctions and PEP lists
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                isDragging ? "border-teal-400 bg-teal-50" : "border-slate-300 hover:border-slate-400"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                Drop CSV here or click to upload
              </p>
              <p className="text-xs text-slate-500">
                Required columns: name, type (individual/company)
              </p>
              <p className="text-xs text-slate-500">
                Optional: dob, country, id_number
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Sample CSV format:</p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-600">
{`name,type,dob,country
John Smith,individual,1965-03-15,United States
ABC Trading Ltd,company,,United Kingdom`}
              </pre>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === "configure" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                {parsedRecords.length} records ready for screening
              </p>
              <p className="text-xs text-slate-500">
                From: {selectedFile?.name}
              </p>
            </div>

            <div className="space-y-3">
              <Label>Screening Lists</Label>
              <div className="space-y-2">
                {AVAILABLE_LISTS.map((list) => (
                  <div
                    key={list.code}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3",
                      list.isPremium ? "bg-slate-50" : "bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={list.code}
                        checked={selectedLists.has(list.code)}
                        onCheckedChange={() => handleListToggle(list.code)}
                        disabled={list.isPremium}
                      />
                      <div>
                        <label htmlFor={list.code} className="text-sm font-medium text-slate-700 cursor-pointer">
                          {list.name}
                        </label>
                        <p className="text-xs text-slate-500">{list.description}</p>
                      </div>
                    </div>
                    {list.isPremium && (
                      <span className="text-xs font-medium text-amber-600">Premium</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Match Threshold</Label>
                <span className="text-sm font-medium text-slate-700">{Math.round(threshold * 100)}%</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={([v]) => setThreshold(v)}
                min={0.5}
                max={0.95}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Higher threshold = fewer false positives but may miss some matches
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleStartScreening}
                disabled={isScreening || selectedLists.size === 0}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isScreening ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Screening...
                  </>
                ) : (
                  "Start Screening"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg bg-slate-100 p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{results.summary.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{results.summary.clear}</p>
                <p className="text-xs text-emerald-600">Clear</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{results.summary.potentialMatches}</p>
                <p className="text-xs text-amber-600">Potential</p>
              </div>
              <div className="rounded-lg bg-red-100 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{results.summary.totalMatches}</p>
                <p className="text-xs text-red-600">Matches</p>
              </div>
            </div>

            {/* Results List */}
            {results.summary.potentialMatches > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900">Potential Matches Requiring Review</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.results
                    .filter(r => r.status !== "clear")
                    .map((result) => (
                      <div
                        key={result.recordId}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{result.recordName}</p>
                            <p className="text-xs text-slate-500">
                              {result.matches.length} potential match{result.matches.length !== 1 ? "es" : ""}
                            </p>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="mt-2 space-y-1">
                          {result.matches.slice(0, 3).map((match, idx) => (
                            <div key={idx} className="text-xs text-slate-600 bg-white rounded p-2">
                              <span className="font-medium">{Math.round(match.matchScore * 100)}%</span>
                              {" match to "}
                              <span className="font-medium">{match.matchedEntry.name}</span>
                              {" on "}
                              <span className="text-amber-600">{match.matchedEntry.listName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {results.summary.potentialMatches === 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-medium text-emerald-700">All records are clear</p>
                <p className="text-sm text-emerald-600">
                  No matches found against selected sanctions lists
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
