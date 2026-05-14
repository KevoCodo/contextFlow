import { createApiClient } from "./client";

export type RetrieveMatch = {
  chunk_id: number;
  document_id: number;
  document_title?: string | null;
  chunk_text: string;
  score: number;
  metadata?: Record<string, unknown> | null;
};

export type RetrieveResponse = {
  question: string;
  matches: RetrieveMatch[];
};

export async function retrieveQuestion(payload: {
  question: string;
  top_k?: number;
}): Promise<RetrieveResponse> {
  return createApiClient().post<RetrieveResponse>("/api/retrieve", {
    question: payload.question,
    top_k: payload.top_k ?? 5,
  });
}

