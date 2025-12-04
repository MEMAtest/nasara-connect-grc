"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CmpFilterState } from "../hooks/useCmpControls";

interface CmpFiltersProps {
  filters: CmpFilterState;
  onChange: (next: CmpFilterState) => void;
  dutyOutcomes: string[];
  onReset: () => void;
}

export function CmpFilters({ filters, onChange, dutyOutcomes, onReset }: CmpFiltersProps) {
  const handleChange = (key: keyof CmpFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white/60 p-4 shadow-sm md:flex-row md:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="cmp-search">Search controls</Label>
        <Input
          id="cmp-search"
          placeholder="Search by ID, owner, or keyword"
          value={filters.search}
          onChange={(event) => handleChange("search", event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>RAG status</Label>
        <Select value={filters.rag} onValueChange={(value) => handleChange("rag", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="amber">Amber</SelectItem>
            <SelectItem value="red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select value={filters.frequency} onValueChange={(value) => handleChange("frequency", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi-annually">Semi-Annual</SelectItem>
            <SelectItem value="annually">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Consumer Duty outcome</Label>
        <Select value={filters.dutyOutcome} onValueChange={(value) => handleChange("dutyOutcome", value)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {dutyOutcomes.map((outcome) => (
              <SelectItem key={outcome} value={outcome}>
                {outcome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
