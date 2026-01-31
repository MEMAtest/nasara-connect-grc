"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  CircleDot,
  Download,
  Eraser,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  GripVertical,
  Building2,
  Wallet,
  ArrowLeftRight,
  Target,
  Wand2,
  X,
  RotateCcw,
  Link2,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface FlowNode {
  id: string;
  type: "source" | "process" | "destination" | "account";
  label: string;
  description?: string;
  x: number;
  y: number;
}

interface FlowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  flowType: "incoming" | "outgoing" | "internal";
}

interface FlowDiagramState {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

interface FlowOfFundsBuilderProps {
  packId: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_TYPES = [
  { value: "source" as const, label: "Source", description: "Where funds originate (e.g. customer, borrower, investor)", icon: ArrowRight, color: "bg-green-100 border-green-300 text-green-800" },
  { value: "process" as const, label: "Process", description: "A processing step (e.g. payment gateway, AML check, credit scoring)", icon: ArrowLeftRight, color: "bg-blue-100 border-blue-300 text-blue-800" },
  { value: "destination" as const, label: "Destination", description: "Where funds end up (e.g. bank, merchant, settlement)", icon: Target, color: "bg-red-100 border-red-300 text-red-800" },
  { value: "account" as const, label: "Account", description: "A holding account (e.g. safeguarded funds, float, client money)", icon: Wallet, color: "bg-purple-100 border-purple-300 text-purple-800" },
];

const FLOW_TYPE_COLORS = {
  incoming: "#22c55e",
  outgoing: "#ef4444",
  internal: "#3b82f6",
};

const NODE_WIDTH = 160;
const NODE_HEIGHT = 70;

const DEFAULT_PAYMENT_FLOW: FlowDiagramState = {
  nodes: [
    { id: "demo-customer", type: "source", label: "Customer", description: "End user initiating payment", x: 40, y: 60 },
    { id: "demo-gateway", type: "process", label: "Payment Gateway", description: "API-based payment processing", x: 280, y: 60 },
    { id: "demo-aml", type: "process", label: "AML/Sanctions Check", description: "Transaction screening", x: 280, y: 200 },
    { id: "demo-settlement", type: "account", label: "Settlement Account", description: "FCA-safeguarded client funds", x: 520, y: 130 },
    { id: "demo-bank", type: "destination", label: "Partner Bank", description: "Banking partner for settlement", x: 760, y: 60 },
    { id: "demo-merchant", type: "destination", label: "Merchant / Payee", description: "Funds recipient", x: 760, y: 200 },
  ],
  connections: [
    { id: "demo-c1", sourceId: "demo-customer", targetId: "demo-gateway", label: "Card / Account", flowType: "incoming" },
    { id: "demo-c2", sourceId: "demo-customer", targetId: "demo-aml", label: "KYC data", flowType: "incoming" },
    { id: "demo-c3", sourceId: "demo-gateway", targetId: "demo-settlement", label: "Cleared funds", flowType: "internal" },
    { id: "demo-c4", sourceId: "demo-aml", targetId: "demo-settlement", label: "Approved txn", flowType: "internal" },
    { id: "demo-c5", sourceId: "demo-settlement", targetId: "demo-bank", label: "GBP settlement", flowType: "outgoing" },
    { id: "demo-c6", sourceId: "demo-settlement", targetId: "demo-merchant", label: "Payout", flowType: "outgoing" },
  ],
};

const FLOW_TEMPLATES: { id: string; title: string; description: string; diagram: FlowDiagramState }[] = [
  {
    id: "payment-institution",
    title: "Payment Institution",
    description: "Customer → Payment Gateway → AML Check → Settlement → Partner Bank / Merchant",
    diagram: DEFAULT_PAYMENT_FLOW,
  },
  {
    id: "e-money-institution",
    title: "E-Money Institution",
    description: "Customer → E-Wallet Top-up → Float Account → Redemption → Bank / Merchant",
    diagram: {
      nodes: [
        { id: "emi-customer", type: "source", label: "Customer", description: "End user topping up e-wallet", x: 40, y: 130 },
        { id: "emi-topup", type: "process", label: "E-Wallet Top-up", description: "Funds loaded into e-money", x: 280, y: 60 },
        { id: "emi-float", type: "account", label: "E-Money Float Account", description: "Safeguarded float account", x: 280, y: 200 },
        { id: "emi-redemption", type: "process", label: "Redemption", description: "Convert e-money back to fiat", x: 520, y: 130 },
        { id: "emi-bank", type: "destination", label: "Customer Bank", description: "Customer's bank account", x: 760, y: 60 },
        { id: "emi-merchant", type: "destination", label: "Merchant", description: "Payee receiving e-money", x: 760, y: 200 },
      ],
      connections: [
        { id: "emi-c1", sourceId: "emi-customer", targetId: "emi-topup", label: "Card / Bank transfer", flowType: "incoming" },
        { id: "emi-c2", sourceId: "emi-topup", targetId: "emi-float", label: "Credited funds", flowType: "internal" },
        { id: "emi-c3", sourceId: "emi-float", targetId: "emi-redemption", label: "Withdrawal request", flowType: "internal" },
        { id: "emi-c4", sourceId: "emi-float", targetId: "emi-merchant", label: "Payment", flowType: "outgoing" },
        { id: "emi-c5", sourceId: "emi-redemption", targetId: "emi-bank", label: "GBP payout", flowType: "outgoing" },
      ],
    },
  },
  {
    id: "investment-firm",
    title: "Investment Firm",
    description: "Client → Client Money Account → Custodian → Trading Platform → Settlement / Client",
    diagram: {
      nodes: [
        { id: "inv-client", type: "source", label: "Client", description: "Investor depositing funds", x: 40, y: 130 },
        { id: "inv-cma", type: "account", label: "Client Money Account", description: "CASS-segregated client funds", x: 280, y: 60 },
        { id: "inv-custodian", type: "process", label: "Custodian", description: "Asset safekeeping", x: 280, y: 200 },
        { id: "inv-trading", type: "process", label: "Trading Platform", description: "Order execution venue", x: 520, y: 130 },
        { id: "inv-settlement", type: "destination", label: "Settlement", description: "Trade settlement (T+1/T+2)", x: 760, y: 60 },
        { id: "inv-return", type: "destination", label: "Client (Return)", description: "Proceeds returned to client", x: 760, y: 200 },
      ],
      connections: [
        { id: "inv-c1", sourceId: "inv-client", targetId: "inv-cma", label: "Deposit", flowType: "incoming" },
        { id: "inv-c2", sourceId: "inv-cma", targetId: "inv-custodian", label: "Allocated funds", flowType: "internal" },
        { id: "inv-c3", sourceId: "inv-custodian", targetId: "inv-trading", label: "Trade order", flowType: "internal" },
        { id: "inv-c4", sourceId: "inv-trading", targetId: "inv-settlement", label: "Executed trade", flowType: "outgoing" },
        { id: "inv-c5", sourceId: "inv-trading", targetId: "inv-return", label: "Sale proceeds", flowType: "outgoing" },
      ],
    },
  },
  {
    id: "crypto-digital-assets",
    title: "Crypto / Digital Assets",
    description: "User → On-ramp (Fiat→Crypto) → Hot Wallet → Cold Storage / Exchange / Off-ramp",
    diagram: {
      nodes: [
        { id: "cry-user", type: "source", label: "User", description: "Customer buying/selling crypto", x: 40, y: 130 },
        { id: "cry-onramp", type: "process", label: "On-ramp (Fiat→Crypto)", description: "Fiat-to-crypto conversion", x: 280, y: 130 },
        { id: "cry-hot", type: "account", label: "Hot Wallet", description: "Internet-connected wallet", x: 520, y: 60 },
        { id: "cry-cold", type: "destination", label: "Cold Storage", description: "Offline secure vault", x: 760, y: 40 },
        { id: "cry-exchange", type: "process", label: "Exchange", description: "Trading venue", x: 760, y: 130 },
        { id: "cry-offramp", type: "destination", label: "Off-ramp → User Bank", description: "Crypto-to-fiat withdrawal", x: 760, y: 260 },
      ],
      connections: [
        { id: "cry-c1", sourceId: "cry-user", targetId: "cry-onramp", label: "GBP deposit", flowType: "incoming" },
        { id: "cry-c2", sourceId: "cry-onramp", targetId: "cry-hot", label: "Purchased crypto", flowType: "internal" },
        { id: "cry-c3", sourceId: "cry-hot", targetId: "cry-cold", label: "Long-term storage", flowType: "internal" },
        { id: "cry-c4", sourceId: "cry-hot", targetId: "cry-exchange", label: "Trade", flowType: "internal" },
        { id: "cry-c5", sourceId: "cry-exchange", targetId: "cry-offramp", label: "Sell proceeds", flowType: "outgoing" },
      ],
    },
  },
  {
    id: "lending-credit",
    title: "Lending / Credit",
    description: "Borrower Application → Credit Check → Loan Disbursement → Borrower Bank / Collections",
    diagram: {
      nodes: [
        { id: "lend-borrower", type: "source", label: "Borrower Application", description: "Loan application submitted", x: 40, y: 60 },
        { id: "lend-credit", type: "process", label: "Credit Check", description: "Affordability & credit scoring", x: 280, y: 60 },
        { id: "lend-disbursement", type: "account", label: "Loan Disbursement Account", description: "Approved loan funds", x: 520, y: 60 },
        { id: "lend-bank", type: "destination", label: "Borrower Bank", description: "Funds sent to borrower", x: 760, y: 60 },
        { id: "lend-repayments", type: "source", label: "Borrower Repayments", description: "Direct debit repayments", x: 40, y: 200 },
        { id: "lend-collections", type: "destination", label: "Collections Account", description: "Repayment & arrears", x: 760, y: 200 },
      ],
      connections: [
        { id: "lend-c1", sourceId: "lend-borrower", targetId: "lend-credit", label: "Application data", flowType: "incoming" },
        { id: "lend-c2", sourceId: "lend-credit", targetId: "lend-disbursement", label: "Approved amount", flowType: "internal" },
        { id: "lend-c3", sourceId: "lend-disbursement", targetId: "lend-bank", label: "Loan payout", flowType: "outgoing" },
        { id: "lend-c4", sourceId: "lend-repayments", targetId: "lend-collections", label: "Monthly repayments", flowType: "incoming" },
      ],
    },
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function FlowOfFundsBuilder({ packId }: FlowOfFundsBuilderProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddNode, setShowAddNode] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<FlowDiagramState | null>(null);
  const [dragState, setDragState] = useState<{ nodeId: string; startX: number; startY: number; nodeStartX: number; nodeStartY: number } | null>(null);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editNodeForm, setEditNodeForm] = useState({ label: "", description: "" });
  const svgRef = useRef<SVGSVGElement>(null);

  // Connect mode state
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [connectTargetId, setConnectTargetId] = useState<string | null>(null);
  const [connectForm, setConnectForm] = useState({
    flowType: "internal" as FlowConnection["flowType"],
    label: "",
  });

  // New node form
  const [newNode, setNewNode] = useState({
    type: "source" as FlowNode["type"],
    label: "",
    description: "",
  });

  // New connection form
  const [newConnection, setNewConnection] = useState({
    sourceId: "",
    targetId: "",
    label: "",
    flowType: "internal" as FlowConnection["flowType"],
  });

  // Load diagram
  useEffect(() => {
    const loadDiagram = async () => {
      try {
        const response = await fetch(`/api/authorization-pack/packs/${packId}/flow-diagram`);
        if (response.ok) {
          const data = await response.json();
          if (data.diagram && data.diagram.nodes?.length > 0) {
            setNodes(data.diagram.nodes);
            setConnections(data.diagram.connections || []);
          }
          // No saved diagram — templates shown inline, no dialog needed
        }
      } catch {
        // Diagram may not exist yet — templates shown inline
      } finally {
        setIsLoading(false);
      }
    };
    loadDiagram();
  }, [packId]);

  // Reset to demo
  const handleResetToDemo = () => {
    setNodes(DEFAULT_PAYMENT_FLOW.nodes);
    setConnections(DEFAULT_PAYMENT_FLOW.connections);
    setSelectedNodeId(null);
  };

  // Clear canvas (with confirmation)
  const handleClear = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setShowClearConfirm(false);
  };

  // Load template from wizard (with confirmation when canvas is non-empty)
  const handleSelectTemplate = (diagram: FlowDiagramState) => {
    if (nodes.length > 0) {
      setPendingTemplate(diagram);
      return;
    }
    applyTemplate(diagram);
  };

  const applyTemplate = (diagram: FlowDiagramState) => {
    setNodes(diagram.nodes);
    setConnections(diagram.connections);
    setSelectedNodeId(null);
    setPendingTemplate(null);
    setShowWizard(false);
  };

  // Save diagram
  const saveDiagram = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/authorization-pack/packs/${packId}/flow-diagram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, connections }),
      });
      if (!response.ok) throw new Error("Failed to save");
    } catch {
      setError("Failed to save diagram");
    } finally {
      setIsSaving(false);
    }
  }, [packId, nodes, connections]);

  // Add node
  const handleAddNode = () => {
    if (!newNode.label.trim()) return;

    const id = `node-${Date.now()}`;
    // Place new node at a reasonable position
    const maxX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) : 0;
    const newFlowNode: FlowNode = {
      id,
      type: newNode.type,
      label: newNode.label.trim(),
      description: newNode.description.trim() || undefined,
      x: maxX + NODE_WIDTH + 40,
      y: 100,
    };

    setNodes((prev) => [...prev, newFlowNode]);
    setNewNode({ type: "source", label: "", description: "" });
    setShowAddNode(false);
  };

  // Add connection
  const handleAddConnection = () => {
    if (!newConnection.sourceId || !newConnection.targetId) return;
    if (newConnection.sourceId === newConnection.targetId) return;

    const id = `conn-${Date.now()}`;
    const conn: FlowConnection = {
      id,
      sourceId: newConnection.sourceId,
      targetId: newConnection.targetId,
      label: newConnection.label.trim() || undefined,
      flowType: newConnection.flowType,
    };

    setConnections((prev) => [...prev, conn]);
    setNewConnection({ sourceId: "", targetId: "", label: "", flowType: "internal" });
    setShowAddConnection(false);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.sourceId !== nodeId && c.targetId !== nodeId));
    setSelectedNodeId(null);
  };

  // Delete connection
  const handleDeleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
  };

  // Edit node
  const handleOpenEditNode = (node: FlowNode) => {
    setEditingNode(node);
    setEditNodeForm({ label: node.label, description: node.description || "" });
  };

  const handleSaveNodeEdit = () => {
    if (!editingNode || !editNodeForm.label.trim()) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === editingNode.id
          ? { ...n, label: editNodeForm.label.trim(), description: editNodeForm.description.trim() || undefined }
          : n
      )
    );
    setEditingNode(null);
  };

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragState({
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      nodeStartX: node.x,
      nodeStartY: node.y,
    });
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragState.nodeId
            ? { ...n, x: Math.max(0, dragState.nodeStartX + dx), y: Math.max(0, dragState.nodeStartY + dy) }
            : n
        )
      );
    },
    [dragState]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Escape key to exit connect mode
  useEffect(() => {
    if (!connectMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConnectMode(false);
        setConnectSource(null);
        setShowConnectPrompt(false);
        setConnectTargetId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [connectMode]);

  // Handle node click in connect mode
  const handleConnectNodeClick = (nodeId: string) => {
    if (!connectMode) return;
    if (connectSource === null) {
      setConnectSource(nodeId);
    } else if (nodeId === connectSource) {
      // Clicking same node cancels
      setConnectSource(null);
    } else {
      // Second node clicked — show prompt for flow type
      setConnectTargetId(nodeId);
      setConnectForm({ flowType: "internal", label: "" });
      setShowConnectPrompt(true);
    }
  };

  // Create connection from connect mode prompt
  const handleConnectModeCreate = () => {
    if (!connectSource || !connectTargetId) return;
    const id = `conn-${Date.now()}`;
    const conn: FlowConnection = {
      id,
      sourceId: connectSource,
      targetId: connectTargetId,
      label: connectForm.label.trim() || undefined,
      flowType: connectForm.flowType,
    };
    setConnections((prev) => [...prev, conn]);
    setConnectSource(null);
    setConnectTargetId(null);
    setShowConnectPrompt(false);
  };

  // Calculate SVG dimensions
  const svgDimensions = useMemo(() => {
    if (nodes.length === 0) return { width: 800, height: 400 };
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_WIDTH)) + 40;
    const maxY = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT)) + 40;
    return { width: Math.max(800, maxX), height: Math.max(400, maxY) };
  }, [nodes]);

  // Connection path generator
  const getConnectionPath = (conn: FlowConnection) => {
    const source = nodes.find((n) => n.id === conn.sourceId);
    const target = nodes.find((n) => n.id === conn.targetId);
    if (!source || !target) return "";

    const sx = source.x + NODE_WIDTH;
    const sy = source.y + NODE_HEIGHT / 2;
    const tx = target.x;
    const ty = target.y + NODE_HEIGHT / 2;

    const midX = (sx + tx) / 2;
    return `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
  };

  // Node type hex color map for SVG export
  const NODE_TYPE_COLORS: Record<string, { fill: string; stroke: string }> = {
    source: { fill: "#dcfce7", stroke: "#86efac" },
    process: { fill: "#dbeafe", stroke: "#93c5fd" },
    destination: { fill: "#fee2e2", stroke: "#fca5a5" },
    account: { fill: "#f3e8ff", stroke: "#d8b4fe" },
  };

  // Build a clean export-only SVG string with pure SVG primitives
  const buildExportSvg = () => {
    const padding = 60;
    const maxX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x + NODE_WIDTH)) : 0;
    const maxY = nodes.length > 0 ? Math.max(...nodes.map((n) => n.y + NODE_HEIGHT)) : 0;
    const exportW = Math.max(800, maxX) + padding * 2;
    const exportH = Math.max(400, maxY) + padding * 2 + 60; // extra for title + legend

    const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const font = 'font-family="system-ui, sans-serif"';

    // Arrow marker defs
    const markerDefs = (["incoming", "outgoing", "internal"] as const)
      .map(
        (type) =>
          `<marker id="exp-arrow-${type}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="${FLOW_TYPE_COLORS[type]}" />
          </marker>`
      )
      .join("\n");

    // Connection paths
    const connPaths = connections
      .map((conn) => {
        const source = nodes.find((n) => n.id === conn.sourceId);
        const target = nodes.find((n) => n.id === conn.targetId);
        if (!source || !target) return "";
        const sx = source.x + NODE_WIDTH + padding;
        const sy = source.y + NODE_HEIGHT / 2 + padding + 30;
        const tx = target.x + padding;
        const ty = target.y + NODE_HEIGHT / 2 + padding + 30;
        const midX = (sx + tx) / 2;
        const d = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
        const color = FLOW_TYPE_COLORS[conn.flowType];
        const dash = conn.flowType === "internal" ? ' stroke-dasharray="6,3"' : "";

        let labelSvg = "";
        if (conn.label) {
          const lx = (sx + tx) / 2;
          const ly = (sy + ty) / 2 - 8;
          const labelW = conn.label.length * 6 + 12;
          labelSvg = `<rect x="${lx - labelW / 2}" y="${ly - 10}" width="${labelW}" height="16" rx="3" fill="white" stroke="#e2e8f0" stroke-width="0.5" />
            <text x="${lx}" y="${ly + 1}" text-anchor="middle" font-size="9" fill="#475569" ${font}>${escXml(conn.label)}</text>`;
        }
        return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"${dash} marker-end="url(#exp-arrow-${conn.flowType})" />${labelSvg}`;
      })
      .join("\n");

    // Node rects
    const nodeElems = nodes
      .map((node) => {
        const colors = NODE_TYPE_COLORS[node.type] || { fill: "#f1f5f9", stroke: "#94a3b8" };
        const nx = node.x + padding;
        const ny = node.y + padding + 30; // offset for title
        return `<rect x="${nx}" y="${ny}" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="8" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" />
          <text x="${nx + 12}" y="${ny + 16}" font-size="8" fill="${colors.stroke}" font-weight="600" text-transform="uppercase" letter-spacing="0.5" ${font}>${escXml(node.type.toUpperCase())}</text>
          <text x="${nx + 12}" y="${ny + 32}" font-size="11" fill="#1e293b" font-weight="600" ${font}>${escXml(node.label)}</text>
          ${node.description ? `<text x="${nx + 12}" y="${ny + 46}" font-size="8" fill="#94a3b8" ${font}>${escXml(node.description.length > 28 ? node.description.slice(0, 26) + "..." : node.description)}</text>` : ""}`;
      })
      .join("\n");

    // Legend at bottom
    const legendY = exportH - 30;
    const legendItems = [
      { label: "Source", fill: "#dcfce7", stroke: "#86efac" },
      { label: "Process", fill: "#dbeafe", stroke: "#93c5fd" },
      { label: "Destination", fill: "#fee2e2", stroke: "#fca5a5" },
      { label: "Account", fill: "#f3e8ff", stroke: "#d8b4fe" },
    ];
    const legendFlow = [
      { label: "Incoming", color: FLOW_TYPE_COLORS.incoming, dash: "" },
      { label: "Outgoing", color: FLOW_TYPE_COLORS.outgoing, dash: "" },
      { label: "Internal", color: FLOW_TYPE_COLORS.internal, dash: "4,2" },
    ];

    let legendSvg = "";
    let lx = padding;
    for (const item of legendItems) {
      legendSvg += `<rect x="${lx}" y="${legendY}" width="10" height="10" rx="2" fill="${item.fill}" stroke="${item.stroke}" stroke-width="1" />
        <text x="${lx + 14}" y="${legendY + 9}" font-size="9" fill="#64748b" ${font}>${item.label}</text>`;
      lx += item.label.length * 6 + 28;
    }
    lx += 10;
    for (const item of legendFlow) {
      legendSvg += `<line x1="${lx}" y1="${legendY + 5}" x2="${lx + 16}" y2="${legendY + 5}" stroke="${item.color}" stroke-width="2" ${item.dash ? `stroke-dasharray="${item.dash}"` : ""} />
        <text x="${lx + 20}" y="${legendY + 9}" font-size="9" fill="#64748b" ${font}>${item.label}</text>`;
      lx += item.label.length * 6 + 34;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">
      <rect width="${exportW}" height="${exportH}" fill="white" />
      <defs>${markerDefs}</defs>
      <text x="${padding}" y="${padding - 10}" font-size="16" fill="#0f172a" font-weight="700" ${font}>Flow of Funds</text>
      ${connPaths}
      ${nodeElems}
      ${legendSvg}
    </svg>`;
  };

  // Export as PNG
  const handleExport = async () => {
    if (nodes.length === 0) return;
    try {
      const svgString = buildExportSvg();
      const canvas = document.createElement("canvas");
      // Parse dimensions from SVG
      const widthMatch = svgString.match(/width="(\d+)"/);
      const heightMatch = svgString.match(/height="(\d+)"/);
      const w = widthMatch ? parseInt(widthMatch[1]) : 800;
      const h = heightMatch ? parseInt(heightMatch[1]) : 400;

      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);

      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const link = document.createElement("a");
        link.download = "flow-of-funds.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("Failed to export diagram");
      };
      img.src = url;
    } catch {
      setError("Failed to export diagram");
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading diagram...
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <ArrowLeftRight className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">Flow of Funds</CardTitle>
                <CardDescription>
                  {nodes.length} node{nodes.length !== 1 ? "s" : ""} | {connections.length} connection{connections.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {nodes.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowAddNode(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Node
                  </Button>
                  <Button
                    variant={connectMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setConnectMode(!connectMode);
                      setConnectSource(null);
                      setShowConnectPrompt(false);
                      setConnectTargetId(null);
                    }}
                    disabled={nodes.length < 2}
                    className={connectMode ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}
                  >
                    <Link2 className="h-4 w-4 mr-1" /> {connectMode ? "Connecting..." : "Connect"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddConnection(true)}
                    disabled={nodes.length < 2}
                    title="Connect via dialog"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowWizard(true)}>
                    <Wand2 className="h-4 w-4 mr-1" /> Wizard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)}>
                    <Eraser className="h-4 w-4 mr-1" /> Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-1" /> PNG
                  </Button>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={saveDiagram}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Canvas */}
      <Card className="border border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          {nodes.length === 0 ? (
            <div className="py-8 px-6 space-y-6">
              <div className="text-center">
                <ArrowLeftRight className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Build your Flow of Funds</p>
                <p className="text-xs text-slate-400 mt-1">
                  Choose a template below, or start from scratch
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FLOW_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleSelectTemplate(template.diagram)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 shrink-0">
                          <Building2 className="h-4 w-4 text-teal-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800">{template.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-1 text-teal-700 border-teal-200 hover:bg-teal-50"
                        onClick={(e) => { e.stopPropagation(); handleSelectTemplate(template.diagram); }}
                      >
                        Use this template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setShowAddNode(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Start from scratch
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-auto bg-slate-50" style={{ maxHeight: "500px" }}>
              <svg
                ref={svgRef}
                width={svgDimensions.width}
                height={svgDimensions.height}
                className={connectMode ? "cursor-crosshair" : "cursor-default"}
                onClick={() => { if (!connectMode) setSelectedNodeId(null); }}
              >
                {/* Grid pattern */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Connections */}
                {connections.map((conn) => {
                  const path = getConnectionPath(conn);
                  if (!path) return null;
                  const color = FLOW_TYPE_COLORS[conn.flowType];

                  return (
                    <g key={conn.id}>
                      <path
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray={conn.flowType === "internal" ? "6,3" : undefined}
                        markerEnd={`url(#arrow-${conn.flowType})`}
                      />
                      {conn.label && (
                        <text
                          x={
                            ((nodes.find((n) => n.id === conn.sourceId)?.x ?? 0) +
                              NODE_WIDTH +
                              (nodes.find((n) => n.id === conn.targetId)?.x ?? 0)) /
                            2
                          }
                          y={
                            ((nodes.find((n) => n.id === conn.sourceId)?.y ?? 0) +
                              (nodes.find((n) => n.id === conn.targetId)?.y ?? 0)) /
                              2 +
                            NODE_HEIGHT / 2 -
                            8
                          }
                          textAnchor="middle"
                          className="text-[10px] fill-slate-600"
                        >
                          {conn.label}
                        </text>
                      )}
                      {/* Click to delete */}
                      <path
                        d={path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={12}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConnection(conn.id);
                        }}
                      />
                    </g>
                  );
                })}

                {/* Arrow markers */}
                <defs>
                  {(["incoming", "outgoing", "internal"] as const).map((type) => (
                    <marker
                      key={type}
                      id={`arrow-${type}`}
                      viewBox="0 0 10 10"
                      refX="10"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={FLOW_TYPE_COLORS[type]} />
                    </marker>
                  ))}
                </defs>

                {/* Nodes */}
                {nodes.map((node) => {
                  const typeConfig = NODE_TYPES.find((t) => t.value === node.type);
                  const isSelected = selectedNodeId === node.id;
                  const isConnectSource = connectMode && connectSource === node.id;

                  return (
                    <g key={node.id}>
                      <foreignObject
                        x={node.x}
                        y={node.y}
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        className={connectMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!connectMode) handleMouseDown(e, node.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (connectMode) {
                            handleConnectNodeClick(node.id);
                          } else {
                            setSelectedNodeId(node.id);
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (!connectMode) handleOpenEditNode(node);
                        }}
                      >
                        <div
                          className={`h-full rounded-lg border-2 px-3 py-2 shadow-sm transition-all ${
                            typeConfig?.color || "bg-slate-100 border-slate-300"
                          } ${isSelected && !connectMode ? "ring-2 ring-teal-500 ring-offset-1" : ""} ${isConnectSource ? "ring-2 ring-teal-400 ring-offset-1 animate-pulse" : ""}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <GripVertical className="h-3 w-3 opacity-40" />
                            <span className="text-[9px] font-semibold uppercase tracking-wide opacity-60">
                              {node.type}
                            </span>
                          </div>
                          <p className="text-xs font-medium truncate">{node.label}</p>
                          {node.description && (
                            <p className="text-[9px] opacity-60 truncate">{node.description}</p>
                          )}
                        </div>
                      </foreignObject>

                      {/* Edit + Delete buttons for selected node */}
                      {isSelected && (
                        <>
                          <foreignObject
                            x={node.x + NODE_WIDTH - 34}
                            y={node.y - 8}
                            width={20}
                            height={20}
                          >
                            <button
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white shadow hover:bg-teal-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditNode(node);
                              }}
                            >
                              <Pencil className="h-2.5 w-2.5" />
                            </button>
                          </foreignObject>
                          <foreignObject
                            x={node.x + NODE_WIDTH - 12}
                            y={node.y - 8}
                            width={20}
                            height={20}
                          >
                            <button
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </foreignObject>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="font-medium">Legend:</span>
          {NODE_TYPES.map((t) => (
            <div key={t.value} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded border ${t.color}`} />
              <span>{t.label}</span>
            </div>
          ))}
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-green-500" />
            <span>Incoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-red-500" />
            <span>Outgoing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 border-t-2 border-dashed border-blue-500" />
            <span>Internal</span>
          </div>
        </div>
      )}

      {/* Add Node Dialog */}
      <Dialog open={showAddNode} onOpenChange={setShowAddNode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Node</DialogTitle>
            <DialogDescription>Add a source, process, destination, or account node</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newNode.type}
                onValueChange={(v) => setNewNode((prev) => ({ ...prev, type: v as FlowNode["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <span>{t.label}</span>
                        <p className="text-[11px] text-muted-foreground font-normal">{t.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={newNode.label}
                onChange={(e) => setNewNode((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Customer Bank Account"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={newNode.description}
                onChange={(e) => setNewNode((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNode(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddNode} disabled={!newNode.label.trim()}>
              Add Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Connection Dialog */}
      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Nodes</DialogTitle>
            <DialogDescription>Draw a flow connection between two nodes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={newConnection.sourceId}
                onValueChange={(v) => setNewConnection((prev) => ({ ...prev, sourceId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label} ({n.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select
                value={newConnection.targetId}
                onValueChange={(v) => setNewConnection((prev) => ({ ...prev, targetId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((n) => n.id !== newConnection.sourceId)
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Flow Type</Label>
              <Select
                value={newConnection.flowType}
                onValueChange={(v) =>
                  setNewConnection((prev) => ({ ...prev, flowType: v as FlowConnection["flowType"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming (funds in)</SelectItem>
                  <SelectItem value="outgoing">Outgoing (funds out)</SelectItem>
                  <SelectItem value="internal">Internal (between accounts)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={newConnection.label}
                onChange={(e) => setNewConnection((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. GBP payments"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConnection(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleAddConnection}
              disabled={!newConnection.sourceId || !newConnection.targetId}
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Flow Template</DialogTitle>
            <DialogDescription>
              Pick a starting template that matches your firm type. You can customise it afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {FLOW_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                      <Building2 className="h-4 w-4 text-teal-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{template.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-1 text-teal-700 border-teal-200 hover:bg-teal-50"
                    onClick={() => handleSelectTemplate(template.diagram)}
                  >
                    Use this template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => setShowWizard(false)}
            >
              Start from scratch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear Canvas?</DialogTitle>
            <DialogDescription>
              This will remove all nodes and connections. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClear}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Replace Confirmation Dialog */}
      <Dialog open={!!pendingTemplate} onOpenChange={(open) => { if (!open) setPendingTemplate(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Replace Current Diagram?</DialogTitle>
            <DialogDescription>
              Loading a template will replace your current nodes and connections. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingTemplate(null)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => { if (pendingTemplate) applyTemplate(pendingTemplate); }}
            >
              Replace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={!!editingNode} onOpenChange={(open) => { if (!open) { setEditingNode(null); setEditNodeForm({ label: "", description: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogDescription>Update the label and description for this node</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={editNodeForm.label}
                onChange={(e) => setEditNodeForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Customer Bank Account"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={editNodeForm.description}
                onChange={(e) => setEditNodeForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNode(null)}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveNodeEdit} disabled={!editNodeForm.label.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Mode Flow Type Prompt */}
      <Dialog open={showConnectPrompt} onOpenChange={(open) => {
        if (!open) {
          setShowConnectPrompt(false);
          setConnectTargetId(null);
          setConnectSource(null);
        }
      }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Connection Type</DialogTitle>
            <DialogDescription>
              {connectSource && connectTargetId && (
                <>
                  {nodes.find((n) => n.id === connectSource)?.label} &rarr;{" "}
                  {nodes.find((n) => n.id === connectTargetId)?.label}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Flow Type</Label>
              <Select
                value={connectForm.flowType}
                onValueChange={(v) => setConnectForm((prev) => ({ ...prev, flowType: v as FlowConnection["flowType"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming (funds in)</SelectItem>
                  <SelectItem value="outgoing">Outgoing (funds out)</SelectItem>
                  <SelectItem value="internal">Internal (between accounts)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={connectForm.label}
                onChange={(e) => setConnectForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. GBP payments"
                onKeyDown={(e) => { if (e.key === "Enter") handleConnectModeCreate(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConnectPrompt(false);
              setConnectTargetId(null);
              setConnectSource(null);
            }}>
              Cancel
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleConnectModeCreate}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
