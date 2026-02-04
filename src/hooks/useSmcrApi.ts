import useSWR from 'swr';
import { smcrApi } from '@/lib/smcr-api-client';

export function useSmcrFirms() {
  return useSWR('/api/smcr/firms', () => smcrApi.getFirms());
}

export function useSmcrPeople(firmId?: string) {
  return useSWR(firmId ? `/api/smcr/firms/${firmId}/people` : null, () => smcrApi.getPeople(firmId as string));
}

export function useSmcrRoles(firmId?: string) {
  return useSWR(firmId ? `/api/smcr/firms/${firmId}/roles` : null, () => smcrApi.getRoles(firmId as string));
}

export function useSmcrWorkflows(firmId?: string) {
  return useSWR(firmId ? `/api/smcr/firms/${firmId}/workflows` : null, () => smcrApi.getWorkflows(firmId as string));
}

export function useSmcrAssessments(firmId?: string) {
  return useSWR(firmId ? `/api/smcr/firms/${firmId}/assessments` : null, () => smcrApi.getAssessments(firmId as string));
}

export function useSmcrBreaches(firmId?: string) {
  return useSWR(firmId ? `/api/smcr/firms/${firmId}/breaches` : null, () => smcrApi.getBreaches(firmId as string));
}

export function useSmcrGroupEntities() {
  return useSWR('/api/smcr/group-entities', () => smcrApi.getGroupEntities());
}

export function useSmcrDocuments(personId?: string) {
  return useSWR(personId ? `/api/smcr/people/${personId}/documents` : null, () => smcrApi.getPersonDocuments(personId as string));
}

export function useSmcrTraining(personId?: string) {
  return useSWR(personId ? `/api/smcr/people/${personId}/training` : null, () => smcrApi.getTrainingItems(personId as string));
}
