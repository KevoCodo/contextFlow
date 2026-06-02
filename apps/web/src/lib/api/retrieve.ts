import { createApiClient } from "./client";

export type RetrieveMatch = {
  chunk_id: number;
  document_id: number;
  document_title?: string | null;
  source_id: number;
  source_title?: string | null;
  chunk_index: number;
  chunk_text: string;
  score: number;
  metadata?: Record<string, unknown> | null;
};

export type RetrieveResponse = {
  question: string;
  source_id?: number | null;
  top_k: number;
  matches: RetrieveMatch[];
};

export async function retrieveQuestion(payload: {
  question: string;
  top_k?: number;
  source_id?: number;
}): Promise<RetrieveResponse> {
  return createApiClient().post<RetrieveResponse>("/api/retrieve", {
    question: payload.question,
    top_k: payload.top_k ?? 5,
    source_id: payload.source_id,
  });
}
