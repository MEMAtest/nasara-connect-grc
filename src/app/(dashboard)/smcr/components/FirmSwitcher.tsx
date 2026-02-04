"use client";

import { useState, useEffect } from "react";
import { useSmcrData } from "../context/SmcrDataContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Unlink, ExternalLink, Building2 } from "lucide-react";
import Link from "next/link";

interface AuthorizationProject {
  id: string;
  name: string;
  permission_code: string;
  permission_name: string;
  status: string;
  smcr_roles: string[];
}

export function FirmSwitcher() {
  const {
    firms,
    activeFirmId,
    setActiveFirm,
    addFirm,
    linkAuthorizationProject,
    unlinkAuthorizationProject,
  } = useSmcrData();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isLinkDialogOpen, setLinkDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [projects, setProjects] = useState<AuthorizationProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  const activeFirm = firms.find((f) => f.id === activeFirmId);

  // Fetch authorization projects when link dialog opens
  useEffect(() => {
    if (isLinkDialogOpen) {
      setLoading(true);
      fetch("/api/authorization-pack/projects")
        .then((res) => res.json())
        .then((data) => {
          setProjects(data.projects || []);
        })
        .catch((err) => {
          console.error("Failed to fetch projects:", err);
          setProjects([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isLinkDialogOpen]);

  const handleAddFirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await addFirm(trimmed);
    setName("");
    setDialogOpen(false);
  };

  const handleLinkProject = async () => {
    if (!activeFirmId || !selectedProjectId) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    if (project) {
      await linkAuthorizationProject(activeFirmId, project.id, project.name);
    }
    setSelectedProjectId("");
    setLinkDialogOpen(false);
  };

  const handleUnlinkProject = async () => {
    if (!activeFirmId) return;
    if (!window.confirm("Unlink this authorization project from the firm?")) return;
    await unlinkAuthorizationProject(activeFirmId);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Firm
        </span>
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
                  <div className="flex items-center gap-2">
                    <span>{firm.name}</span>
                    {firm.authorizationProjectId && (
                      <Link2 className="h-3 w-3 text-teal-600" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Show linked project badge */}
      {activeFirm?.authorizationProjectId && (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200 text-xs"
          >
            <Link2 className="h-3 w-3 mr-1" />
            Linked to: {activeFirm.authorizationProjectName}
          </Badge>
          <Link
            href={`/authorization-pack/${activeFirm.authorizationProjectId}`}
            className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-slate-500 hover:text-red-600"
            onClick={handleUnlinkProject}
          >
            <Unlink className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {activeFirmId && !activeFirm?.authorizationProjectId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLinkDialogOpen(true)}
            className="text-teal-600 border-teal-200 hover:bg-teal-50"
          >
            <Link2 className="h-4 w-4 mr-1" />
            Link Authorization
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-sm"
        >
          {firms.length === 0 ? "Create firm" : "Add firm"}
        </Button>
      </div>

      {/* Add Firm Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Firm</DialogTitle>
            <DialogDescription>
              Create a firm profile to scope SM&CR records. You can manage
              multiple firms from this workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firm-name">Firm name</Label>
              <Input
                id="firm-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Nasara Payments Ltd"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save firm</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Authorization Project Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" />
              Link Authorization Project
            </DialogTitle>
            <DialogDescription>
              Link this SM&CR firm to an authorization project to show required
              roles and enable cross-module navigation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Loading authorization projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-600">
                  No authorization projects found.
                </p>
                <Link
                  href="/authorization-pack"
                  className="text-sm text-teal-600 hover:underline mt-2 inline-block"
                >
                  Create an authorization project →
                </Link>
              </div>
            ) : (
              <>
                <div>
                  <Label>Select Authorization Project</Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex flex-col">
                            <span>{project.name}</span>
                            <span className="text-xs text-slate-500">
                              {project.permission_name} • {project.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProjectId && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {(() => {
                      const project = projects.find(
                        (p) => p.id === selectedProjectId
                      );
                      if (!project) return null;
                      return (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-slate-900">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">Permission:</span>{" "}
                            {project.permission_name}
                          </div>
                          {project.smcr_roles &&
                            project.smcr_roles.length > 0 && (
                              <div className="text-xs text-slate-600">
                                <span className="font-medium">
                                  Required SM&CR Roles:
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {project.smcr_roles.map((role) => (
                                    <Badge
                                      key={role}
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkProject}
              disabled={!selectedProjectId}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Link Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
