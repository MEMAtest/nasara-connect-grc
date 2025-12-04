import { pool } from "@/lib/database";
import { mockCmpControls } from "@/data/cmp/mock-data";
import type {
  CmpControlDetail,
  CmpFinding,
  CmpSummary,
  CmpTestExecution,
  NewFindingPayload,
  NewTestExecutionPayload,
} from "@/data/cmp/types";

const cmpStoreMemory = new Map<string, CmpControlDetail[]>();
let cmpTablesReady = false;
let fallbackToMemory = false;

function shouldUseMemoryStore(): boolean {
  return fallbackToMemory || process.env.USE_IN_MEMORY_CMP === "1";
}

function cloneControl(control: CmpControlDetail): CmpControlDetail {
  return JSON.parse(JSON.stringify(control));
}

function ensureOrgControlsMemory(organizationId: string): CmpControlDetail[] {
  if (!cmpStoreMemory.has(organizationId)) {
    cmpStoreMemory.set(
      organizationId,
      mockCmpControls.map((control) => ({
        ...cloneControl(control),
        id: control.id,
      })),
    );
  }
  return cmpStoreMemory.get(organizationId) ?? [];
}

function persistControlsMemory(organizationId: string, controls: CmpControlDetail[]): void {
  cmpStoreMemory.set(
    organizationId,
    controls.map((control) => cloneControl(control)),
  );
}

async function ensureCmpTables() {
  if (cmpTablesReady || shouldUseMemoryStore()) {
    return;
  }
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cmp_controls (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cmp_controls_org ON cmp_controls (organization_id)
    `);
    cmpTablesReady = true;
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to initialize CMP tables, using in-memory store", error);
    }
  } finally {
    client.release();
  }
}

async function seedControlsIfEmpty(organizationId: string) {
  if (shouldUseMemoryStore()) return;
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT COUNT(*)::int AS count FROM cmp_controls WHERE organization_id=$1", [organizationId]);
    if ((result.rows[0]?.count ?? 0) === 0) {
      for (const control of mockCmpControls) {
        await client.query(
          `INSERT INTO cmp_controls (id, organization_id, data) VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id`,
          [control.id, organizationId, JSON.stringify(control)],
        );
      }
    }
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to seed CMP controls, using in-memory store", error);
    }
  } finally {
    client.release();
  }
}

async function getControlsFromDb(organizationId: string): Promise<CmpControlDetail[]> {
  await ensureCmpTables();
  if (shouldUseMemoryStore()) {
    return ensureOrgControlsMemory(organizationId).map((control) => cloneControl(control));
  }
  await seedControlsIfEmpty(organizationId);
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT data FROM cmp_controls WHERE organization_id=$1 ORDER BY id", [organizationId]);
    return rows.map((row) => row.data as CmpControlDetail);
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch CMP controls, using in-memory store", error);
    }
    return ensureOrgControlsMemory(organizationId).map((control) => cloneControl(control));
  } finally {
    client.release();
  }
}

export async function getCmpControls(organizationId: string): Promise<CmpControlDetail[]> {
  if (shouldUseMemoryStore()) {
    return ensureOrgControlsMemory(organizationId).map((control) => cloneControl(control));
  }
  return getControlsFromDb(organizationId);
}

export async function getCmpControl(organizationId: string, controlId: string): Promise<CmpControlDetail | null> {
  if (shouldUseMemoryStore()) {
    const controls = ensureOrgControlsMemory(organizationId);
    const control = controls.find((item) => item.id === controlId);
    return control ? cloneControl(control) : null;
  }
  const client = await pool.connect();
  try {
    await ensureCmpTables();
    const { rows } = await client.query(
      "SELECT data FROM cmp_controls WHERE organization_id=$1 AND id=$2",
      [organizationId, controlId],
    );
    if (!rows.length) {
      await seedControlsIfEmpty(organizationId);
      return null;
    }
    return rows[0].data as CmpControlDetail;
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to fetch CMP control, using in-memory store", error);
    }
    const controls = ensureOrgControlsMemory(organizationId);
    const control = controls.find((item) => item.id === controlId);
    return control ? cloneControl(control) : null;
  } finally {
    client.release();
  }
}

async function persistControlDb(organizationId: string, control: CmpControlDetail) {
  if (shouldUseMemoryStore()) return;
  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE cmp_controls SET data=$3, updated_at=NOW() WHERE organization_id=$1 AND id=$2",
      [organizationId, control.id, JSON.stringify(control)],
    );
  } catch (error) {
    fallbackToMemory = true;
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to persist CMP control, using in-memory store", error);
    }
  } finally {
    client.release();
  }
}

export async function recordCmpTest(
  organizationId: string,
  controlId: string,
  payload: NewTestExecutionPayload,
): Promise<CmpTestExecution | null> {
  if (shouldUseMemoryStore()) {
    const controls = ensureOrgControlsMemory(organizationId);
    const index = controls.findIndex((control) => control.id === controlId);
    if (index === -1) return null;
    const control = cloneControl(controls[index]);
    const exec: CmpTestExecution = {
      id: `${controlId}-EXEC-${control.executions.length + 1}`,
      ...payload,
    };
    control.executions = [exec, ...control.executions];
    control.testsExecuted = (control.testsExecuted ?? 0) + 1;
    control.lastTestedAt = payload.testedAt;
    const score = control.executions.reduce((sum, execution) => {
      if (execution.result === "pass") return sum + 1;
      if (execution.result === "partial") return sum + 0.5;
      return sum;
    }, 0);
    control.passRate = control.executions.length ? score / control.executions.length : control.passRate;
    control.ragStatus = control.passRate >= 0.9 ? "green" : control.passRate >= 0.75 ? "amber" : "red";
    controls[index] = control;
    persistControlsMemory(organizationId, controls);
    return exec;
  }

  const control = await getCmpControl(organizationId, controlId);
  if (!control) return null;
  const exec: CmpTestExecution = {
    id: `${controlId}-EXEC-${control.executions.length + 1}`,
    ...payload,
  };
  control.executions = [exec, ...control.executions];
  control.testsExecuted = (control.testsExecuted ?? 0) + 1;
  control.lastTestedAt = payload.testedAt;
  const score = control.executions.reduce((sum, execution) => {
    if (execution.result === "pass") return sum + 1;
    if (execution.result === "partial") return sum + 0.5;
    return sum;
  }, 0);
  control.passRate = control.executions.length ? score / control.executions.length : control.passRate;
  control.ragStatus = control.passRate >= 0.9 ? "green" : control.passRate >= 0.75 ? "amber" : "red";
  await persistControlDb(organizationId, control);
  return exec;
}

export async function recordCmpFinding(
  organizationId: string,
  controlId: string,
  payload: NewFindingPayload,
): Promise<CmpFinding | null> {
  if (shouldUseMemoryStore()) {
    const controls = ensureOrgControlsMemory(organizationId);
    const index = controls.findIndex((control) => control.id === controlId);
    if (index === -1) return null;
    const control = cloneControl(controls[index]);
    const finding: CmpFinding = {
      id: `${controlId}-F${control.findings.length + 1}`,
      createdAt: new Date().toISOString(),
      status: "open",
      ...payload,
    };
    control.findings = [finding, ...control.findings];
    control.issuesOpen = control.findings.filter((item) => item.status !== "resolved").length;
    controls[index] = control;
    persistControlsMemory(organizationId, controls);
    return finding;
  }

  const control = await getCmpControl(organizationId, controlId);
  if (!control) return null;
  const finding: CmpFinding = {
    id: `${controlId}-F${control.findings.length + 1}`,
    createdAt: new Date().toISOString(),
    status: "open",
    ...payload,
  };
  control.findings = [finding, ...control.findings];
  control.issuesOpen = control.findings.filter((item) => item.status !== "resolved").length;
  await persistControlDb(organizationId, control);
  return finding;
}

export async function getCmpSummary(organizationId: string): Promise<CmpSummary> {
  const controls = await getCmpControls(organizationId);
  const now = Date.now();
  const fourteenDays = 1000 * 60 * 60 * 24 * 14;
  const dueSoon = controls.filter((control) => {
    const next = new Date(control.nextTestDue).getTime();
    return !Number.isNaN(next) && next - now <= fourteenDays && next >= now;
  }).length;
  const overdue = controls.filter((control) => new Date(control.nextTestDue).getTime() < now).length;
  const openFindings = controls.reduce((sum, control) => sum + (control.issuesOpen ?? 0), 0);
  const avgPassRate = controls.length
    ? controls.reduce((sum, control) => sum + (control.passRate ?? 0), 0) / controls.length
    : 0;
  return {
    totalControls: controls.length,
    dueSoon,
    overdue,
    openFindings,
    avgPassRate,
  };
}
