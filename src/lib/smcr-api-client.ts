export type SmcrApiError = {
  status: number;
  message: string;
  details?: string;
};

async function smcrRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let details: string | undefined;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
      if (data?.details) details = data.details;
    } catch {
      // ignore
    }
    const error: SmcrApiError = { status: response.status, message, details };
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response as unknown as T;
}

export const smcrApi = {
  getFirms() {
    return smcrRequest('/api/smcr/firms');
  },
  createFirm(name: string) {
    return smcrRequest('/api/smcr/firms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  },
  getFirm(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}`);
  },
  updateFirm(firmId: string, updates: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },
  getPeople(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}/people`);
  },
  createPerson(firmId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}/people`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updatePerson(personId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/people/${personId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deletePerson(personId: string) {
    return smcrRequest(`/api/smcr/people/${personId}`, { method: 'DELETE' });
  },
  getRoles(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}/roles`);
  },
  createRole(firmId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateRole(roleId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deleteRole(roleId: string) {
    return smcrRequest(`/api/smcr/roles/${roleId}`, { method: 'DELETE' });
  },
  getWorkflows(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}/workflows`);
  },
  createWorkflow(firmId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateWorkflow(workflowId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deleteWorkflow(workflowId: string) {
    return smcrRequest(`/api/smcr/workflows/${workflowId}`, { method: 'DELETE' });
  },
  getWorkflowDocuments(workflowId: string) {
    return smcrRequest(`/api/smcr/workflows/${workflowId}/documents`);
  },
  async uploadWorkflowDocument(workflowId: string, payload: { file: File; stepId: string; summary?: string; status?: string }) {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('stepId', payload.stepId);
    if (payload.summary) formData.append('summary', payload.summary);
    if (payload.status) formData.append('status', payload.status);
    return smcrRequest(`/api/smcr/workflows/${workflowId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },
  getAssessments(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}/assessments`);
  },
  createAssessment(firmId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateAssessment(assessmentId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/assessments/${assessmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deleteAssessment(assessmentId: string) {
    return smcrRequest(`/api/smcr/assessments/${assessmentId}`, { method: 'DELETE' });
  },
  getBreaches(firmId: string) {
    return smcrRequest(`/api/smcr/firms/${firmId}/breaches`);
  },
  createBreach(firmId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/firms/${firmId}/breaches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateBreach(breachId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/breaches/${breachId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deleteBreach(breachId: string) {
    return smcrRequest(`/api/smcr/breaches/${breachId}`, { method: 'DELETE' });
  },
  addBreachTimelineEntry(breachId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/breaches/${breachId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  getGroupEntities() {
    return smcrRequest('/api/smcr/group-entities');
  },
  createGroupEntity(payload: Record<string, unknown>) {
    return smcrRequest('/api/smcr/group-entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateGroupEntity(entityId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/group-entities/${entityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  deleteGroupEntity(entityId: string) {
    return smcrRequest(`/api/smcr/group-entities/${entityId}`, { method: 'DELETE' });
  },
  getPersonDocuments(personId: string) {
    return smcrRequest(`/api/smcr/people/${personId}/documents`);
  },
  async uploadPersonDocument(personId: string, payload: { file: File; category: string; notes?: string }) {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('category', payload.category);
    if (payload.notes) formData.append('notes', payload.notes);
    return smcrRequest(`/api/smcr/people/${personId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },
  deleteDocument(documentId: string) {
    return smcrRequest(`/api/smcr/documents/${documentId}`, { method: 'DELETE' });
  },
  getTrainingItems(personId: string) {
    return smcrRequest(`/api/smcr/people/${personId}/training`);
  },
  createTrainingItems(personId: string, items: Record<string, unknown>[] | Record<string, unknown>) {
    const payload = Array.isArray(items) ? items : [items];
    return smcrRequest(`/api/smcr/people/${personId}/training`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  updateTrainingItem(personId: string, payload: Record<string, unknown>) {
    return smcrRequest(`/api/smcr/people/${personId}/training`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};
