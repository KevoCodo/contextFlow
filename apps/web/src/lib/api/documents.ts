import { createApiClient } from "./client";
import type { KnowledgeChunk, KnowledgeDocument, ListResponse } from "./types";

export async function listDocuments(params?: {
  source_id?: number;
}): Promise<ListResponse<KnowledgeDocument>> {
  const qs = params?.source_id ? `?source_id=${encodeURIComponent(params.source_id)}` : "";
  return createApiClient().get<ListResponse<KnowledgeDocument>>(`/api/documents${qs}`);
}

export async function getDocument(id: number): Promise<KnowledgeDocument> {
  return createApiClient().get<KnowledgeDocument>(`/api/documents/${id}`);
}

export async function createDocument(payload: {
  source_id: number;
  title: string;
  content: string;
}): Promise<KnowledgeDocument> {
  return createApiClient().post<KnowledgeDocument>("/api/documents", payload);
}

export async function indexDocument(id: number): Promise<{
  document: KnowledgeDocument;
  chunk_count: number;
}> {
  return createApiClient().post(`/api/documents/${id}/index`);
}

export async function listDocumentChunks(
  id: number
): Promise<ListResponse<KnowledgeChunk>> {
  return createApiClient().get<ListResponse<KnowledgeChunk>>(`/api/documents/${id}/chunks`);
}
