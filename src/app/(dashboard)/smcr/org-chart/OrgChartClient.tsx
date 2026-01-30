"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  User,
  Users,
  Edit,
  LayoutGrid,
  GitBranch,
  Move,
  RotateCcw,
  Plus,
  GripVertical,
  HelpCircle,
  Building2,
  FolderOpen,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast-provider";
import { useSmcrData, PersonRecord, RoleAssignment } from "../context/SmcrDataContext";
import { OrgChartIcon } from "../components/SmcrIcons";
import { FirmSwitcher } from "../components/FirmSwitcher";
import { allSMFs } from "../data/core-functions";

// ============================================================================
// ADD PERSON FORM
// ============================================================================

interface AddPersonForm {
  name: string;
  title: string;
  department: string;
  email: string;
  lineManager: string;
  irn: string;
  smcrRoles: string[];
}

const initialAddPersonForm: AddPersonForm = {
  name: "",
  title: "",
  department: "",
  email: "",
  lineManager: "",
  irn: "",
  smcrRoles: [],
};

// ============================================================================
// TYPES
// ============================================================================

type OrgNodeType = "person" | "company" | "department";

interface OrgNode {
  id: string;
  type: OrgNodeType;
  person?: PersonRecord;
  label: string;
  subtitle?: string;
  roles: RoleAssignment[];
  managerId?: string;
  children: OrgNode[];
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TreeLayout {
  positions: Map<string, NodePosition>;
  width: number;
  height: number;
  connectors: ConnectorPath[];
}

interface ConnectorPath {
  id: string;
  path: string;
  parentId: string;
  childId: string;
}

type LayoutDirection = "vertical" | "horizontal";

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 60;
const PADDING = 40;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function buildOrgTree(
  people: PersonRecord[],
  roles: RoleAssignment[],
  firmName?: string,
  customDepartments?: string[]
): OrgNode[] {
  const rolesByPerson = new Map<string, RoleAssignment[]>();
  roles.forEach((role) => {
    const list = rolesByPerson.get(role.personId) ?? [];
    list.push(role);
    rolesByPerson.set(role.personId, list);
  });

  // Build person nodes
  const personNodes = new Map<string, OrgNode>();
  people.forEach((person) => {
    personNodes.set(person.id, {
      id: person.id,
      type: "person",
      person,
      label: person.name,
      subtitle: person.title || person.department,
      roles: rolesByPerson.get(person.id) ?? [],
      managerId: person.lineManager
        ? people.find((p) => p.name.toLowerCase() === person.lineManager?.toLowerCase())?.id
        : undefined,
      children: [],
    });
  });

  // Resolve manager relationships within person nodes
  const topLevelPeople: OrgNode[] = [];
  personNodes.forEach((node) => {
    if (node.managerId && personNodes.has(node.managerId)) {
      const parent = personNodes.get(node.managerId)!;
      parent.children.push(node);
    } else {
      topLevelPeople.push(node);
    }
  });

  // Sort children
  const sortChildren = (node: OrgNode) => {
    node.children.sort((a, b) => a.label.localeCompare(b.label));
    node.children.forEach(sortChildren);
  };
  topLevelPeople.sort((a, b) => a.label.localeCompare(b.label));
  topLevelPeople.forEach(sortChildren);

  // Group top-level people by department
  const departments = new Map<string, OrgNode[]>();
  const noDept: OrgNode[] = [];

  topLevelPeople.forEach((node) => {
    const dept = node.person?.department;
    if (dept && dept !== "General") {
      const list = departments.get(dept) ?? [];
      list.push(node);
      departments.set(dept, list);
    } else {
      noDept.push(node);
    }
  });

  // Add any custom (manually created) departments that have no people
  customDepartments?.forEach((dept) => {
    if (!departments.has(dept)) {
      departments.set(dept, []);
    }
  });

  // Create department nodes
  const deptNodes: OrgNode[] = [];
  departments.forEach((deptPeople, deptName) => {
    deptNodes.push({
      id: `dept-${deptName.toLowerCase().replace(/\s+/g, "-")}`,
      type: "department",
      label: deptName,
      subtitle: `${deptPeople.length} ${deptPeople.length === 1 ? "person" : "people"}`,
      roles: [],
      children: deptPeople,
    });
  });

  deptNodes.sort((a, b) => a.label.localeCompare(b.label));

  // Create company root node if firm name exists
  if (firmName) {
    const companyNode: OrgNode = {
      id: "company-root",
      type: "company",
      label: firmName,
      subtitle: `${people.length} ${people.length === 1 ? "person" : "people"}`,
      roles: [],
      children: [...deptNodes, ...noDept],
    };
    return [companyNode];
  }

  // If no firm name, just return dept nodes + unassigned people
  return [...deptNodes, ...noDept];
}

function getRoleColor(functionType?: string): string {
  if (functionType === "SMF") return "bg-amber-100 border-amber-300 text-amber-800";
  if (functionType === "CF") return "bg-sky-100 border-sky-300 text-sky-800";
  return "bg-slate-100 border-slate-300 text-slate-700";
}

function getNodeBorderColor(roles: RoleAssignment[]): string {
  const hasSMF = roles.some((r) => r.functionType === "SMF");
  const hasCF = roles.some((r) => r.functionType === "CF");
  if (hasSMF) return "border-amber-400";
  if (hasCF) return "border-sky-400";
  return "border-slate-200";
}

function getNodeGradient(roles: RoleAssignment[]): string {
  const hasSMF = roles.some((r) => r.functionType === "SMF");
  const hasCF = roles.some((r) => r.functionType === "CF");
  if (hasSMF) return "from-amber-400 to-amber-500";
  if (hasCF) return "from-sky-400 to-sky-500";
  return "from-slate-300 to-slate-400";
}

// ============================================================================
// TREE LAYOUT ALGORITHM
// ============================================================================

function calculateTreeLayout(
  roots: OrgNode[],
  expandedNodes: Set<string>,
  direction: LayoutDirection
): TreeLayout {
  const positions = new Map<string, NodePosition>();
  const connectors: ConnectorPath[] = [];

  if (roots.length === 0) {
    return { positions, width: 0, height: 0, connectors };
  }

  const isVertical = direction === "vertical";
  const nodeW = isVertical ? NODE_WIDTH : NODE_HEIGHT;
  const nodeH = isVertical ? NODE_HEIGHT : NODE_WIDTH;
  const hGap = isVertical ? HORIZONTAL_GAP : VERTICAL_GAP;
  const vGap = isVertical ? VERTICAL_GAP : HORIZONTAL_GAP;

  // Calculate subtree widths
  function getSubtreeWidth(node: OrgNode): number {
    if (!expandedNodes.has(node.id) || node.children.length === 0) {
      return nodeW;
    }
    const childrenWidth = node.children.reduce(
      (sum, child) => sum + getSubtreeWidth(child) + hGap,
      -hGap
    );
    return Math.max(nodeW, childrenWidth);
  }

  // Position nodes recursively
  function positionNode(node: OrgNode, x: number, y: number, parentId?: string) {
    const subtreeWidth = getSubtreeWidth(node);
    const nodeX = x + (subtreeWidth - nodeW) / 2;
    const nodeY = y;

    if (isVertical) {
      positions.set(node.id, {
        x: nodeX,
        y: nodeY,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    } else {
      // Horizontal layout: swap x and y, and dimensions
      positions.set(node.id, {
        x: nodeY,
        y: nodeX,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      });
    }

    // Create connector path
    if (parentId) {
      const parentPos = positions.get(parentId);
      const childPos = positions.get(node.id);
      if (parentPos && childPos) {
        const path = createConnectorPath(parentPos, childPos, isVertical);
        connectors.push({
          id: `${parentId}-${node.id}`,
          path,
          parentId,
          childId: node.id,
        });
      }
    }

    // Position children
    if (expandedNodes.has(node.id) && node.children.length > 0) {
      let childX = x;
      node.children.forEach((child) => {
        const childSubtreeWidth = getSubtreeWidth(child);
        positionNode(child, childX, y + nodeH + vGap, node.id);
        childX += childSubtreeWidth + hGap;
      });
    }
  }

  // Position all roots
  let currentX = PADDING;
  roots.forEach((root) => {
    const subtreeWidth = getSubtreeWidth(root);
    positionNode(root, currentX, PADDING);
    currentX += subtreeWidth + hGap;
  });

  // Calculate total dimensions
  let maxX = 0;
  let maxY = 0;
  positions.forEach((pos) => {
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  });

  return {
    positions,
    width: maxX + PADDING,
    height: maxY + PADDING,
    connectors,
  };
}

function createConnectorPath(
  parent: NodePosition,
  child: NodePosition,
  isVertical: boolean
): string {
  if (isVertical) {
    // Vertical: parent above child
    const startX = parent.x + parent.width / 2;
    const startY = parent.y + parent.height;
    const endX = child.x + child.width / 2;
    const endY = child.y;
    const midY = (startY + endY) / 2;

    // Curved path with bezier
    return `M ${startX} ${startY}
            C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  } else {
    // Horizontal: parent left of child
    const startX = parent.x + parent.width;
    const startY = parent.y + parent.height / 2;
    const endX = child.x;
    const endY = child.y + child.height / 2;
    const midX = (startX + endX) / 2;

    return `M ${startX} ${startY}
            C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface OrgChartNodeProps {
  node: OrgNode;
  position: NodePosition;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onSelect: (node: OrgNode) => void;
  onToggle: (id: string) => void;
}

function getNodeTypeStyles(type: OrgNodeType) {
  switch (type) {
    case "company":
      return {
        border: "border-blue-400",
        bg: "bg-blue-50",
        iconBg: "from-blue-500 to-blue-600",
        icon: Building2,
      };
    case "department":
      return {
        border: "border-slate-400",
        bg: "bg-slate-50",
        iconBg: "from-slate-400 to-slate-500",
        icon: FolderOpen,
      };
    default:
      return null;
  }
}

function OrgChartNode({
  node,
  position,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
}: OrgChartNodeProps) {
  const typeStyles = getNodeTypeStyles(node.type);

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className="cursor-pointer"
      onClick={() => onSelect(node)}
    >
      {/* Node background */}
      <foreignObject width={position.width} height={position.height}>
        <div
          className={cn(
            "h-full w-full rounded-lg border-2 bg-white p-2 shadow-sm transition-all hover:shadow-md",
            typeStyles ? typeStyles.border : getNodeBorderColor(node.roles),
            typeStyles?.bg,
            isSelected && "ring-2 ring-teal-500 ring-offset-2"
          )}
        >
          <div className="flex h-full items-center gap-2">
            {/* Avatar / Icon */}
            {typeStyles ? (
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br",
                  typeStyles.iconBg
                )}
              >
                <typeStyles.icon className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br",
                  getNodeGradient(node.roles)
                )}
              >
                <User className="h-5 w-5 text-white" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className={cn(
                "font-medium text-slate-900 truncate",
                node.type === "company" ? "text-sm font-semibold" : "text-sm"
              )}>
                {node.label}
              </p>
              {node.subtitle && (
                <p className="text-xs text-slate-500 truncate">
                  {node.subtitle}
                </p>
              )}
              {node.type === "person" && node.roles.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {node.roles.slice(0, 1).map((role) => (
                    <Badge
                      key={role.id}
                      variant="outline"
                      className={cn("text-[9px] px-1 py-0", getRoleColor(role.functionType))}
                    >
                      {role.functionLabel.split(" - ")[0]}
                    </Badge>
                  ))}
                  {node.roles.length > 1 && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 bg-slate-50">
                      +{node.roles.length - 1}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Expand/collapse button */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(node.id);
                }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isExpanded
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {isExpanded ? "−" : "+"}
              </button>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

interface ConnectorLinesProps {
  connectors: ConnectorPath[];
}

function ConnectorLines({ connectors }: ConnectorLinesProps) {
  return (
    <g className="connectors">
      {connectors.map((connector) => (
        <path
          key={connector.id}
          d={connector.path}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={2}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      ))}
    </g>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OrgChartClient() {
  const { state, firms, activeFirmId, updatePerson, addPerson, assignRole } = useSmcrData();
  const toast = useToast();
  const { people, roles } = state;

  // Filter data by firm
  const firmPeople = useMemo(() => {
    if (!activeFirmId) return [] as PersonRecord[];
    return people.filter((person) => person.firmId === activeFirmId);
  }, [people, activeFirmId]);

  const firmRoles = useMemo(() => {
    if (!activeFirmId) return [] as RoleAssignment[];
    return roles.filter((role) => role.firmId === activeFirmId);
  }, [roles, activeFirmId]);

  // Custom departments state
  const [customDepartments, setCustomDepartments] = useState<string[]>([]);
  const [addDeptDialogOpen, setAddDeptDialogOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  // Build org tree
  const activeFirm = firms.find((f) => f.id === activeFirmId);
  const orgTree = useMemo(
    () => buildOrgTree(firmPeople, firmRoles, activeFirm?.name, customDepartments),
    [firmPeople, firmRoles, activeFirm?.name, customDepartments]
  );

  // State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const allIds = new Set<string>();
    const collectIds = (nodes: OrgNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(orgTree);
    return allIds;
  });

  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [zoom, setZoom] = useState(100);
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("vertical");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editManager, setEditManager] = useState("");

  // Add person dialog state
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [addPersonForm, setAddPersonForm] = useState<AddPersonForm>(initialAddPersonForm);

  // Inline IRN verification for add person
  const [irnVerifyLoading, setIrnVerifyLoading] = useState(false);
  const [irnVerifyResult, setIrnVerifyResult] = useState<{ name: string; status: string } | null>(null);
  const [irnVerifyError, setIrnVerifyError] = useState<string | null>(null);

  // Pan/drag state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Calculate layout
  const treeLayout = useMemo(
    () => calculateTreeLayout(orgTree, expandedNodes, layoutDirection),
    [orgTree, expandedNodes, layoutDirection]
  );

  // Update expanded nodes when tree changes
  useEffect(() => {
    const allIds = new Set<string>();
    const collectIds = (nodes: OrgNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(orgTree);
    setExpandedNodes(allIds);
  }, [orgTree]);

  // Handlers
  const handleToggle = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback((node: OrgNode) => {
    setSelectedNode(node);
  }, []);

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: OrgNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(orgTree);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    // Keep only root nodes expanded
    const rootIds = new Set(orgTree.map((n) => n.id));
    setExpandedNodes(rootIds);
  };

  const handleResetView = () => {
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleExportPNG = async () => {
    if (!svgRef.current || !containerRef.current) return;

    try {
      // Dynamic import of html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      const container = containerRef.current;

      const canvas = await html2canvas(container, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `org-chart-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.alert("Export functionality requires html2canvas. Please install it with: npm install html2canvas");
    }
  };

  const handleEditReportingLine = () => {
    if (!selectedNode || !selectedNode.person) return;
    setEditManager(selectedNode.person.lineManager ?? "");
    setEditDialogOpen(true);
  };

  const handleSaveReportingLine = () => {
    if (!selectedNode) return;
    updatePerson(selectedNode.id, {
      lineManager: editManager.trim() || undefined,
    });
    setEditDialogOpen(false);
    setSelectedNode(null);
  };

  const handleAddPerson = () => {
    if (!addPersonForm.name.trim()) return;

    const personId = addPerson({
      name: addPersonForm.name.trim(),
      title: addPersonForm.title.trim() || undefined,
      department: addPersonForm.department.trim() || "General",
      email: addPersonForm.email.trim() || "",
      lineManager: addPersonForm.lineManager || undefined,
      irn: addPersonForm.irn.trim() || undefined,
    });

    // Assign selected SMCR roles
    if (addPersonForm.smcrRoles.length > 0) {
      const failedRoles: string[] = [];
      for (const roleId of addPersonForm.smcrRoles) {
        const smf = allSMFs.find((s) => s.id === roleId);
        if (smf) {
          try {
            assignRole({
              personId,
              functionId: smf.id,
              functionType: "SMF",
              startDate: new Date().toISOString(),
              approvalStatus: "draft",
            });
          } catch {
            failedRoles.push(smf.smf_number || smf.id);
          }
        }
      }
      if (failedRoles.length > 0) {
        toast.warning(`Person added but failed to assign: ${failedRoles.join(", ")}. You can assign roles from the People page.`);
      }
    }

    setAddPersonForm(initialAddPersonForm);
    setIrnVerifyResult(null);
    setIrnVerifyError(null);
    setAddPersonDialogOpen(false);
  };

  // Pan handlers - only pan when space is pressed or middle mouse button
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning if space is pressed, or middle mouse button, or clicking on empty canvas
    if ((e.button === 0 && spacePressed) || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Collect all nodes for rendering
  const allNodes: Array<{ node: OrgNode; depth: number }> = [];
  const collectNodes = (nodes: OrgNode[], depth: number = 0) => {
    nodes.forEach((node) => {
      allNodes.push({ node, depth });
      if (expandedNodes.has(node.id)) {
        collectNodes(node.children, depth + 1);
      }
    });
  };
  collectNodes(orgTree);

  const hasFirm = Boolean(activeFirmId && firms.length > 0);

  if (!hasFirm) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <FirmSwitcher />
            <p className="text-sm text-slate-600">
              Select a firm to view the organizational chart.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <OrgChartIcon size={48} />
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Organization Chart</h1>
            <p className="text-slate-600 mt-1">
              Visualize reporting lines and SM&CR role assignments across your firm.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FirmSwitcher />
          <Button variant="outline" onClick={() => setAddDeptDialogOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Add Department
          </Button>
          <Button onClick={() => setAddPersonDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.max(25, z - 10))}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 w-16 text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Layout toggle */}
          <div className="flex items-center gap-2 border-l pl-4">
            <Button
              variant={layoutDirection === "vertical" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutDirection("vertical")}
              className="gap-1.5"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Vertical</span>
            </Button>
            <Button
              variant={layoutDirection === "horizontal" ? "default" : "outline"}
              size="sm"
              onClick={() => setLayoutDirection("horizontal")}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Horizontal</span>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Layout guide"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-xs bg-white text-slate-700 border border-slate-200 shadow-lg p-3"
              >
                <p className="font-medium text-slate-900 mb-2">Layout Guide</p>
                <p className="text-xs mb-2">
                  <strong>Vertical:</strong> Top-down view, best for deep hierarchies with many reporting levels.
                </p>
                <p className="text-xs">
                  <strong>Horizontal:</strong> Left-to-right view, best for wider/flatter organizations.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Expand/Collapse */}
          <div className="flex items-center gap-2 border-l pl-4">
            <Button variant="outline" size="sm" onClick={handleExpandAll}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Expand
            </Button>
            <Button variant="outline" size="sm" onClick={handleCollapseAll}>
              Collapse
            </Button>
          </div>

          {/* Reset & Export */}
          <div className="flex items-center gap-2 border-l pl-4">
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 ml-auto flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-600">Company</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-600">Dept</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-xs text-slate-600">SMF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-400" />
              <span className="text-xs text-slate-600">CF</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Org Chart Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0 overflow-hidden">
              <div
                ref={containerRef}
                className={cn(
                  "min-h-[500px] overflow-hidden bg-slate-50/50 relative",
                  spacePressed ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Pan hint */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 px-2 py-1 rounded shadow-sm">
                  <Move className="h-3 w-3" />
                  Hold Space + drag to pan
                </div>

                {orgTree.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <Users className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-600">No people in this firm yet.</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Add people to see the organizational chart.
                    </p>
                  </div>
                ) : (
                  <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${Math.max(treeLayout.width, 800)} ${Math.max(treeLayout.height, 500)}`}
                    style={{
                      minHeight: "500px",
                      transform: `scale(${zoom / 100}) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
                      transformOrigin: "top left",
                    }}
                  >
                    {/* Connector lines */}
                    <ConnectorLines connectors={treeLayout.connectors} />

                    {/* Nodes */}
                    {allNodes.map(({ node }) => {
                      const position = treeLayout.positions.get(node.id);
                      if (!position) return null;

                      return (
                        <OrgChartNode
                          key={node.id}
                          node={node}
                          position={position}
                          isSelected={selectedNode?.id === node.id}
                          isExpanded={expandedNodes.has(node.id)}
                          hasChildren={node.children.length > 0}
                          onSelect={handleSelect}
                          onToggle={handleToggle}
                        />
                      );
                    })}
                  </svg>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Person Details */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Person Details</CardTitle>
              <CardDescription>Select a person to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  {selectedNode.type === "company" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{selectedNode.label}</p>
                          <p className="text-xs text-slate-500">Company</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Departments:</span>
                          <span className="ml-2 text-slate-700">
                            {selectedNode.children.filter(c => c.type === "department").length}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Total People:</span>
                          <span className="ml-2 text-slate-700">{firmPeople.length}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedNode.type === "department" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500">
                          <FolderOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{selectedNode.label}</p>
                          <p className="text-xs text-slate-500">Department</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">People:</span>
                          <span className="ml-2 text-slate-700">{selectedNode.children.length}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedNode.type === "person" && selectedNode.person && (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br",
                            getNodeGradient(selectedNode.roles)
                          )}
                        >
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{selectedNode.person.name}</p>
                          {selectedNode.person.title && <p className="text-xs text-slate-500">{selectedNode.person.title}</p>}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-500">Title:</span>
                          <span className="ml-2 text-slate-700">{selectedNode.person.title || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Department:</span>
                          <span className="ml-2 text-slate-700">{selectedNode.person.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Reports to:</span>
                          <span className="ml-2 text-slate-700">
                            {selectedNode.person.lineManager || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Direct reports:</span>
                          <span className="ml-2 text-slate-700">{selectedNode.children.length}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-2">
                          Assigned Roles
                        </p>
                        {selectedNode.roles.length === 0 ? (
                          <p className="text-sm text-slate-500">No roles assigned</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedNode.roles.map((role) => (
                              <div
                                key={role.id}
                                className={cn(
                                  "rounded-lg border p-2",
                                  getRoleColor(role.functionType)
                                )}
                              >
                                <p className="text-xs font-medium">{role.functionLabel}</p>
                                <p className="text-[10px] opacity-75">{role.functionType}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleEditReportingLine}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Reporting Line
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Click on a person in the chart to view their details and edit reporting lines.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Reporting Line Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reporting Line</DialogTitle>
            <DialogDescription>
              Update who {selectedNode?.person?.name ?? selectedNode?.label} reports to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="manager">Reports to</Label>
              <Select value={editManager || "__none__"} onValueChange={(v) => setEditManager(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No manager (top level)</SelectItem>
                  {firmPeople
                    .filter((p) => p.id !== selectedNode?.id)
                    .map((person) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name} ({person.department})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveReportingLine}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Person Dialog */}
      <Dialog open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Person to Org Chart</DialogTitle>
            <DialogDescription>
              Add a new person to your organization. They will appear in the chart based on their reporting line.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="person-name">Name *</Label>
                <Input
                  id="person-name"
                  value={addPersonForm.name}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={addPersonForm.department}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Risk Management"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={addPersonForm.title}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Senior Manager"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={addPersonForm.email}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="person@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="irn">FCA IRN</Label>
                <div className="flex gap-2">
                  <Input
                    id="irn"
                    value={addPersonForm.irn}
                    onChange={(e) => {
                      setAddPersonForm((prev) => ({ ...prev, irn: e.target.value }));
                      setIrnVerifyResult(null);
                      setIrnVerifyError(null);
                    }}
                    placeholder="e.g., ABC12345"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!addPersonForm.irn.trim() || irnVerifyLoading}
                    onClick={() => {
                      setIrnVerifyLoading(true);
                      setIrnVerifyResult(null);
                      setIrnVerifyError(null);
                      fetch(`/api/fca-register/individual/${encodeURIComponent(addPersonForm.irn.trim())}`)
                        .then((res) => {
                          if (!res.ok) throw new Error("Not found");
                          return res.json();
                        })
                        .then((data) => {
                          setIrnVerifyResult({ name: data.individual.name, status: data.individual.status });
                          // Auto-populate name if empty or still default
                          if (!addPersonForm.name.trim()) {
                            setAddPersonForm((prev) => ({ ...prev, name: data.individual.name }));
                          }
                        })
                        .catch(() => {
                          setIrnVerifyError("Not found on FCA Register");
                        })
                        .finally(() => setIrnVerifyLoading(false));
                    }}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    {irnVerifyLoading ? "..." : "Verify"}
                  </Button>
                </div>
                {irnVerifyResult && (
                  <div className="mt-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
                    <p className="text-sm font-medium text-emerald-800">{irnVerifyResult.name}</p>
                    <p className="text-xs text-emerald-600">{irnVerifyResult.status}</p>
                  </div>
                )}
                {irnVerifyError && (
                  <p className="text-xs text-rose-600 mt-1">{irnVerifyError}</p>
                )}
              </div>
              <div>
                <Label htmlFor="line-manager">Reports to</Label>
                <Select
                  value={addPersonForm.lineManager || "__none__"}
                  onValueChange={(v) => setAddPersonForm((prev) => ({ ...prev, lineManager: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No manager (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No manager (top level)</SelectItem>
                    {firmPeople.map((person) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name} ({person.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>SMCR Role (optional)</Label>
              <Select
                value=""
                onValueChange={(v) => {
                  if (v && !addPersonForm.smcrRoles.includes(v)) {
                    setAddPersonForm((prev) => ({ ...prev, smcrRoles: [...prev.smcrRoles, v] }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SMCR role..." />
                </SelectTrigger>
                <SelectContent>
                  {allSMFs
                    .filter((s) => !addPersonForm.smcrRoles.includes(s.id))
                    .map((smf) => (
                      <SelectItem key={smf.id} value={smf.id}>
                        {smf.smf_number} — {smf.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {addPersonForm.smcrRoles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {addPersonForm.smcrRoles.map((roleId) => {
                    const smf = allSMFs.find((s) => s.id === roleId);
                    return (
                      <Badge key={roleId} variant="secondary" className="gap-1">
                        {smf?.smf_number} — {smf?.title}
                        <button
                          type="button"
                          aria-label={`Remove ${smf?.smf_number || "role"}`}
                          className="ml-1 hover:text-destructive"
                          onClick={() =>
                            setAddPersonForm((prev) => ({
                              ...prev,
                              smcrRoles: prev.smcrRoles.filter((r) => r !== roleId),
                            }))
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAddPersonDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPerson}
                disabled={!addPersonForm.name.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Department Dialog */}
      <Dialog open={addDeptDialogOpen} onOpenChange={setAddDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Create a new department grouping in the org chart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dept-name">Department Name *</Label>
              <Input
                id="dept-name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Risk Management"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddDeptDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (newDeptName.trim()) {
                    setCustomDepartments(prev => [...prev, newDeptName.trim()]);
                    setNewDeptName("");
                    setAddDeptDialogOpen(false);
                  }
                }}
                disabled={!newDeptName.trim()}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
