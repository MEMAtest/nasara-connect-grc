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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSmcrData, PersonRecord, RoleAssignment } from "../context/SmcrDataContext";
import { OrgChartIcon } from "../components/SmcrIcons";
import { FirmSwitcher } from "../components/FirmSwitcher";

// ============================================================================
// ADD PERSON FORM
// ============================================================================

interface AddPersonForm {
  name: string;
  employeeId: string;
  title: string;
  department: string;
  email: string;
  lineManager: string;
}

const initialAddPersonForm: AddPersonForm = {
  name: "",
  employeeId: "",
  title: "",
  department: "",
  email: "",
  lineManager: "",
};

// ============================================================================
// TYPES
// ============================================================================

interface OrgNode {
  id: string;
  person: PersonRecord;
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

function buildOrgTree(people: PersonRecord[], roles: RoleAssignment[]): OrgNode[] {
  const rolesByPerson = new Map<string, RoleAssignment[]>();
  roles.forEach((role) => {
    const list = rolesByPerson.get(role.personId) ?? [];
    list.push(role);
    rolesByPerson.set(role.personId, list);
  });

  const nodes = new Map<string, OrgNode>();
  people.forEach((person) => {
    nodes.set(person.id, {
      id: person.id,
      person,
      roles: rolesByPerson.get(person.id) ?? [],
      managerId: person.lineManager
        ? people.find((p) => p.name.toLowerCase() === person.lineManager?.toLowerCase())?.id
        : undefined,
      children: [],
    });
  });

  const roots: OrgNode[] = [];
  nodes.forEach((node) => {
    if (node.managerId && nodes.has(node.managerId)) {
      const parent = nodes.get(node.managerId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortChildren = (node: OrgNode) => {
    node.children.sort((a, b) => a.person.name.localeCompare(b.person.name));
    node.children.forEach(sortChildren);
  };
  roots.sort((a, b) => a.person.name.localeCompare(b.person.name));
  roots.forEach(sortChildren);

  return roots;
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

function OrgChartNode({
  node,
  position,
  isSelected,
  isExpanded,
  hasChildren,
  onSelect,
  onToggle,
}: OrgChartNodeProps) {
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
            getNodeBorderColor(node.roles),
            isSelected && "ring-2 ring-teal-500 ring-offset-2"
          )}
        >
          <div className="flex h-full items-center gap-2">
            {/* Avatar */}
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br",
                getNodeGradient(node.roles)
              )}
            >
              <User className="h-5 w-5 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">
                {node.person.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {node.person.title || node.person.department}
              </p>
              {node.roles.length > 0 && (
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
  const { state, firms, activeFirmId, updatePerson, addPerson } = useSmcrData();
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

  // Build org tree
  const orgTree = useMemo(() => buildOrgTree(firmPeople, firmRoles), [firmPeople, firmRoles]);

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
      // Dynamic import of html2canvas (optional dependency)
      // @ts-expect-error - html2canvas is an optional dependency
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
    if (!selectedNode) return;
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
    if (!addPersonForm.name || !addPersonForm.employeeId) return;

    addPerson({
      name: addPersonForm.name.trim(),
      title: addPersonForm.title.trim() || undefined,
      department: addPersonForm.department.trim() || "General",
      email: addPersonForm.email.trim() || `${addPersonForm.employeeId.toLowerCase()}@company.com`,
      lineManager: addPersonForm.lineManager || undefined,
    });

    setAddPersonForm(initialAddPersonForm);
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
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-xs text-slate-600">SMF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-400" />
              <span className="text-xs text-slate-600">CF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-600">Other</span>
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
                      <p className="text-xs text-slate-500">{selectedNode.person.employeeId}</p>
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
              Update who {selectedNode?.person.name} reports to.
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
                <Label htmlFor="employee-id">Employee ID *</Label>
                <Input
                  id="employee-id"
                  value={addPersonForm.employeeId}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="e.g., EMP001"
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
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={addPersonForm.department}
                  onChange={(e) => setAddPersonForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Risk Management"
                />
              </div>
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
            <div>
              <Label htmlFor="line-manager">Reports to</Label>
              <Select
                value={addPersonForm.lineManager || "__none__"}
                onValueChange={(v) => setAddPersonForm((prev) => ({ ...prev, lineManager: v === "__none__" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
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
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAddPersonDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPerson}
                disabled={!addPersonForm.name.trim() || !addPersonForm.employeeId.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
