import pptxgen from "pptxgenjs";

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

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

const FCA_BLUE = "0055B8";
const TEAL = "0D9488";
const WHITE = "FFFFFF";
const SLATE_700 = "334155";
const SLATE_400 = "94A3B8";

const BOX_W = 2.2;
const BOX_H = 0.8;
const H_GAP = 0.4;
const V_GAP = 0.6;

interface LayoutNode<T> {
  data: T;
  children: LayoutNode<T>[];
  x: number;
  y: number;
  subtreeWidth: number;
}

function buildTree<T>(
  items: T[],
  getId: (item: T) => string,
  getParentId: (item: T) => string | undefined
): LayoutNode<T>[] {
  const childrenMap: Record<string, T[]> = {};
  const roots: T[] = [];

  items.forEach((item) => {
    const parentId = getParentId(item);
    if (parentId) {
      if (!childrenMap[parentId]) childrenMap[parentId] = [];
      childrenMap[parentId].push(item);
    } else {
      roots.push(item);
    }
  });

  function buildNode(item: T, depth: number): LayoutNode<T> {
    const id = getId(item);
    const children = (childrenMap[id] || []).map((c) => buildNode(c, depth + 1));
    const subtreeWidth =
      children.length > 0
        ? children.reduce((sum, c) => sum + c.subtreeWidth, 0) + (children.length - 1) * H_GAP
        : BOX_W;

    return { data: item, children, x: 0, y: depth * (BOX_H + V_GAP), subtreeWidth };
  }

  function layoutNode(node: LayoutNode<T>, leftX: number) {
    if (node.children.length === 0) {
      node.x = leftX + (node.subtreeWidth - BOX_W) / 2;
      return;
    }
    let cx = leftX;
    node.children.forEach((child) => {
      layoutNode(child, cx);
      cx += child.subtreeWidth + H_GAP;
    });
    const first = node.children[0];
    const last = node.children[node.children.length - 1];
    node.x = (first.x + last.x + BOX_W) / 2 - BOX_W / 2;
  }

  const trees = roots.map((r) => buildNode(r, 0));
  let offsetX = 0.5;
  trees.forEach((tree) => {
    layoutNode(tree, offsetX);
    offsetX += tree.subtreeWidth + H_GAP * 2;
  });

  return trees;
}

function flattenTree<T>(trees: LayoutNode<T>[]): {
  nodes: LayoutNode<T>[];
  connectors: { from: LayoutNode<T>; to: LayoutNode<T> }[];
} {
  const allNodes: LayoutNode<T>[] = [];
  const connectors: { from: LayoutNode<T>; to: LayoutNode<T> }[] = [];

  function walk(node: LayoutNode<T>) {
    allNodes.push(node);
    node.children.forEach((c) => {
      connectors.push({ from: node, to: c });
      walk(c);
    });
  }
  trees.forEach(walk);

  return { nodes: allNodes, connectors };
}

// ============================================================================
// DEPARTMENT GROUPING
// ============================================================================

function groupByDepartment(persons: OrgPerson[]): Map<string, OrgPerson[]> {
  const map = new Map<string, OrgPerson[]>();
  persons.forEach((p) => {
    const dept = p.department || "Other";
    if (!map.has(dept)) map.set(dept, []);
    const arr = map.get(dept);
    if (arr) arr.push(p);
  });
  return map;
}

// ============================================================================
// EXPORT FUNCTION
// ============================================================================

export async function exportOrgChartPptx(
  persons: OrgPerson[],
  entities: CorporateEntity[]
) {
  const pptx = new pptxgen();
  pptx.author = "Nasara Connect";
  pptx.subject = "Organisation & Corporate Structure";
  pptx.title = "Organisation Structure";

  // ---- SLIDE 1: Org Chart ----
  const slide1 = pptx.addSlide();
  slide1.addText("Organisation Chart", {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: FCA_BLUE,
  });

  // Group by department
  const deptMap = groupByDepartment(persons);
  const deptNames = Array.from(deptMap.keys());

  // Build org tree
  const orgTrees = buildTree(
    persons,
    (p) => p.id,
    (p) => p.reportsTo
  );
  const { nodes: orgNodes, connectors: orgConnectors } = flattenTree(orgTrees);

  // Draw connectors
  orgConnectors.forEach(({ from, to }) => {
    const fromCenterX = from.x + BOX_W / 2;
    const fromBottomY = from.y + BOX_H + 0.2;
    const toCenterX = to.x + BOX_W / 2;
    const toTopY = to.y + 0.2;

    // Vertical line from parent bottom
    slide1.addShape(pptx.ShapeType.line, {
      x: fromCenterX,
      y: fromBottomY,
      w: 0,
      h: (toTopY - fromBottomY) / 2,
      line: { color: SLATE_400, width: 1 },
    });

    // Horizontal line
    const midY = (fromBottomY + toTopY) / 2;
    const lineX = Math.min(fromCenterX, toCenterX);
    const lineW = Math.abs(toCenterX - fromCenterX);
    if (lineW > 0.01) {
      slide1.addShape(pptx.ShapeType.line, {
        x: lineX,
        y: midY,
        w: lineW,
        h: 0,
        line: { color: SLATE_400, width: 1 },
      });
    }

    // Vertical line to child top
    slide1.addShape(pptx.ShapeType.line, {
      x: toCenterX,
      y: midY,
      w: 0,
      h: toTopY - midY,
      line: { color: SLATE_400, width: 1 },
    });
  });

  // Department color palette
  const DEPT_COLORS: Record<string, string> = {};
  const palette = ["E0F2FE", "F0FDF4", "FEF3C7", "FCE7F3", "EDE9FE", "ECFDF5", "FFF7ED"];
  const borderPalette = ["0EA5E9", "22C55E", "F59E0B", "EC4899", "8B5CF6", "14B8A6", "F97316"];
  deptNames.forEach((d, i) => {
    DEPT_COLORS[d] = palette[i % palette.length];
  });

  // Draw nodes
  orgNodes.forEach((node) => {
    const p = node.data;
    const dept = p.department || "Other";
    const deptIdx = deptNames.indexOf(dept);
    const bgColor = palette[deptIdx % palette.length];
    const bdColor = borderPalette[deptIdx % borderPalette.length];

    slide1.addShape(pptx.ShapeType.roundRect, {
      x: node.x,
      y: node.y + 0.2,
      w: BOX_W,
      h: BOX_H,
      fill: { color: bgColor },
      line: { color: bdColor, width: 1.5 },
      rectRadius: 0.08,
    });

    slide1.addText(
      [
        { text: p.name, options: { fontSize: 9, bold: true, color: SLATE_700 } },
        { text: `\n${p.role}`, options: { fontSize: 7, color: SLATE_400 } },
        ...(p.smcrRole
          ? [{ text: `\n${p.smcrRole}`, options: { fontSize: 7, bold: true, color: TEAL } }]
          : []),
      ],
      {
        x: node.x + 0.08,
        y: node.y + 0.24,
        w: BOX_W - 0.16,
        h: BOX_H - 0.08,
        valign: "middle",
      }
    );
  });

  // Department legend
  const legendY = Math.max(...orgNodes.map((n) => n.y + BOX_H)) + 0.6;
  slide1.addText("Departments:", {
    x: 0.5,
    y: legendY,
    w: 1.2,
    h: 0.3,
    fontSize: 8,
    bold: true,
    color: SLATE_700,
  });

  deptNames.forEach((dept, i) => {
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: 1.8 + i * 1.4,
      y: legendY,
      w: 1.2,
      h: 0.3,
      fill: { color: palette[i % palette.length] },
      line: { color: borderPalette[i % borderPalette.length], width: 1 },
      rectRadius: 0.05,
    });
    slide1.addText(dept, {
      x: 1.8 + i * 1.4,
      y: legendY,
      w: 1.2,
      h: 0.3,
      fontSize: 7,
      align: "center",
      valign: "middle",
      color: SLATE_700,
    });
  });

  // ---- SLIDE 2: Corporate Structure ----
  if (entities.length > 0) {
    const slide2 = pptx.addSlide();
    slide2.addText("Corporate Structure", {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: FCA_BLUE,
    });

    const ENTITY_BG: Record<string, string> = {
      holding: "F3E8FF",
      subsidiary: "DBEAFE",
      parent: "FEF3C7",
      associate: "DCFCE7",
      branch: "F1F5F9",
    };
    const ENTITY_BD: Record<string, string> = {
      holding: "A855F7",
      subsidiary: "3B82F6",
      parent: "F59E0B",
      associate: "22C55E",
      branch: "94A3B8",
    };

    const corpTrees = buildTree(
      entities,
      (e) => e.id,
      (e) => e.parentEntityId
    );
    const { nodes: corpNodes, connectors: corpConnectors } = flattenTree(corpTrees);

    // Draw connectors with ownership %
    corpConnectors.forEach(({ from, to }) => {
      const fromCX = from.x + BOX_W / 2;
      const fromBY = from.y + BOX_H + 0.4;
      const toCX = to.x + BOX_W / 2;
      const toTY = to.y + 0.4;

      // Vertical from parent
      slide2.addShape(pptx.ShapeType.line, {
        x: fromCX,
        y: fromBY,
        w: 0,
        h: (toTY - fromBY) / 2,
        line: { color: SLATE_400, width: 1.5 },
      });

      const midY = (fromBY + toTY) / 2;
      const lineX = Math.min(fromCX, toCX);
      const lineW = Math.abs(toCX - fromCX);
      if (lineW > 0.01) {
        slide2.addShape(pptx.ShapeType.line, {
          x: lineX,
          y: midY,
          w: lineW,
          h: 0,
          line: { color: SLATE_400, width: 1.5 },
        });
      }

      // Vertical to child
      slide2.addShape(pptx.ShapeType.line, {
        x: toCX,
        y: midY,
        w: 0,
        h: toTY - midY,
        line: { color: SLATE_400, width: 1.5 },
      });

      // Ownership % label on connector
      if (to.data.ownershipPct !== undefined) {
        const labelX = (fromCX + toCX) / 2 - 0.35;
        slide2.addShape(pptx.ShapeType.roundRect, {
          x: labelX,
          y: midY - 0.12,
          w: 0.7,
          h: 0.24,
          fill: { color: WHITE },
          line: { color: "A855F7", width: 1 },
          rectRadius: 0.04,
        });
        slide2.addText(`${to.data.ownershipPct}%`, {
          x: labelX,
          y: midY - 0.12,
          w: 0.7,
          h: 0.24,
          fontSize: 8,
          bold: true,
          color: "7C3AED",
          align: "center",
          valign: "middle",
        });
      }
    });

    // Draw entity nodes
    corpNodes.forEach((node) => {
      const e = node.data;
      const bg = ENTITY_BG[e.type] || ENTITY_BG.branch;
      const bd = ENTITY_BD[e.type] || ENTITY_BD.branch;
      const isExt = e.isExternal;

      slide2.addShape(pptx.ShapeType.roundRect, {
        x: node.x,
        y: node.y + 0.4,
        w: BOX_W,
        h: BOX_H,
        fill: { color: bg },
        line: { color: bd, width: isExt ? 1 : 1.5, dashType: isExt ? "dash" : "solid" },
        rectRadius: 0.08,
      });

      slide2.addText(
        [
          { text: e.name, options: { fontSize: 9, bold: true, color: SLATE_700 } },
          {
            text: `\n${e.type} | ${e.jurisdiction}`,
            options: { fontSize: 7, color: SLATE_400 },
          },
          ...(e.ownershipPct !== undefined
            ? [{ text: `\n${e.ownershipPct}% owned`, options: { fontSize: 7, bold: true, color: "7C3AED" } }]
            : []),
        ],
        {
          x: node.x + 0.08,
          y: node.y + 0.44,
          w: BOX_W - 0.16,
          h: BOX_H - 0.08,
          valign: "middle",
        }
      );
    });
  }

  // Generate & download
  const fileName = "org-corporate-structure.pptx";
  await pptx.writeFile({ fileName });
}
