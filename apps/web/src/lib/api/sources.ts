import { createApiClient } from "./client";
import type { KnowledgeSource, ListResponse } from "./types";

export async function listSources(): Promise<ListResponse<KnowledgeSource>> {
  return createApiClient().get<ListResponse<KnowledgeSource>>("/api/sources");
}

export async function getSource(id: number): Promise<KnowledgeSource> {
  return createApiClient().get<KnowledgeSource>(`/api/sources/${id}`);
}

export async function createSource(payload: {
  title: string;
  description?: string;
}): Promise<KnowledgeSource> {
  return createApiClient().post<KnowledgeSource>("/api/sources", payload);
}

export async function updateSource(
  id: number,
  payload: {
    title?: string;
    description?: string | null;
  }
): Promise<KnowledgeSource> {
  return createApiClient().patch<KnowledgeSource>(`/api/sources/${id}`, payload);
}
