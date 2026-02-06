"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Loader2,
  Save,
  GitBranch,
  User,
  ExternalLink,
  FileDown,
  FolderOpen,
  Pencil,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { allSMFs, psdFunctions } from "@/app/(dashboard)/smcr/data/core-functions";

// ============================================================================
// TYPES
// ============================================================================

interface OrgPerson {
  id: string;
  name: string;
  role: string;
  department: string;
  reportsTo?: string;
  smcrRole?: string;
}

interface CorporateEntity {
  id: string;
  name: string;
  type: "holding" | "subsidiary" | "parent" | "associate" | "branch";
  jurisdiction: string;
  ownershipPct?: number;
  parentEntityId?: string;
  isExternal?: boolean;
}

type StructureSubTab = "org" | "corporate";

interface OrgStructureSectionProps {
  packId: string;
  packName?: string;
  firmName?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPES = [
  { value: "holding" as const, label: "Holding Company" },
  { value: "subsidiary" as const, label: "Subsidiary" },
  { value: "parent" as const, label: "Parent Company" },
  { value: "associate" as const, label: "Associate" },
  { value: "branch" as const, label: "Branch" },
];

const ENTITY_TYPE_HELP: Record<CorporateEntity["type"], string> = {
  parent: "Top of the group structure (no parent within the applicant group).",
  holding: "Typically owns shares in other group entities.",
  subsidiary: "Controlled by its parent (often >50% ownership).",
  associate: "Significant influence, but not full control (often 20-50% ownership).",
  branch: "Operational branch or division (not a separate legal entity).",
};

const ENTITY_COLORS: Record<string, string> = {
  holding: "bg-purple-100 border-purple-300 text-purple-800",
  subsidiary: "bg-blue-100 border-blue-300 text-blue-800",
  parent: "bg-amber-100 border-amber-300 text-amber-800",
  associate: "bg-green-100 border-green-300 text-green-800",
  branch: "bg-slate-100 border-slate-300 text-slate-800",
};

// ============================================================================
// INLINE PERSON EDIT / VIEW ROW
// ============================================================================

interface PersonRowProps {
  person: OrgPerson;
  isEditing: boolean;
  editForm: { name: string; role: string; department: string; reportsTo: string; smcrRole: string };
  setEditForm: React.Dispatch<React.SetStateAction<{ name: string; role: string; department: string; reportsTo: string; smcrRole: string }>>;
  onStartEdit: (person: OrgPerson) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  allPersons: OrgPerson[];
  indented?: boolean;
  showDepartment?: boolean;
}

function PersonRow({
  person,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  allPersons,
  indented = false,
  showDepartment = false,
}: PersonRowProps) {
  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-blue-50 border-l-2 border-blue-400 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="h-7 text-xs"
          />
          <Input
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="Role / Title"
            className="h-7 text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input
            value={editForm.department}
            onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="Department"
            className="h-7 text-xs"
          />
          <Select
            value={editForm.reportsTo || "__none__"}
            onValueChange={(v) => setEditForm((f) => ({ ...f, reportsTo: v === "__none__" ? "" : v }))}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Reports to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {allPersons.filter((x) => x.id !== person.id).map((x) => (
                <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={editForm.smcrRole || "__none__"}
            onValueChange={(v) => setEditForm((f) => ({ ...f, smcrRole: v === "__none__" ? "" : v }))}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="SMCR Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No regulated function</SelectItem>
              {allSMFs.map((smf) => (
                <SelectItem key={smf.id} value={smf.smf_number}>{smf.smf_number} — {smf.title}</SelectItem>
              ))}
              {psdFunctions.map((psd) => (
                <SelectItem key={psd.id} value={psd.psd_number}>{psd.psd_number} — {psd.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" className="h-6 text-xs px-2 bg-teal-600 hover:bg-teal-700" onClick={onSaveEdit}>
            <Check className="h-3 w-3 mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={onCancelEdit}>
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 group cursor-pointer ${indented ? "pl-8" : ""}`} onClick={() => onStartEdit(person)}>
      <User className="h-4 w-4 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800">{person.name}</p>
        <p className="text-[10px] text-slate-500">
          {person.role}
          {person.reportsTo ? ` | Reports to: ${allPersons.find((x) => x.id === person.reportsTo)?.name || "—"}` : ""}
          {showDepartment && person.department ? ` | ${person.department}` : ""}
        </p>
      </div>
      {person.smcrRole && (
        <Badge variant="outline" className="text-[9px] h-5">
          {person.smcrRole}
        </Badge>
      )}
      <button
        className="text-slate-300 hover:text-teal-600 transition"
        onClick={(e) => { e.stopPropagation(); onStartEdit(person); }}
        aria-label={`Edit ${person.name}`}
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
        onClick={(e) => { e.stopPropagation(); onDelete(person.id); }}
        aria-label={`Delete ${person.name}`}
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const DEPT_COLORS = [
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "text-sky-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", icon: "text-pink-500" },
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", icon: "text-violet-500" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", icon: "text-teal-500" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-500" },
];

// ============================================================================
// ORG CHART SVG
// ============================================================================

import {
  ORG_NODE_WIDTH,
  ORG_HORIZONTAL_GAP,
  ORG_VERTICAL_GAP,
} from "@/lib/org-chart-constants";

const NODE_W = ORG_NODE_WIDTH;
const NODE_H = 60; // Auth pack uses shorter nodes
const GAP_H = ORG_HORIZONTAL_GAP;
const GAP_V = ORG_VERTICAL_GAP;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEPT_LABEL_H = 28;

interface TreeNode {
  person: OrgPerson;
  children: TreeNode[];
  x: number;
  y: number;
  subtreeWidth: number;
}

function buildOrgTree(persons: OrgPerson[]) {
  const roots = persons.filter((p) => !p.reportsTo);
  const childrenMap: Record<string, OrgPerson[]> = {};
  persons.forEach((p) => {
    if (p.reportsTo) {
      if (!childrenMap[p.reportsTo]) childrenMap[p.reportsTo] = [];
      childrenMap[p.reportsTo].push(p);
    }
  });

  function buildNode(person: OrgPerson, depth: number): TreeNode {
    const children = (childrenMap[person.id] || []).map((c) => buildNode(c, depth + 1));
    const subtreeWidth = children.length > 0
      ? children.reduce((sum, c) => sum + c.subtreeWidth, 0) + (children.length - 1) * GAP_H
      : NODE_W;

    return { person, children, x: 0, y: depth * (NODE_H + GAP_V), subtreeWidth };
  }

  function layoutNode(node: TreeNode, leftX: number) {
    if (node.children.length === 0) {
      node.x = leftX + (node.subtreeWidth - NODE_W) / 2;
      return;
    }

    let currentX = leftX;
    node.children.forEach((child) => {
      layoutNode(child, currentX);
      currentX += child.subtreeWidth + GAP_H;
    });

    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node.x = (firstChild.x + lastChild.x + NODE_W) / 2 - NODE_W / 2;
  }

  const trees = roots.map((r) => buildNode(r, 0));
  let offsetX = 20;
  trees.forEach((tree) => {
    layoutNode(tree, offsetX);
    offsetX += tree.subtreeWidth + GAP_H * 2;
  });

  const allNodes: TreeNode[] = [];
  const connectors: { from: TreeNode; to: TreeNode }[] = [];

  function flatten(node: TreeNode) {
    allNodes.push(node);
    node.children.forEach((c) => {
      connectors.push({ from: node, to: c });
      flatten(c);
    });
  }
  trees.forEach(flatten);

  const maxX = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.x + NODE_W)) + 40 : 400;
  const maxY = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.y + NODE_H)) + 40 : 300;

  return { nodes: allNodes, connectors, width: Math.max(600, maxX), height: Math.max(300, maxY) };
}

// ============================================================================
// DEPARTMENT GROUPING HELPERS
// ============================================================================

function getDepartments(persons: OrgPerson[]): string[] {
  const deptSet = new Set<string>();
  persons.forEach((p) => {
    if (p.department) deptSet.add(p.department);
  });
  return Array.from(deptSet);
}

function getDeptColor(dept: string, allDepts: string[]) {
  const idx = allDepts.indexOf(dept);
  return DEPT_COLORS[idx % DEPT_COLORS.length];
}

// ============================================================================
// CORPORATE TREE
// ============================================================================

interface CorpNode {
  entity: CorporateEntity;
  children: CorpNode[];
  x: number;
  y: number;
  subtreeWidth: number;
}

function buildCorpTree(entities: CorporateEntity[]) {
  const roots = entities.filter((e) => !e.parentEntityId);
  const childrenMap: Record<string, CorporateEntity[]> = {};
  entities.forEach((e) => {
    if (e.parentEntityId) {
      if (!childrenMap[e.parentEntityId]) childrenMap[e.parentEntityId] = [];
      childrenMap[e.parentEntityId].push(e);
    }
  });

  function buildNode(entity: CorporateEntity, depth: number): CorpNode {
    const children = (childrenMap[entity.id] || []).map((c) => buildNode(c, depth + 1));
    const subtreeWidth = children.length > 0
      ? children.reduce((sum, c) => sum + c.subtreeWidth, 0) + (children.length - 1) * GAP_H
      : NODE_W;
    return { entity, children, x: 0, y: depth * (NODE_H + GAP_V), subtreeWidth };
  }

  function layoutNode(node: CorpNode, leftX: number) {
    if (node.children.length === 0) {
      node.x = leftX + (node.subtreeWidth - NODE_W) / 2;
      return;
    }
    let cx = leftX;
    node.children.forEach((child) => {
      layoutNode(child, cx);
      cx += child.subtreeWidth + GAP_H;
    });
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node.x = (first.x + last.x + NODE_W) / 2 - NODE_W / 2;
  }

  const trees = roots.map((r) => buildNode(r, 0));
  let offsetX = 20;
  trees.forEach((tree) => {
    layoutNode(tree, offsetX);
    offsetX += tree.subtreeWidth + GAP_H * 2;
  });

  const allNodes: CorpNode[] = [];
  const connectors: { from: CorpNode; to: CorpNode }[] = [];
  function flatten(node: CorpNode) {
    allNodes.push(node);
    node.children.forEach((c) => {
      connectors.push({ from: node, to: c });
      flatten(c);
    });
  }
  trees.forEach(flatten);

  const maxX = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.x + NODE_W)) + 40 : 600;
  const maxY = allNodes.length > 0 ? Math.max(...allNodes.map((n) => n.y + NODE_H)) + 40 : 300;

  return { nodes: allNodes, connectors, width: Math.max(600, maxX), height: Math.max(300, maxY) };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OrgStructureSection({ packId, packName, firmName }: OrgStructureSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<StructureSubTab>("org");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Org chart data
  const [persons, setPersons] = useState<OrgPerson[]>([
    { id: "p-1", name: "CEO / Managing Director", role: "Chief Executive", department: "Board", smcrRole: "SMF1" },
    { id: "p-2", name: "Head of Compliance", role: "Compliance Officer", department: "Compliance", reportsTo: "p-1", smcrRole: "SMF16" },
    { id: "p-3", name: "Head of Finance", role: "CFO", department: "Finance", reportsTo: "p-1", smcrRole: "SMF2" },
    { id: "p-4", name: "Head of Operations", role: "COO", department: "Operations", reportsTo: "p-1" },
    { id: "p-5", name: "MLRO", role: "Money Laundering Reporting Officer", department: "Compliance", reportsTo: "p-2", smcrRole: "SMF17" },
  ]);

  // Corporate structure data
  const [entities, setEntities] = useState<CorporateEntity[]>([]);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddEntity, setShowAddEntity] = useState(false);

  // New person form
  const [newPerson, setNewPerson] = useState({
    name: "",
    role: "",
    department: "",
    reportsTo: "",
    smcrRole: "",
  });

  // New entity form
  const [newEntity, setNewEntity] = useState({
    name: "",
    type: "subsidiary" as CorporateEntity["type"],
    jurisdiction: "United Kingdom",
    ownershipPct: 100,
    parentEntityId: "",
    isExternal: false,
  });

  // Inline editing for person nodes
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editPersonForm, setEditPersonForm] = useState({ name: "", role: "", department: "", reportsTo: "", smcrRole: "" });

  const startEditPerson = (person: OrgPerson) => {
    setEditingPersonId(person.id);
    setEditPersonForm({
      name: person.name,
      role: person.role,
      department: person.department,
      reportsTo: person.reportsTo || "",
      smcrRole: person.smcrRole || "",
    });
  };

  const saveEditPerson = () => {
    if (!editingPersonId || !editPersonForm.name.trim()) return;
    setPersons((prev) =>
      prev.map((p) =>
        p.id === editingPersonId
          ? {
              ...p,
              name: editPersonForm.name.trim(),
              role: editPersonForm.role.trim(),
              department: editPersonForm.department.trim(),
              reportsTo: editPersonForm.reportsTo || undefined,
              smcrRole: editPersonForm.smcrRole || undefined,
            }
          : p
      )
    );
    setEditingPersonId(null);
  };

  // Build org tree
  const orgTree = useMemo(() => buildOrgTree(persons), [persons]);

  // Use the legal firm name if available, otherwise fall back to pack name
  const rootEntityName = firmName || packName;

  // Auto-seed firm root entity into state once (persisted, not synthetic)
  useEffect(() => {
    if (!rootEntityName) return;
    const firmRootId = "__firm-root__";
    const hasFirmRoot = entities.some((e) => e.id === firmRootId);
    if (!hasFirmRoot) {
      setEntities((prev) => {
        // Double-check inside updater to avoid race
        if (prev.some((e) => e.id === firmRootId)) return prev;
        const firmEntity: CorporateEntity = {
          id: firmRootId,
          name: rootEntityName,
          type: "parent",
          jurisdiction: "United Kingdom",
        };
        // Re-parent any existing top-level entities under the firm root
        const adjusted = prev.map((e) =>
          !e.parentEntityId ? { ...e, parentEntityId: firmRootId } : e
        );
        return [firmEntity, ...adjusted];
      });
    }
  }, [rootEntityName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update root entity name if firmName loads after initial seed
  useEffect(() => {
    if (!firmName) return;
    const firmRootId = "__firm-root__";
    setEntities((prev) =>
      prev.map((e) => (e.id === firmRootId && e.name !== firmName ? { ...e, name: firmName } : e))
    );
  }, [firmName]);

  // Build corporate tree
  const corpTree = useMemo(() => buildCorpTree(entities), [entities]);

  // Departments
  const departments = useMemo(() => getDepartments(persons), [persons]);

  // Add person
  const handleAddPerson = () => {
    if (!newPerson.name.trim() || !newPerson.role.trim()) return;
    const id = `p-${Date.now()}`;
    setPersons((prev) => [
      ...prev,
      {
        id,
        name: newPerson.name.trim(),
        role: newPerson.role.trim(),
        department: newPerson.department.trim(),
        reportsTo: newPerson.reportsTo || undefined,
        smcrRole: newPerson.smcrRole || undefined,
      },
    ]);
    setNewPerson({ name: "", role: "", department: "", reportsTo: "", smcrRole: "" });
    setShowAddPerson(false);
  };

  // Add entity
  const handleAddEntity = () => {
    if (!newEntity.name.trim()) return;
    const id = `e-${Date.now()}`;
    const parentEntityId = newEntity.parentEntityId?.trim() ? newEntity.parentEntityId.trim() : undefined;
    setEntities((prev) => [
      ...prev,
      {
        id,
        name: newEntity.name.trim(),
        type: newEntity.type,
        jurisdiction: newEntity.jurisdiction.trim(),
        ownershipPct: parentEntityId ? newEntity.ownershipPct : undefined,
        parentEntityId,
        isExternal: newEntity.isExternal,
      },
    ]);
    setNewEntity({ name: "", type: "subsidiary", jurisdiction: "United Kingdom", ownershipPct: 100, parentEntityId: "", isExternal: false });
    setShowAddEntity(false);
  };

  // Save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persons, entities }),
      });
      if (!response.ok) throw new Error("Failed to save");
    } catch {
      setError("Failed to save structure data");
    } finally {
      setIsSaving(false);
    }
  };

  // Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/structure`);
        if (response.ok) {
          const data = await response.json();
          if (data.structure) {
            if (data.structure.persons?.length) setPersons(data.structure.persons);
            if (data.structure.entities?.length) setEntities(data.structure.entities);
          }
        }
      } catch {
        // No saved data yet
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [packId]);

  // PPTX Export
  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      const { exportOrgChartPptx } = await import("@/lib/org-chart-pptx-export");
      await exportOrgChartPptx(persons, entities);
    } catch (err) {
      console.error("PPTX export failed:", err);
      setError("Failed to export PPTX. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // SVG connector path
  const getConnectorPath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const startX = fromX + NODE_W / 2;
    const startY = fromY + NODE_H;
    const endX = toX + NODE_W / 2;
    const endY = toY;
    const midY = (startY + endY) / 2;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading structure...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base">Structure</CardTitle>
                <CardDescription>
                  Organisation chart &amp; corporate hierarchy
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPptx} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileDown className="h-4 w-4 mr-1" />}
                {isExporting ? "Exporting..." : "Export PPTX"}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/smcr/org-chart" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-1" /> SMCR Org Chart
                </Link>
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab("org")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
            activeSubTab === "org"
              ? "border-teal-500 text-teal-700 bg-teal-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Organisation Chart
        </button>
        <button
          onClick={() => setActiveSubTab("corporate")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
            activeSubTab === "corporate"
              ? "border-teal-500 text-teal-700 bg-teal-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          Corporate Structure
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Org Chart */}
      {activeSubTab === "org" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {persons.length} personnel across {departments.length} department{departments.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowAddPerson(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Person
            </Button>
          </div>

          {/* Department legend */}
          {departments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500">Departments:</span>
              {departments.map((dept) => {
                const c = getDeptColor(dept, departments);
                return (
                  <Badge
                    key={dept}
                    variant="outline"
                    className={`text-[9px] ${c.bg} ${c.border} ${c.text}`}
                  >
                    <FolderOpen className={`h-2.5 w-2.5 mr-1 ${c.icon}`} />
                    {dept} ({persons.filter((p) => p.department === dept).length})
                  </Badge>
                );
              })}
            </div>
          )}

          <Card className="border border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-auto bg-slate-50" style={{ maxHeight: "450px" }}>
                <svg width={orgTree.width} height={orgTree.height}>
                  <defs>
                    <pattern id="org-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#org-grid)" />

                  {/* Connectors */}
                  {orgTree.connectors.map((c) => (
                    <path
                      key={`${c.from.person.id}-${c.to.person.id}`}
                      d={getConnectorPath(c.from.x, c.from.y, c.to.x, c.to.y)}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                    />
                  ))}

                  {/* Nodes with department colouring */}
                  {orgTree.nodes.map((node) => {
                    const dept = node.person.department;
                    const deptIdx = departments.indexOf(dept);
                    const palette = DEPT_COLORS[deptIdx >= 0 ? deptIdx % DEPT_COLORS.length : 0];

                    return (
                      <foreignObject
                        key={node.person.id}
                        x={node.x}
                        y={node.y}
                        width={NODE_W}
                        height={NODE_H}
                      >
                        <div
                          className={`h-full rounded-lg border shadow-sm px-3 py-2 transition ${palette.bg} ${palette.border} hover:shadow-md`}
                        >
                          <div className="flex items-center gap-1.5">
                            <User className={`h-3 w-3 ${palette.icon} shrink-0`} />
                            <span className="text-[11px] font-medium text-slate-800 truncate">
                              {node.person.name}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 truncate mt-0.5">{node.person.role}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {node.person.smcrRole && (
                              <Badge className="text-[8px] h-3.5 bg-teal-100 text-teal-700 border-0">
                                {node.person.smcrRole}
                              </Badge>
                            )}
                            <span className={`text-[8px] ${palette.text}`}>{node.person.department}</span>
                          </div>
                        </div>
                      </foreignObject>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* People list grouped by department */}
          <Card className="border border-slate-200">
            <CardContent className="p-0">
              {departments.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {departments.map((dept) => {
                    const deptPersons = persons.filter((p) => p.department === dept);
                    const c = getDeptColor(dept, departments);
                    return (
                      <div key={dept}>
                        <div className={`px-4 py-2 ${c.bg} flex items-center gap-2`}>
                          <FolderOpen className={`h-3.5 w-3.5 ${c.icon}`} />
                          <span className={`text-xs font-semibold ${c.text}`}>{dept}</span>
                          <Badge variant="outline" className={`text-[9px] h-4 ${c.border} ${c.text}`}>
                            {deptPersons.length}
                          </Badge>
                        </div>
                        {deptPersons.map((p) => (
                          <PersonRow
                            key={p.id}
                            person={p}
                            isEditing={editingPersonId === p.id}
                            editForm={editPersonForm}
                            setEditForm={setEditPersonForm}
                            onStartEdit={startEditPerson}
                            onSaveEdit={saveEditPerson}
                            onCancelEdit={() => setEditingPersonId(null)}
                            onDelete={(id) => setPersons((prev) => prev.filter((x) => x.id !== id))}
                            allPersons={persons}
                            indented
                          />
                        ))}
                      </div>
                    );
                  })}
                  {/* Persons without a department */}
                  {persons.filter((p) => !p.department).length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-slate-50 flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">No Department</span>
                      </div>
                      {persons.filter((p) => !p.department).map((p) => (
                        <PersonRow
                          key={p.id}
                          person={p}
                          isEditing={editingPersonId === p.id}
                          editForm={editPersonForm}
                          setEditForm={setEditPersonForm}
                          onStartEdit={startEditPerson}
                          onSaveEdit={saveEditPerson}
                          onCancelEdit={() => setEditingPersonId(null)}
                          onDelete={(id) => setPersons((prev) => prev.filter((x) => x.id !== id))}
                          allPersons={persons}
                          indented
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {persons.map((p) => (
                    <PersonRow
                      key={p.id}
                      person={p}
                      isEditing={editingPersonId === p.id}
                      editForm={editPersonForm}
                      setEditForm={setEditPersonForm}
                      onStartEdit={startEditPerson}
                      onSaveEdit={saveEditPerson}
                      onCancelEdit={() => setEditingPersonId(null)}
                      onDelete={(id) => setPersons((prev) => prev.filter((x) => x.id !== id))}
                      allPersons={persons}
                      showDepartment
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Corporate Structure */}
      {activeSubTab === "corporate" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {entities.length} entit{entities.length !== 1 ? "ies" : "y"} in corporate structure
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowAddEntity(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Entity
            </Button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Ownership %</span> labels show the direct parent ownership of a child entity.
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">External</span> entities use dashed borders/lines and are not part of the applicant group.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ENTITY_TYPES.map((t) => (
                <span
                  key={t.value}
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${ENTITY_COLORS[t.value]}`}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {entities.length === 0 ? (
            <Card className="border border-slate-200">
              <CardContent className="p-8 text-center">
                <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No corporate entities added</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add holding companies, subsidiaries, and associates
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border border-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-auto bg-slate-50" style={{ maxHeight: "400px" }}>
                    <svg width={corpTree.width} height={corpTree.height}>
                      <defs>
                        <pattern id="corp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#corp-grid)" />

                      {/* Connectors with ownership % labels */}
                      {corpTree.connectors.map((c) => {
                        const path = getConnectorPath(c.from.x, c.from.y, c.to.x, c.to.y);
                        const midX = (c.from.x + NODE_W / 2 + c.to.x + NODE_W / 2) / 2;
                        const midY = (c.from.y + NODE_H + c.to.y) / 2;
                        const ownershipPct = c.to.entity.ownershipPct;

                        return (
                          <g key={`${c.from.entity.id}-${c.to.entity.id}`}>
                            {ownershipPct !== undefined ? (
                              <title>{`${c.from.entity.name} owns ${ownershipPct}% of ${c.to.entity.name}`}</title>
                            ) : null}
                            <path
                              d={path}
                              fill="none"
                              stroke={c.to.entity.isExternal ? "#94a3b8" : "#7c3aed"}
                              strokeWidth={1.5}
                              strokeDasharray={c.to.entity.isExternal ? "6,3" : undefined}
                            />
                            {ownershipPct !== undefined && (
                              <>
                                <rect
                                  x={midX - 26}
                                  y={midY - 11}
                                  width={52}
                                  height={22}
                                  rx={5}
                                  fill="rgba(255,255,255,0.96)"
                                  stroke="#7c3aed"
                                  strokeWidth={1.25}
                                />
                                <text
                                  x={midX}
                                  y={midY + 4}
                                  textAnchor="middle"
                                  fontSize={11}
                                  fontWeight={800}
                                  fill="#7c3aed"
                                  paintOrder="stroke"
                                  stroke="white"
                                  strokeWidth={3}
                                  strokeLinejoin="round"
                                >
                                  {ownershipPct}%
                                </text>
                              </>
                            )}
                          </g>
                        );
                      })}

                      {/* Entity nodes */}
                      {corpTree.nodes.map((node) => {
                        const colors = ENTITY_COLORS[node.entity.type] || ENTITY_COLORS.branch;
                        const isExt = node.entity.isExternal;
                        return (
                          <foreignObject
                            key={node.entity.id}
                            x={node.x}
                            y={node.y}
                            width={NODE_W}
                            height={NODE_H}
                          >
                            <div
                              className={`h-full rounded-lg px-3 py-2 shadow-sm ${colors} ${
                                isExt ? "border-2 border-dashed" : "border-2"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                {isExt ? (
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                ) : (
                                  <Building2 className="h-3 w-3 shrink-0" />
                                )}
                                <span className="text-[11px] font-medium truncate">
                                  {node.entity.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] opacity-70">
                                  {node.entity.type} | {node.entity.jurisdiction}
                                </span>
                                {node.entity.parentEntityId && node.entity.ownershipPct !== undefined && (
                                  <Badge
                                    variant="outline"
                                    className="h-3.5 border-slate-200 bg-white/80 px-1.5 text-[8px] text-slate-700"
                                  >
                                    {node.entity.ownershipPct}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </foreignObject>
                        );
                      })}
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Entity list */}
              <Card className="border border-slate-200">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {entities.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 group">
                        {e.isExternal ? (
                          <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
                        ) : (
                          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-medium text-slate-800">{e.name}</p>
                            {e.isExternal && (
                              <Badge variant="outline" className="text-[8px] h-4 border-dashed">External</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {e.type} | {e.jurisdiction}
                            {e.parentEntityId
                              ? ` | Parent: ${entities.find((x) => x.id === e.parentEntityId)?.name || "—"}`
                              : ""}
                            {e.parentEntityId && e.ownershipPct !== undefined
                              ? ` | Owned by parent: ${e.ownershipPct}%`
                              : ""}
                          </p>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
                          onClick={() => setEntities((prev) => prev.filter((x) => x.id !== e.id))}
                          aria-label={`Delete ${e.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Add Person Dialog */}
      <Dialog open={showAddPerson} onOpenChange={setShowAddPerson}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>Add a key person to the organisation chart</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={newPerson.name}
                onChange={(e) => setNewPerson((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Role / Title</Label>
                <Input
                  value={newPerson.role}
                  onChange={(e) => setNewPerson((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Head of Compliance"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Input
                  value={newPerson.department}
                  onChange={(e) => setNewPerson((p) => ({ ...p, department: e.target.value }))}
                  placeholder="e.g. Compliance"
                />
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Reports To</Label>
                <Select
                  value={newPerson.reportsTo || "__none__"}
                  onValueChange={(v) => setNewPerson((p) => ({ ...p, reportsTo: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (top-level)</SelectItem>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SMCR / PSD Role (optional)</Label>
                <Select
                  value={newPerson.smcrRole || "__none__"}
                  onValueChange={(v) => setNewPerson((p) => ({ ...p, smcrRole: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No regulated function</SelectItem>
                    {allSMFs.map((smf) => (
                      <SelectItem key={smf.id} value={smf.smf_number}>
                        {smf.smf_number} — {smf.title}
                      </SelectItem>
                    ))}
                    {psdFunctions.map((psd) => (
                      <SelectItem key={psd.id} value={psd.psd_number}>
                        {psd.psd_number} — {psd.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPerson(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddPerson} disabled={!newPerson.name.trim()}>
              Add Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Entity Dialog */}
      <Dialog open={showAddEntity} onOpenChange={setShowAddEntity}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Corporate Entity</DialogTitle>
            <DialogDescription>Add a company to the corporate structure</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Entity Name</Label>
              <Input
                value={newEntity.name}
                onChange={(e) => setNewEntity((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. PayCo Holdings Ltd"
              />
            </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={newEntity.type}
                    onValueChange={(v) => setNewEntity((p) => ({ ...p, type: v as CorporateEntity["type"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500">
                    {ENTITY_TYPE_HELP[newEntity.type]}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Jurisdiction</Label>
                  <Input
                    value={newEntity.jurisdiction}
                  onChange={(e) => setNewEntity((p) => ({ ...p, jurisdiction: e.target.value }))}
                  placeholder="United Kingdom"
                />
              </div>
            </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Parent Entity</Label>
                  <Select
                    value={newEntity.parentEntityId || "__none__"}
                    onValueChange={(v) => setNewEntity((p) => ({ ...p, parentEntityId: v === "__none__" ? "" : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (top-level)</SelectItem>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ownership %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={newEntity.parentEntityId ? newEntity.ownershipPct : ""}
                    onChange={(e) => setNewEntity((p) => ({ ...p, ownershipPct: Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)) }))}
                    disabled={!newEntity.parentEntityId}
                    placeholder={!newEntity.parentEntityId ? "Set parent first" : undefined}
                  />
                  <p className="text-[11px] text-slate-500">
                    Percentage owned by the selected parent entity (direct ownership).
                  </p>
                </div>
              </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isExternal"
                checked={newEntity.isExternal}
                onChange={(e) => setNewEntity((p) => ({ ...p, isExternal: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <Label htmlFor="isExternal" className="text-xs">
                External / linked organisation (not part of the applicant group)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEntity(false)}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddEntity} disabled={!newEntity.name.trim()}>
              Add Entity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
