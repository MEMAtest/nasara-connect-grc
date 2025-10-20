"use client";

import { useState } from "react";
import { useSmcrData } from "../context/SmcrDataContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FirmSwitcher() {
  const { firms, activeFirmId, setActiveFirm, addFirm } = useSmcrData();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const handleAddFirm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addFirm(trimmed);
    setName("");
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Firm</span>
        {firms.length === 0 ? (
          <span className="text-xs text-slate-500">No firms configured</span>
        ) : (
          <Select value={activeFirmId ?? ""} onValueChange={setActiveFirm}>
            <SelectTrigger className="h-8 w-[200px] bg-white/90 text-left text-sm text-slate-700">
              <SelectValue placeholder="Select firm" />
            </SelectTrigger>
            <SelectContent>
              {firms.map((firm) => (
                <SelectItem key={firm.id} value={firm.id}>
                  {firm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
        {firms.length === 0 ? "Create firm" : "Add firm"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Firm</DialogTitle>
            <DialogDescription>
              Create a firm profile to scope SM&CR records. You can manage multiple firms from this workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firm-name">Firm name</Label>
              <Input id="firm-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Nasara Payments Ltd" autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save firm</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
